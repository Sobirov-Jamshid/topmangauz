import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/seo/url';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  
  return {
    title: 'Manga Katalogi - TopManga',
    description: 'TopManga manga katalogi. Barcha manga, manhwa va manhualarni ko\'ring. Kategoriya, janr, holat bo\'yicha filter qiling. Eng yangi va mashhur mangalarni toping. Browse and read all manga online with advanced filters.',
    keywords: [
      'manga katalog',
      'manga catalog',
      'manga qidirish',
      'manga search',
      'manga filter',
      'manga kategoriya',
      'manga janr',
      'manga genre',
      'manga yangiliklari',
      'latest manga',
      'new manga',
      'popular manga',
      'trending manga',
      'manga list',
      'manga uzbek',
      'o\'zbekcha manga',
      'read manga online',
      'free manga reading',
    ],
    openGraph: {
      title: 'Manga Katalogi - Barcha Manga, Manhwa, Manhua | TopManga',
      description: 'Barcha manga, manhwa va manhualarni ko\'ring. Filter va qidirish imkoniyatlari. Bepul onlayn o\'qing.',
      type: 'website',
      locale: 'uz_UZ',
      alternateLocale: ['en_US', 'ru_RU'],
      url: `${baseUrl}/main/manga`,
      siteName: 'TopManga',
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: 'TopManga Manga Katalogi',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Manga Katalogi - TopManga',
      description: 'Barcha manga, manhwa va manhualarni ko\'ring. Read all manga online for free.',
      images: ['/images/og-image.png'],
      creator: '@topmanga',
    },
    alternates: {
      canonical: '/main/manga',
      languages: {
        'uz-UZ': '/main/manga',
        'en-US': '/main/manga',
        'ru-RU': '/main/manga',
      },
    },
  };
}

export default function MangaCatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

