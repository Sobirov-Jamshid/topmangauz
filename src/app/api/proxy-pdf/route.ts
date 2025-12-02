import { NextRequest, NextResponse } from 'next/server';

const pdfCache = new Map<string, { data: ArrayBuffer; timestamp: number; contentType: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get('url');

  if (!pdfUrl) {
    return NextResponse.json({ error: 'PDF URL is required' }, { status: 400 });
  }

  try {
    new URL(pdfUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid PDF URL format' }, { status: 400 });
  }

  try {
    
    const cached = pdfCache.get(pdfUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return new NextResponse(cached.data, {
        headers: {
          'Content-Type': cached.contentType,
          'Content-Disposition': 'inline; filename="protected.pdf"',
          'Content-Security-Policy': "default-src 'none'; script-src 'none'; object-src 'none';",
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-Download-Options': 'noopen',
          'Cache-Control': 'public, max-age=300', // 5 minutes cache
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(pdfUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,application/octet-stream,*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'cross-site',
            'Upgrade-Insecure-Requests': '1',
          },
          signal: AbortSignal.timeout(45000), // 45 second timeout for better reliability
          redirect: 'follow',
          referrerPolicy: 'no-referrer',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('Content-Type') || 'application/pdf';
        const contentLength = response.headers.get('Content-Length');
        
        const arrayBuffer = await response.arrayBuffer();
        
        pdfCache.set(pdfUrl, {
          data: arrayBuffer,
          timestamp: Date.now(),
          contentType
        });

        if (pdfCache.size > 50) {
          const entries = Array.from(pdfCache.entries());
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
          for (let i = 0; i < 10; i++) {
            pdfCache.delete(entries[i][0]);
          }
        }

        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': contentLength || arrayBuffer.byteLength.toString(),
            'Content-Disposition': 'inline; filename="protected.pdf"',
            'Content-Security-Policy': "default-src 'none'; script-src 'none'; object-src 'none';",
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
            'X-Download-Options': 'noopen',
            'Cache-Control': 'public, max-age=300', // 5 minutes cache
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      } catch (error) {
        lastError = error;
        
        if (attempt < 2) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  } catch (error: any) {
    // Silent fail
    return NextResponse.json({ 
      error: `Failed to proxy PDF: ${error.message}`,
      url: pdfUrl 
    }, { status: 500 });
  }
}
