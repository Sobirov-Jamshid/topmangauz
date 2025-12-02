"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import Image from "next/image";
import { FullScreenLoading } from '@/components/ui/loading-spinner';

const safeRemoveChild = (parent: HTMLElement, child: HTMLElement) => {
  try {
    if (!parent || !child) {
      return false;
    }
    
    if (!parent.contains(child)) {
      return false;
    }
    
    if (child.parentNode !== parent) {
      return false;
    }
    
    parent.removeChild(child);
    return true;
  } catch (e) {
  }
  return false;
};

const safeClearContainer = (container: HTMLElement) => {
  try {
    if (!container) {
      return false;
    }
    
    if (!container.parentNode) {
      return false;
    }
    
    if (container instanceof Element) {
      container.innerHTML = '';
      return true;
    }
    
    const containerNode = container as Node;
    while (containerNode.firstChild) {
      const child = containerNode.firstChild;
      if (child && child.parentNode === containerNode) {
        containerNode.removeChild(child);
      } else {
        break; // Prevent infinite loop
      }
    }
    return true;
  } catch (e) {
  }
  return false;
};

const safeAppendChild = (parent: HTMLElement, child: HTMLElement) => {
  try {
    if (!parent || !child) {
      return false;
    }
    
    if (!parent.parentNode) {
      return false;
    }
    
    if (child.parentNode === parent) {
      return true;
    }
    
    parent.appendChild(child);
    return true;
  } catch (e) {
  }
  return false;
};

if (!Promise.withResolvers) {
  Promise.withResolvers = function<T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.3.31/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url?: string;
  images?: string[]; // Images array - agar images bo'lsa, PDF o'rniga rasmlar ko'rsatiladi
  watermark?: string;
  mode?: "vertical" | "horizontal" | "swipe";
  onPageChange?: (currentPage: number, totalPages: number) => void;
  currentPage?: number;
  autoDetectFormat?: boolean; 
  scale?: number; 
  tallContentMode?: 'fit-width' | 'fit-height'; 
  brightness?: number; 
  containerWidth?: number;
  showNavigation?: boolean;
  renderAllPages?: boolean; // Barcha sahifalarni birdan ko'rsatish
  onScroll?: (scrollTop: number) => void; // Scroll event uchun callback
}

export default function PdfViewer({ 
  url, 
  images,
  watermark, 
  mode = "vertical",
  onPageChange,
  currentPage: externalCurrentPage,
  autoDetectFormat = true,
  scale: externalScale,
  tallContentMode: externalTallContentMode,
  brightness: externalBrightness,
  containerWidth: externalContainerWidth,
  showNavigation = true,
  renderAllPages = false,
  onScroll
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const allPagesContainerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number>(0);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [allPagesRendered, setAllPagesRendered] = useState(false);
  const [previousRenderAllPages, setPreviousRenderAllPages] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [detectedFormat, setDetectedFormat] = useState<'landscape' | 'portrait' | 'square' | null>(null);
  const [tallContentMode, setTallContentMode] = useState<'fit-width' | 'fit-height'>('fit-width');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const renderTaskRef = useRef<any>(null);
  const isRenderingRef = useRef(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Mobile detection - dynamic
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Agar images bo'lsa, PDF o'rniga images ishlatish
  const hasImages = images && Array.isArray(images) && images.length > 0;
  const imagePages = hasImages ? images.length : 0;

  // Reset loaded images when images array changes
  useEffect(() => {
    if (hasImages) {
      setLoadedImages(new Set());
      setCurrent(0);
    }
  }, [images?.length, hasImages]);

  // Oxirgi sahifada ekanligini tekshirish
  const isLastPage = hasImages ? current === images.length - 1 : current === pages - 1;

  // Keyingi/Oldingi bob tugmasi uchun handler
  const handleChapterNavigation = () => {
    if (isLastPage) {
      // Oxirgi sahifada - Oldingi bobga o'tish
      const event = new CustomEvent('previousChapter');
      window.dispatchEvent(event);
    } else {
      // Oxirgi sahifa emas - Keyingi bobga o'tish
      const event = new CustomEvent('nextChapter');
      window.dispatchEvent(event);
    }
  };

  // Keyingi/Oldingi bob tugmasi matni
  const chapterButtonText = isLastPage ? "Oldingi bob ←" : "Keyingi bob →";

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (mode !== 'swipe') return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (mode !== 'swipe') return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (mode !== 'swipe' || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && current < pages - 1) {
      const newCurrent = current + 1;
      setCurrent(newCurrent);
      if (onPageChange) {
        onPageChange(newCurrent, pages);
      }
    }
    if (isRightSwipe && current > 0) {
      const newCurrent = current - 1;
      setCurrent(newCurrent);
      if (onPageChange) {
        onPageChange(newCurrent, pages);
      }
    }
  };

  useEffect(() => {
    if (externalCurrentPage !== undefined && pages > 0) {
      if (externalCurrentPage !== current && externalCurrentPage >= 0 && externalCurrentPage < pages) {
        setCurrent(externalCurrentPage);
      }
    }
  }, [externalCurrentPage, pages]);

  useEffect(() => {
    if (externalScale !== undefined && externalScale !== scale) {
      setScale(externalScale);
    }
  }, [externalScale]);

  useEffect(() => {
    if (externalTallContentMode !== undefined && externalTallContentMode !== tallContentMode) {
      setTallContentMode(externalTallContentMode);
    }
  }, [externalTallContentMode]);

  useEffect(() => {
    if (pdfDocument && pages > 0 && !loading && !isInitialLoad && !isRenderingRef.current) {
      const renderCurrentPage = async () => {
        try {
          if (mode === 'swipe') {
            // Swipe rejimida container'ni tozalab, faqat joriy sahifani render qilish
            const container = containerRef.current;
            if (container) {
              safeClearContainer(container);
            }
          }
          await renderPage(pdfDocument, current + 1);
        } catch (error) {
        }
      };
      renderCurrentPage();
    }
  }, [current, pages, loading, pdfDocument, scale, tallContentMode, mode, isInitialLoad]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'S')) ||
        e.key === 'PrintScreen' ||
        e.key === 'F11'
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
      }
    };

    const style = document.createElement('style');
    style.textContent = `
      .pdf-viewer-container {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        position: relative;
      }
      .pdf-viewer-container canvas {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        pointer-events: none;
        display: block;
        margin: 0 auto;
        max-width: 100%;
        max-height: 100%;
        height: auto;
        width: auto;
        object-fit: contain;
      }
      @media (max-width: 767px) {
        .pdf-viewer-container img,
        .pdf-viewer-container picture,
        .pdf-viewer-container span,
        .pdf-viewer-container div[style*="display: block"],
        .pdf-viewer-container > div > div,
        .pdf-viewer-container > div > div > span,
        .pdf-viewer-container > div > div > picture,
        .pdf-viewer-container > div > div > div {
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          line-height: 0 !important;
          font-size: 0 !important;
          vertical-align: top !important;
          gap: 0 !important;
        }
        .pdf-viewer-container > div {
          gap: 0 !important;
          row-gap: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Ensure button and text elements are visible */
        .pdf-viewer-container button,
        .pdf-viewer-container p,
        .pdf-viewer-container div[class*="max-w-md"] {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
      }
      @media print {
        .pdf-viewer-container {
          display: none !important;
        }
        body {
          display: none !important;
        }
      }
      iframe {
        display: none !important;
      }
      body.pdf-active {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      .pdf-viewer-container * {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
    `;
    document.head.appendChild(style);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.body.classList.add('pdf-active');

    const originalPrint = window.print;
    window.print = () => {
      return false;
    };

    const preventScreenCapture = () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = () => {
          throw new Error('Screen capture blocked for security');
        };
      }
      
      if ((navigator as any).getDisplayMedia) {
        (navigator as any).getDisplayMedia = () => {
          throw new Error('Screen capture blocked for security');
        };
      }
      
      if ((navigator as any).webkitGetDisplayMedia) {
        (navigator as any).webkitGetDisplayMedia = () => {
          throw new Error('Screen capture blocked for security');
        };
      }
    };

    preventScreenCapture();

    if (navigator.mediaDevices?.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = () => {
        return Promise.reject(new Error('Screen capture is not allowed'));
      };
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (style && style.parentNode && document.head.contains(style)) {
        safeRemoveChild(document.head, style);
      }
      
      document.body.classList.remove('pdf-active');
      window.print = originalPrint;
    };
  }, []);

  useEffect(() => {
    // Agar images bo'lsa, PDF yuklashni o'tkazib yuborish
    if (hasImages) {
      setLoading(false);
      setPages(imagePages);
      setError(null);
      if (onPageChange) {
        onPageChange(0, imagePages);
      }
      setIsInitialLoad(false);
      return;
    }
    
    let cancelled = false;
    const render = async () => {
      const startTime = performance.now();
      
      try {
        setLoading(true);
        setError(null);
        
        if (!url || url.trim() === '') {
          throw new Error("PDF URL ko'rsatilmagan");
        }

        let decodedUrl = url;
        try {
          decodedUrl = decodeURIComponent(url);
        } catch (e) {
        }

        const isBlobUrl = decodedUrl.startsWith('blob:');

        let pdf;
        
        if (isBlobUrl) {
          setLoadingProgress(40);
          pdf = await pdfjs.getDocument({
            url: decodedUrl,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/cmaps/',
            cMapPacked: true,
            disableAutoFetch: false,
            disableStream: false,
            disableRange: false,
            withCredentials: false,
            maxImageSize: 4096 * 4096,
            isEvalSupported: false,
            useSystemFonts: false,
            verbosity: 0,
            stopAtErrors: false
          }).promise;
          setLoadingProgress(80);
        } else {
         try {
           setLoadingProgress(20);
           const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(decodedUrl)}`;
           
           const fetchStartTime = performance.now();
           const response = await fetch(proxyUrl, {
             method: 'GET',
             headers: {
               'Accept': 'application/pdf,*/*',
               'Cache-Control': 'no-cache',
               'Pragma': 'no-cache'
             }
           });
           
           if (!response.ok) {
             throw new Error(`Proxy HTTP ${response.status}: ${response.statusText}`);
           }
           
           setLoadingProgress(40);
           const arrayBuffer = await response.arrayBuffer();
           setLoadingProgress(60);
           pdf = await pdfjs.getDocument({
             data: arrayBuffer,
             cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/cmaps/',
             cMapPacked: true,
             disableAutoFetch: false,
             disableStream: false,
             disableRange: false,
             withCredentials: false,
             maxImageSize: 4096 * 4096,
             isEvalSupported: false,
             useSystemFonts: false,
             verbosity: 0,
             stopAtErrors: false
           }).promise;
           setLoadingProgress(80);
         } catch (proxyError) {
           
           try {
             setLoadingProgress(30);
             pdf = await pdfjs.getDocument({
               url: decodedUrl,
               cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/cmaps/',
               cMapPacked: true,
               disableAutoFetch: false,
               disableStream: false,
               disableRange: false,
               withCredentials: false,
               maxImageSize: 4096 * 4096,
               isEvalSupported: false,
               useSystemFonts: false,
               verbosity: 0,
               stopAtErrors: false
           }).promise;
           setLoadingProgress(70);
         } catch (directError) {
             
             try {
               setLoadingProgress(40);
               const response = await fetch(decodedUrl, {
                 mode: 'cors',
                 credentials: 'omit',
                 headers: {
                   'Accept': 'application/pdf,*/*',
                   'Cache-Control': 'no-cache'
                 }
               });
               
               if (!response.ok) {
                 throw new Error(`HTTP ${response.status}`);
               }
               
               setLoadingProgress(60);
               const arrayBuffer = await response.arrayBuffer();
               
               pdf = await pdfjs.getDocument({
                 data: arrayBuffer,
                 cMapUrl: 'https://unpkg.com/pdfjs-dist@5.3.31/cmaps/',
                 cMapPacked: true,
                 maxImageSize: 4096 * 4096
               }).promise;
               setLoadingProgress(75);
             } catch (fetchError) {
               throw proxyError;
             }
           }
         }
        }
        
        if (cancelled) return;
        
        setPages(pdf.numPages);
        setPdfDocument(pdf);
        
        if (onPageChange) {
          onPageChange(0, pdf.numPages);
        }
        
        if (isInitialLoad || current === 0) {
          if (mode === 'swipe') {
            await renderPage(pdf, current + 1);
          } else {
            const INITIAL_PAGES = 5;
            const pagesToRender = Math.min(INITIAL_PAGES, pdf.numPages);
            
            for (let i = 1; i <= pagesToRender; i++) {
              if (cancelled) break;
              await renderPage(pdf, i);
            }
            
            const remainingPages = pdf.numPages - pagesToRender;
            if (remainingPages > 0) {
              
              for (let i = pagesToRender + 1; i <= pdf.numPages; i++) {
                if (cancelled) break;
                const placeholder = document.createElement('div');
                placeholder.setAttribute('data-page', i.toString());
                placeholder.style.height = '800px';
                placeholder.style.width = '600px';
                placeholder.style.margin = '0 auto 8px auto';
                placeholder.style.backgroundColor = '#f5f5f5';
                placeholder.style.display = 'flex';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.color = '#999';
                placeholder.textContent = `Page ${i} - Loading...`;
                containerRef.current?.appendChild(placeholder);
              }
            }
          }
        }
        
        if (!cancelled) {
          setLoadingProgress(100);
          setLoading(false);
          setIsInitialLoad(false);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          
          let errorMessage = "PDF-ni yuklashda xatolik";
          
          if (e instanceof Error) {
           if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
             errorMessage = "Internet aloqasi xatosi. Iltimos, ulanishni tekshiring va sahifani yangilang.";
           } else if (e.name === 'InvalidPDFException') {
             errorMessage = "PDF fayl noto'g'ri formatda yoki buzilgan";
           } else if (e.name === 'MissingPDFException') {
             errorMessage = "PDF fayl topilmadi yoki o'chirilgan";
           } else if (e.message?.includes('CORS')) {
             errorMessage = "PDF faylga kirishda xatolik. Proxy server ishlamayapti.";
           } else if (e.message?.includes('HTTP 404')) {
             errorMessage = "PDF fayl topilmadi (404). URL noto'g'ri bo'lishi mumkin.";
           } else if (e.message?.includes('HTTP 403')) {
             errorMessage = "PDF faylga kirish taqiqlangan (403). Ruxsat yo'q.";
           } else if (e.message?.includes('HTTP 500')) {
             errorMessage = "Server xatosi (500). Keyinroq urinib ko'ring.";
           } else if (e.message?.includes('timeout')) {
             errorMessage = "PDF yuklash vaqti tugadi. Internet aloqasini tekshiring.";
           } else if (e.message) {
             errorMessage = `Xatolik: ${e.message}`;
           }
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      }
    };
    render();
    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [url, mode, retryCount]);

  const renderPage = async (pdf: any, pageNumber: number) => {
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {}
    }
    
    if (isRenderingRef.current) {
      return;
    }
    
    isRenderingRef.current = true;
    
    try {
      const page = await pdf.getPage(pageNumber);
      
      const container = containerRef.current;
      if (!container) {
        isRenderingRef.current = false;
        return;
      }

      if (mode !== 'vertical' || renderedPages.has(pageNumber)) {
        safeClearContainer(container);
      }
      
      const isMobile = window.innerWidth < 768;
      
      // Get original PDF page dimensions at scale 1.0
      const originalViewport = page.getViewport({ scale: 1.0 });
      
      // Desktop: 600px width, Mobile: full width
      const targetWidth = isMobile ? window.innerWidth : 600;
      
      // Calculate scale to fit target width while maintaining quality
      // Use higher scale (2.0 or 3.0) for better quality on high-DPI screens
      const baseScale = targetWidth / originalViewport.width;
      
      // Apply user's scale preference
      let renderScale = baseScale * scale;
      
      // Use device pixel ratio for sharp rendering on retina displays
      // Render at 2x-3x resolution for maximum quality
      const qualityMultiplier = Math.max(window.devicePixelRatio || 1, 2);
      const finalScale = renderScale * qualityMultiplier;
      
      const viewport = page.getViewport({ scale: finalScale });
      
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { 
        alpha: false, 
        willReadFrequently: false,
        desynchronized: true
      });
      
      if (!context) {
        throw new Error("Canvas context olinmadi");
      }
      
      // Set canvas size to full quality render size
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // CSS display size - maintain aspect ratio
      const displayWidth = Math.round(viewport.width / qualityMultiplier);
      const displayHeight = Math.round(viewport.height / qualityMultiplier);
      
      // Apply responsive styling
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto 8px auto';
      canvas.style.backgroundColor = '#ffffff';
      canvas.style.borderRadius = '4px';
      canvas.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      canvas.style.border = '1px solid #ddd';
      
      // Critical: Use 'auto' for image-rendering to maintain quality
      canvas.style.imageRendering = 'auto';
      
      if (isMobile) {
        // Mobile: full width
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.maxWidth = '100vw';
      } else {
        // Desktop: 600px centered
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        canvas.style.maxWidth = '600px';
      }
      
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      canvas.style.pointerEvents = 'none';
      canvas.setAttribute('data-page', pageNumber.toString());
      
      canvas.toBlob = () => null;
      canvas.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      context.getImageData = () => {
        throw new Error('Image data access blocked');
      };
      
      const renderTask = page.render({ 
        canvasContext: context, 
        viewport: viewport,
        intent: 'display',
        enableWebGL: false,
        renderInteractiveForms: false
      });
      
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      
      if (watermark && context) {
        context.save();
        context.globalAlpha = 0.15;
        context.font = `${Math.max(12, viewport.width / 30)}px Arial`;
        context.fillStyle = "rgba(255, 153, 0, 1)";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.translate(viewport.width / 2, viewport.height / 2);
        context.rotate(-Math.PI / 12);
        context.fillText(watermark, 0, 0);
        context.restore();
      }
      
      if (container && canvas && container.parentNode) {
        if (mode === 'swipe') {
          safeAppendChild(container, canvas);
        } else {
          safeAppendChild(container, canvas);
          setRenderedPages(prev => new Set(prev).add(pageNumber));
        }
      }
      
      isRenderingRef.current = false;
      renderTaskRef.current = null;
      
    } catch (e: any) {
      isRenderingRef.current = false;
      if (e.name !== 'RenderingCancelledException') {
      }
    }
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.key === "ArrowRight" && current < pages - 1) {
      e.preventDefault();
      const newCurrent = current + 1;
      setCurrent(newCurrent);
      if (onPageChange) {
        onPageChange(newCurrent, pages);
      }
    }
    if (e.key === "ArrowLeft" && current > 0) {
      e.preventDefault();
      const newCurrent = current - 1;
      setCurrent(newCurrent);
      if (onPageChange) {
        onPageChange(newCurrent, pages);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, pages, onPageChange]);

  // Scroll rejimida sahifa o'zgarishini kuzatish - oddiy scroll event
  useEffect(() => {
    if (mode !== 'vertical' || !onPageChange || pages === 0) return;

    
    let lastReportedPage = -1;
    
    const checkScrollPosition = () => {
      const container = containerRef.current;
      if (!container) return;

      const canvases = container.querySelectorAll('canvas');
      if (canvases.length === 0) return;

      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = scrollY + windowHeight;
      
      // Agar scroll eng pastda bo'lsa (oxirgi 100px ichida)
      const isAtBottom = documentHeight - scrollBottom < 100;
      
      if (isAtBottom && canvases.length === pages) {
        // Oxirgi sahifaga yetdik
        const lastPage = pages - 1;
        if (lastReportedPage !== lastPage) {
          lastReportedPage = lastPage;
          onPageChange(lastPage, pages);
          setCurrent(lastPage);
        }
        return;
      }
      
      // Aks holda, eng ko'p ko'rinayotgan canvasni topish
      let maxVisiblePage = 0;
      let maxVisibleArea = 0;
      
      canvases.forEach((canvas, index) => {
        const rect = canvas.getBoundingClientRect();
        
        // Canvas ekranda qanchalik ko'rinayotganini hisoblash
        const visibleTop = Math.max(0, rect.top);
        const visibleBottom = Math.min(windowHeight, rect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibleArea = visibleHeight * rect.width;
        
        if (visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          maxVisiblePage = index;
        }
      });
      
      // Boshqa sahifalarda onPageChange ni chaqirmaslik - faqat oxirgi sahifada
    };

    // Throttled scroll handler
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkScrollPosition, 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check with delay
    setTimeout(checkScrollPosition, 3000);
    
    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [mode, pages, onPageChange]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (pdfDocument && pages > 0 && !loading && !isInitialLoad && !isRenderingRef.current) {
          renderPage(pdfDocument, current + 1);
        }
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [pdfDocument, pages, loading, current, scale, tallContentMode, isInitialLoad]);

  useEffect(() => {
    if (!pdfDocument || mode !== 'vertical' || pages === 0) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute('data-page') || '0');
          if (pageNum > 0 && !renderedPages.has(pageNum)) {
            renderPage(pdfDocument, pageNum);
            setRenderedPages(prev => new Set(prev).add(pageNum));
          }
        }
      });
    }, {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    });

    const pageElements = container.querySelectorAll('[data-page]');
    pageElements.forEach(el => observer.observe(el));

    return () => {
      pageElements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [pdfDocument, pages, mode, renderedPages]);

  // Rejim o'zgar destruction ida tozalash
  useEffect(() => {
    if (renderAllPages !== previousRenderAllPages) {
      setAllPagesRendered(false);
      setPreviousRenderAllPages(renderAllPages);
      
      // Agar renderAllPages false bo'lsa, container'ni tozalash
      if (!renderAllPages && allPagesContainerRef.current) {
        allPagesContainerRef.current.innerHTML = '';
      }
    }
  }, [renderAllPages, previousRenderAllPages]);


  // Barcha sahifalarni render qilish
  useEffect(() => {
    if (!renderAllPages || !pdfDocument || pages === 0 || loading || allPagesRendered) return;

    const renderAllPagesFunc = async () => {
      const container = allPagesContainerRef.current;
      if (!container) return;

      container.innerHTML = ''; // Oldingi canvaslarni tozalash

      // Tez rendering - 5 ta sahifani parallel render qilish
      const batchSize = 5;
      const batches = [];
      
      for (let i = 1; i <= pages; i += batchSize) {
        batches.push(
          Array.from({ length: Math.min(batchSize, pages - i + 1) }, (_, idx) => i + idx)
        );
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map(async (pageNum) => {
          try {
            const page = await pdfDocument.getPage(pageNum);
            const isMobile = window.innerWidth < 768;
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', {
              alpha: false,
              willReadFrequently: false,
              desynchronized: true
            });
            if (!context) return null;

            // Get original dimensions
            const originalViewport = page.getViewport({ scale: 1.0 });
            
            // Desktop: 600px, Mobile: full width
            const targetWidth = isMobile ? window.innerWidth : 600;
            const baseScale = targetWidth / originalViewport.width;
            
            // Apply user scale
            let renderScale = baseScale * (externalScale || 1.0);
            
            // High quality rendering with device pixel ratio
            const qualityMultiplier = Math.max(window.devicePixelRatio || 1, 2);
            const finalScale = renderScale * qualityMultiplier;
            
            const viewport = page.getViewport({ scale: finalScale });
            
            // Canvas size at full quality
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // Display size
            const displayWidth = Math.round(viewport.width / qualityMultiplier);
            const displayHeight = Math.round(viewport.height / qualityMultiplier);
            
            // Responsive styling
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto 8px auto';
            canvas.style.backgroundColor = '#ffffff';
            canvas.style.borderRadius = '4px';
            canvas.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            canvas.style.border = '1px solid #ddd';
            canvas.style.imageRendering = 'auto';
            
            if (isMobile) {
              canvas.style.width = '100%';
              canvas.style.height = 'auto';
              canvas.style.maxWidth = '100vw';
            } else {
              canvas.style.width = displayWidth + 'px';
              canvas.style.height = displayHeight + 'px';
              canvas.style.maxWidth = '600px';
            }

            // Render with high quality
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
              intent: 'display',
              enableWebGL: false,
              renderInteractiveForms: false,
              textLayer: false,
              annotationLayer: false
            };

            await page.render(renderContext).promise;

            // Watermark qo'shish (faqat kerak bo'lsa)
            if (watermark) {
              context.save();
              context.globalAlpha = 0.3;
              context.font = `${Math.max(12, viewport.width / 30)}px Arial`;
              context.fillStyle = 'rgba(255, 153, 0, 0.3)';
              context.textAlign = 'center';
              context.textBaseline = 'middle';
              context.translate(viewport.width / 2, viewport.height / 2);
              context.rotate(-Math.PI / 6);
              context.fillText(watermark, 0, 0);
              context.restore();
            }

            return { canvas, pageNum };
          } catch (err) {
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        // Natijalarni tartibda qo'shish
        batchResults
          .filter(result => result !== null)
          .sort((a, b) => a.pageNum - b.pageNum)
          .forEach(result => {
            container.appendChild(result.canvas);
          });

        // Progress yangilash
        setRenderProgress(Math.round(((batchIndex + 1) / batches.length) * 100));
        
        // UI'ni yangilash uchun qisqa pauza - tezroq
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      setAllPagesRendered(true);
      
      // PDF oxirida "Keyingi bob" tugmasini qo'shish
      if (pages > 0) {
        const nextChapterButton = document.createElement('div');
        nextChapterButton.className = 'w-full max-w-md mx-auto mt-8 mb-8 bg-[#121212] border border-[#1a1a1a] rounded-lg p-6 text-center shadow-xl';
        nextChapterButton.innerHTML = `
          <p class="text-white font-medium mb-4 text-lg">Bob tugadi!</p>
          <button id="next-chapter-btn" class="px-8 py-3 bg-[#ff9900] hover:bg-[#ff6600] text-white rounded-md font-medium transition-colors shadow-lg">
            Keyingi bob →
          </button>
        `;
        
        container.appendChild(nextChapterButton);
        
        // Tugma bosilganda event yuborish
        const btn = nextChapterButton.querySelector('#next-chapter-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            const event = new CustomEvent('nextChapter');
            window.dispatchEvent(event);
          });
        }
      }
    };

    renderAllPagesFunc();
  }, [renderAllPages, pdfDocument, pages, loading, watermark, externalScale, allPagesRendered]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white p-8 bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold mb-2 text-white">PDF yuklanmadi</h3>
          <p className="text-gray-300 mb-6 text-sm leading-relaxed">{error}</p>
          <div className="space-y-4">
            <button 
              onClick={handleRetry}
              className="px-6 py-3 bg-[#ff9900] text-white rounded-lg hover:bg-[#ff8800] transition-colors font-medium shadow-lg"
            >
              Qayta urinish ({retryCount + 1})
            </button>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="font-medium mb-2">Muammo hal bo'lmagan bo'lsa:</p>
              <p>• Internet aloqasini tekshiring</p>
              <p>• Sahifani yangilang (Ctrl+R)</p>
              <p>• Keyinroq urinib ko'ring</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="pdf-viewer-container w-full h-full flex flex-col bg-black relative"
      style={{
        filter: `brightness(${externalBrightness || 100}%)`,
        width: isMobile ? '100vw' : `${externalContainerWidth || 100}%`, // Mobile'da doim 100vw
        maxWidth: isMobile ? '100vw' : 'none',
        margin: isMobile ? '0' : '0 auto',
        padding: '0',
        position: 'relative',
        boxSizing: 'border-box',
        left: isMobile ? '0' : 'auto',
        right: isMobile ? '0' : 'auto'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        ref={hasImages && mode === 'swipe' ? undefined : containerRef}
        className={`flex-1 ${hasImages && mode === 'swipe' ? 'overflow-hidden' : 'overflow-auto'} ${hasImages && mode === 'swipe' ? '' : 'pb-10'} hide-scrollbar`} 
        style={{ 
          height: hasImages && mode === 'swipe' ? (isMobile ? '100vh' : '100%') : 'auto',
          minHeight: hasImages && mode === 'swipe' ? (isMobile ? '100vh' : '100%') : 'calc(100vh - 80px)',
          overflowY: hasImages && mode === 'swipe' ? 'hidden' : 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          width: isMobile ? '100vw' : '100%',
          maxWidth: isMobile ? '100vw' : '100%',
          boxSizing: 'border-box',
          margin: '0',
          padding: '0'
        }}
        onScroll={(e) => {
          if (onScroll && !(hasImages && mode === 'swipe')) {
            const target = e.target as HTMLElement;
            const scrollTop = target.scrollTop || window.pageYOffset || document.documentElement.scrollTop;
            onScroll(scrollTop);
          }
        }}
      >
        {hasImages ? (
          // Images render qilish - mode ga qarab
          mode === 'swipe' ? (
            // Swipe mode (Sahifa-Sahifa) - bir vaqtning o'zida bitta sahifa
            <div 
              className="w-full h-full relative"
              style={{ 
                height: isMobile ? '100vh' : '100%',
                width: isMobile ? '100vw' : '100%',
                maxWidth: isMobile ? '100vw' : '100%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
                backgroundColor: '#000000', // Black background for swipe mode
                boxSizing: 'border-box',
                margin: '0',
                padding: '0',
                left: isMobile ? '0' : 'auto',
                right: isMobile ? '0' : 'auto'
              }}
            >
              {images.map((imageUrl, idx) => (
                <div
                  key={`swipe-image-${idx}`}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-300 hide-scrollbar ${
                    idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                  style={{ 
                    display: 'flex', // Always flex - no display none for better mobile compatibility
                    flexDirection: 'column',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none', /* IE and Edge */
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#000000' // Always black background for consistency
                  }}
                >
                  <div 
                    className="w-full flex flex-col"
                    style={{
                      padding: isMobile ? '0' : '10px',
                      paddingTop: isMobile ? '0' : '10px',
                      paddingBottom: isMobile ? '10px' : '20px',
                      paddingLeft: isMobile ? '0' : '10px',
                      paddingRight: isMobile ? '0' : '10px',
                      position: 'relative',
                      width: '100%',
                      maxWidth: '100%',
                      height: '100%',
                      justifyContent: 'flex-start',
                      alignItems: isMobile ? 'stretch' : 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div 
                      className="relative"
                      style={{
                        width: isMobile ? '100%' : '98%',
                        maxWidth: isMobile ? '100vw' : '98%',
                        display: 'flex',
                        justifyContent: isMobile ? 'stretch' : 'center',
                        alignItems: 'stretch',
                        backgroundColor: '#ffffff',
                        borderRadius: isMobile ? '0' : '4px',
                        boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: isMobile ? 'none' : '1px solid #ddd',
                        padding: '0',
                        margin: '0',
                        marginLeft: isMobile ? '0' : 'auto',
                        marginRight: isMobile ? '0' : 'auto',
                        marginBottom: isMobile ? '10px' : '20px',
                        flexShrink: 0,
                        boxSizing: 'border-box'
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Page ${idx + 1}`}
                        width={1200}
                        height={1600}
                        className={isMobile ? "w-full h-auto" : "w-full h-auto object-contain"}
                        style={{
                          display: 'block',
                          margin: '0',
                          padding: '0',
                          width: isMobile ? '100%' : 'auto',
                          maxWidth: isMobile ? '100%' : '100%',
                          minWidth: isMobile ? '100%' : 'auto',
                          height: 'auto',
                          backgroundColor: loadedImages.has(idx) ? '#ffffff' : '#000000', // White when loaded, black while loading
                          borderRadius: isMobile ? '0' : '4px',
                          imageRendering: 'auto',
                          objectFit: 'contain',
                          opacity: idx === current && loadedImages.has(idx) ? 1 : (idx === current ? 0.3 : 0), // Show loading state
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                        unoptimized
                        priority={idx === current || idx === current + 1 || idx === current - 1} // Load current, prev, and next
                        onLoad={() => {
                          // Mark image as loaded
                          setLoadedImages(prev => new Set(prev).add(idx));
                        }}
                        onError={(e) => {
                          // Handle image load error
                          // console.error(`Failed to load image ${idx + 1}:`, imageUrl);
                          const target = e.target as HTMLImageElement;
                          if (target) {
                            target.style.backgroundColor = '#1a1a1a';
                            target.alt = `Failed to load page ${idx + 1}`;
                          }
                        }}
                      />
                    </div>
                    
                    {/* Navigation buttons - Rasmdan keyin darhol */}
                    <div 
                      className="w-full flex items-center justify-center px-2 sm:px-4"
                      style={{
                        minHeight: '50px',
                        pointerEvents: 'auto',
                        zIndex: 99999,
                        marginTop: isMobile ? '10px' : '20px',
                        marginBottom: isMobile ? '10px' : '0',
                        position: 'relative',
                        width: '100%',
                        flexShrink: 0
                      }}
                    >
                      <div 
                        className="flex items-center justify-center gap-2 sm:gap-3 bg-black/95 backdrop-blur-md px-2 sm:px-4 py-2 sm:py-3 rounded-full shadow-2xl border border-[#333]"
                        style={{
                          minHeight: '50px',
                          width: isMobile ? 'calc(100% - 16px)' : '100%',
                          maxWidth: isMobile ? 'none' : '28rem'
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (current > 0) {
                              const newCurrent = current - 1;
                              setCurrent(newCurrent);
                              if (onPageChange) {
                                onPageChange(newCurrent, images.length);
                              }
                            }
                          }}
                          disabled={current === 0}
                          className="px-2 sm:px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 sm:gap-2 flex-shrink-0"
                          title="Oldingi sahifa"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Oldingi</span>
                        </button>
                        
                        {/* Sahifa ko'rsatkich */}
                        <div className="text-white text-xs sm:text-sm font-medium px-2 sm:px-3 flex-shrink-0">
                          {current + 1} / {images.length}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (current < images.length - 1) {
                              const newCurrent = current + 1;
                              setCurrent(newCurrent);
                              if (onPageChange) {
                                onPageChange(newCurrent, images.length);
                              }
                            } else {
                              // Oxirgi sahifada - keyingi bobga o'tish
                              const event = new CustomEvent('nextChapter');
                              window.dispatchEvent(event);
                            }
                          }}
                          className="px-2 sm:px-4 py-2 bg-[#ff9900] hover:bg-[#ff6600] text-white rounded-lg transition-all flex items-center gap-1 sm:gap-2 flex-shrink-0"
                          title={current < images.length - 1 ? "Keyingi sahifa" : "Keyingi bob"}
                        >
                          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Keyingi</span>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Vertical mode (Barchasi birdan!!) - barcha sahifalar bir vaqtda
            <>
              <div 
                className="w-full min-h-full"
                style={{ 
                  minHeight: 'calc(100vh - 60px)',
                  maxWidth: '100%',
                  width: '100%',
                  padding: '0',
                  margin: '0',
                  display: 'block',
                  lineHeight: '0',
                  fontSize: '0'
                }}
              >
                {images.map((imageUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'block',
                      margin: '0',
                      padding: '0',
                      width: '100%',
                      maxWidth: '100%',
                      minWidth: '100%',
                      lineHeight: '0',
                      fontSize: '0',
                      verticalAlign: 'top'
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Page ${idx + 1}`}
                      width={1200}
                      height={1600}
                      className="w-full h-auto object-contain"
                      style={{
                        display: 'block',
                        margin: '0',
                        padding: '0',
                        backgroundColor: '#ffffff',
                        borderRadius: isMobile ? '0' : '4px',
                        boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: isMobile ? 'none' : '1px solid #ddd',
                        imageRendering: 'auto',
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: '100%',
                        verticalAlign: 'top',
                        lineHeight: '0',
                        fontSize: '0'
                      }}
                      unoptimized
                      priority={idx < 3}
                    />
                  </div>
                ))}
              </div>
              
              {/* Oxirgi sahifada "Keyingi bob" tugmasini qo'shish - alohida container */}
              {images.length > 0 && (
                <div 
                  className="w-full max-w-md mx-auto mt-8 mb-8 bg-[#121212] border border-[#1a1a1a] rounded-lg p-6 text-center shadow-xl"
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.5',
                    position: 'relative',
                    zIndex: 10
                  }}
                >
                  <p className="text-white font-medium mb-4 text-lg" style={{ fontSize: '18px', lineHeight: '1.5', color: '#ffffff' }}>Bob tugadi!</p>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('nextChapter');
                      window.dispatchEvent(event);
                    }}
                    className="px-8 py-3 bg-[#ff9900] hover:bg-[#ff6600] text-white rounded-md font-medium transition-colors shadow-lg"
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.5',
                      color: '#ffffff',
                      fontWeight: '500'
                    }}
                  >
                    Keyingi bob →
                  </button>
                </div>
              )}
            </>
          )
        ) : renderAllPages ? (
          <div className="w-full min-h-full flex flex-col items-center justify-center p-0 relative">
            {!allPagesRendered && pages > 0 && (
              <FullScreenLoading />
            )}
            <div 
              ref={allPagesContainerRef} 
              className="w-full min-h-full flex flex-col items-center justify-center"
              style={{ 
                minHeight: 'calc(100vh - 60px)',
                maxWidth: '100%', // To'liq width
                width: '100%',
                paddingBottom: '60px' // Tugma uchun joy qoldiramiz
              }}
            />
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className={`w-full min-h-full flex ${mode === 'swipe' ? 'items-center justify-center' : 'flex-col items-center justify-center'} p-0`}
            style={{ 
              minHeight: 'calc(100vh - 60px)',
              maxWidth: '100%',
              width: '100%'
            }}
          />
        )}
      </div>
      
      {showNavigation && pages > 0 && !loading && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-700 shadow-2xl z-40">
          <div className="flex items-center justify-center p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => {
                  if (current > 0) {
                    const newCurrent = current - 1;
                    setCurrent(newCurrent);
                    if (onPageChange) {
                      onPageChange(newCurrent, pages);
                    }
                  }
                }}
                disabled={current === 0}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white transition-all duration-200 text-sm sm:text-base rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#2a2a2a] font-medium shadow-lg"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Oldingi</span>
              </button>
              
              <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl shadow-lg border border-gray-600">
                <span className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                  {current + 1} / {pages}
                </span>
              </div>
              
              <button 
                onClick={() => {
                  if (current < pages - 1) {
                    const newCurrent = current + 1;
                    setCurrent(newCurrent);
                    if (onPageChange) {
                      onPageChange(newCurrent, pages);
                    }
                  }
                }}
                disabled={current === pages - 1}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#ff9900] hover:bg-[#ff8800] text-white transition-all duration-200 text-sm sm:text-base rounded-xl disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#ff9900] font-medium shadow-lg"
              >
                <span>Keyingi</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="text-center">
            {/* Main Loading Spinner */}
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto relative">
                <div className="absolute inset-0 border-4 border-[#ff9900]/30 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-[#ff9900]/20 border-b-transparent rounded-full animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/images/icon.png"
                    alt="TopManga Icon"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-contain animate-pulse"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Simple Progress Bar */}
            <div className="w-64 bg-gray-800/50 rounded-full h-2 mb-4 overflow-hidden border border-gray-700">
              <div 
                className="bg-gradient-to-r from-[#ff9900] to-[#ffaa00] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            {/* Progress Percentage */}
            <div className="text-[#ff9900] font-bold text-lg">
              {loadingProgress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}