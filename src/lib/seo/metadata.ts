import { Metadata } from 'next';
import { getBaseUrl, createMangaUrl, createCatalogUrl } from './url';

export interface MangaData {
  id: string;
  title: string;
  description?: string;
  author?: string;
  status?: string;
  genres?: string[];
  categories?: string[];
  cover_image?: string;
  views?: number;
  rating?: number;
  created_at?: string;
  updated_at?: string;
  slug?: string;
}

export const baseMetadata: Metadata = {
  title: {
    default: "TopManga - Manga, Manhwa va Manhua Kutubxonasi",
    template: "%s | TopManga"
  },
  description: "TopManga - O'zbekistonda eng yaxshi manga, manhwa va manhua platformasi. Bepul onlayn o'qing, professional tarjima, eng yangi boblar. Read manga online in Uzbek language with professional translation.",
  keywords: [
    // O'zbekcha kalit so'zlar
    "manga",
    "manhwa", 
    "manhua",
    "manga o'qish",
    "onlayn manga",
    "manga kutubxonasi",
    "manga tarjima",
    "manga uzbek tilida",
    "manga katalog",
    "manga qidirish",
    "manga reyting",
    "uzbek manga",
    "o'zbek manga",
    "manga uzbekistan",
    "bepul manga o'qish",
    "manga onlayn",
    "manga tarjimasi",
    
    // English keywords for SEO
    "read manga online",
    "manga library",
    "online manga reading",
    "free manga",
    "manga catalog",
    "manhwa online",
    "manhua online",
    "manga uzbek translation",
    "uzbekistan manga",
    "read manga free",
    "manga reading platform",
    "latest manga chapters"
  ],
  authors: [{ name: "TopManga Team" }],
  creator: "TopManga",
  publisher: "TopManga",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getBaseUrl()),
  alternates: {
    canonical: '/',
    languages: {
      'uz-UZ': '/uz',
      'ru-RU': '/ru',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['en_US', 'ru_RU'],
    url: getBaseUrl(),
    siteName: 'TopManga',
    title: 'TopManga - Manga, Manhwa, Manhua | O\'zbekcha Tarjima',
    description: 'TopManga - O\'zbekistonda eng yaxshi manga platformasi. Bepul onlayn o\'qing, professional tarjima, eng yangi boblar. Read manga online in Uzbek with professional translation.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TopManga - O\'zbekcha Manga Platformasi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopManga - Manga, Manhwa, Manhua | O\'zbekcha Tarjima',
    description: 'TopManga - O\'zbekistonda eng yaxshi manga platformasi. Bepul onlayn o\'qing. Read manga online in Uzbek language.',
    images: ['/images/og-image.png'],
    creator: '@topmanga',
    site: '@topmanga',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/icon.png',
    shortcut: '/images/icon.png',
    apple: '/images/icon.png',
  },
  manifest: '/manifest.json',
};

export function generateMangaMetadata(manga: MangaData): Metadata {
  const title = `${manga.title} - Read Online | TopManga`;
  const description = manga.description 
    ? `${manga.description.substring(0, 160)}...` 
    : `Read ${manga.title} manga online. ${manga.author ? `By ${manga.author}.` : ''} Latest chapters and professional translation in Uzbek. ${manga.rating ? `Rating: ${manga.rating}/5.` : ''} ${manga.status ? `Status: ${manga.status}.` : ''}`;

  const keywords = [
    // Manga specific
    manga.title,
    `${manga.title} manga`,
    `${manga.title} read online`,
    `${manga.title} o'qish`,
    manga.author || '',
    
    // Genres and categories
    ...(manga.genres || []),
    ...(manga.categories || []),
    
    // Uzbek keywords
    'manga o\'qish',
    'onlayn manga',
    'manga tarjima',
    'uzbek manga',
    'o\'zbek manga',
    'bepul manga',
    
    // English keywords
    'read manga online',
    'free manga',
    'manga chapters',
    'online manga reading'
  ].filter(Boolean);

  const mangaUrl = createMangaUrl(manga.slug || manga.id);
  
  return {
    title,
    description,
    keywords,
    authors: manga.author ? [{ name: manga.author }] : undefined,
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'uz_UZ',
      alternateLocale: ['en_US', 'ru_RU'],
      url: mangaUrl,
      siteName: 'TopManga',
      images: manga.cover_image ? [
        {
          url: manga.cover_image,
          width: 800,
          height: 1200,
          alt: `${manga.title} - Cover Image`,
          type: 'image/jpeg',
        }
      ] : [{
        url: '/images/manga-placeholder.jpg',
        width: 800,
        height: 1200,
        alt: manga.title,
        type: 'image/jpeg',
      }],
      publishedTime: manga.created_at,
      modifiedTime: manga.updated_at,
      authors: manga.author ? [manga.author] : undefined,
      tags: manga.genres,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: manga.cover_image ? [manga.cover_image] : ['/images/manga-placeholder.jpg'],
      creator: '@topmanga',
    },
    alternates: {
      canonical: mangaUrl,
      languages: {
        'uz-UZ': mangaUrl,
        'en-US': mangaUrl,
        'ru-RU': mangaUrl,
      },
    },
    other: {
      'article:published_time': manga.created_at || '',
      'article:modified_time': manga.updated_at || '',
      'article:author': manga.author || '',
      'og:see_also': mangaUrl,
    },
  };
}

export function generateCatalogMetadata(searchParams: {
  search?: string;
  category?: string;
  genre?: string;
  status?: string;
  year?: string;
  author?: string;
  page?: number;
}): Metadata {
  const { search, category, genre, status, year, author, page } = searchParams;
  
  let title = "Manga Katalogi - TopManga";
  let description = "Barcha manga, manhwa va manhualarni qidiring va o'qing. Kategoriya, janr va boshqa filtrlardan foydalaning.";

  if (search) {
    title = `"${search}" qidiruvi - TopManga`;
    description = `"${search}" bo'yicha manga natijalari. Eng yaxshi manga, manhwa va manhualarni toping.`;
  } else if (category) {
    title = `${category} Kategoriyasi - TopManga`;
    description = `${category} kategoriyasidagi barcha manga, manhwa va manhualar. Eng yangi va mashhur asarlar.`;
  } else if (genre) {
    title = `${genre} Janri - TopManga`;
    description = `${genre} janridagi barcha manga, manhwa va manhualar. Eng yaxshi asarlar.`;
  } else if (author) {
    title = `${author} Mangalari - TopManga`;
    description = `${author} tomonidan yozilgan barcha manga, manhwa va manhualar.`;
  }

  if (page && page > 1) {
    title += ` - Sahifa ${page}`;
  }

  return {
    title,
    description,
    keywords: [
      search || '',
      category || '',
      genre || '',
      author || '',
      'manga katalog',
      'manga qidirish',
      'onlayn manga',
      'uzbek manga'
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      url: createCatalogUrl(search ? { search } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/main/manga${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    },
  };
}
