import { MangaData } from './metadata';
import { getBaseUrl, createMangaUrl, createCatalogUrl } from './url';

export function generateMangaStructuredData(manga: MangaData) {
  const baseUrl = getBaseUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Book", "CreativeWork"],
    "@id": `${baseUrl}/main/manga/${manga.id}`,
    "name": manga.title,
    "alternateName": manga.title,
    "description": manga.description,
    "author": manga.author ? {
      "@type": "Person",
      "name": manga.author
    } : undefined,
    "publisher": {
      "@type": "Organization",
      "name": "TopManga",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/icon.png`
      }
    },
    "datePublished": manga.created_at,
    "dateModified": manga.updated_at,
    "image": manga.cover_image || `${baseUrl}/images/manga-placeholder.jpg`,
    "genre": manga.genres,
    "keywords": manga.genres?.join(", "),
    "inLanguage": ["uz", "en"],
    "isAccessibleForFree": true,
    "contentRating": manga.status === "ongoing" ? "Active" : "Completed",
    "educationalUse": "Entertainment",
    "typicalAgeRange": "13+",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "UZS",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/main/manga/${manga.id}`,
      "seller": {
        "@type": "Organization",
        "name": "TopManga"
      }
    },
    "aggregateRating": manga.rating ? {
      "@type": "AggregateRating",
      "ratingValue": manga.rating,
      "ratingCount": manga.views || 1,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": manga.views || 1
    } : undefined,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReadAction",
        "userInteractionCount": manga.views || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ReviewAction",
        "userInteractionCount": manga.views || 0
      }
    ],
    "url": `${baseUrl}/main/manga/${manga.id}`,
    "mainEntityOfPage": `${baseUrl}/main/manga/${manga.id}`
  };

  return structuredData;
}

export function generateCatalogStructuredData(mangas: MangaData[], searchParams: any) {
  const baseUrl = getBaseUrl();
  const items = mangas.map(manga => ({
    "@type": "Book",
    "@id": `${baseUrl}/main/manga/${manga.id}`,
    "name": manga.title,
    "description": manga.description,
    "author": manga.author ? {
      "@type": "Person",
      "name": manga.author
    } : undefined,
    "image": manga.cover_image,
    "genre": manga.genres,
    "datePublished": manga.created_at
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${baseUrl}/main/manga${searchParams.search ? `?search=${encodeURIComponent(searchParams.search)}` : ''}`,
    "name": searchParams.search ? `"${searchParams.search}" qidiruvi` : "Manga Katalogi",
    "description": searchParams.search ? `"${searchParams.search}" bo'yicha manga natijalari` : "Barcha manga, manhwa va manhualar",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": item
      }))
    }
  };

  return structuredData;
}

export function generateWebsiteStructuredData() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": baseUrl,
    "name": "TopManga",
    "description": "Manga, manhwa va manhua kutubxonasi",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/main/manga?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TopManga",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/icon.png`
      }
    }
  };
}

export function generateOrganizationStructuredData() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "TopManga",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/images/icon.png`,
      "width": 64,
      "height": 64
    },
    "description": "Manga, manhwa va manhua kutubxonasi",
    "sameAs": [
      "https://t.me/topmanga",
      "https://instagram.com/topmanga",
      "https://facebook.com/topmanga"
    ]
  };
}

export function generateBreadcrumbStructuredData(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": {
        "@type": "WebPage",
        "@id": item.url,
        "url": item.url,
        "name": item.name
      }
    }))
  };
}

// FAQ structured data for common questions
export function generateFAQStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "TopManga nima?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TopManga - O'zbekistonda manga, manhwa va manhua o'qish platformasi. Professional tarjima bilan bepul onlayn o'qing."
        }
      },
      {
        "@type": "Question",
        "name": "What is TopManga?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TopManga is a manga, manhwa, and manhua reading platform in Uzbekistan. Read online for free with professional Uzbek translation."
        }
      },
      {
        "@type": "Question",
        "name": "Manga bepulmi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ha, TopManga platformasida ko'plab mangalar bepul. Ba'zi premium boblar uchun to'lov talab qilinadi."
        }
      }
    ]
  };
}
