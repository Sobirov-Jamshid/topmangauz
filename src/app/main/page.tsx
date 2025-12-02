import { Metadata } from 'next';
import MainPageClient from './MainPageClient';
import { getBaseUrl } from '@/lib/seo/url';

export const metadata: Metadata = {
  title: 'Bosh sahifa - TopManga',
  description: 'TopManga - O\'zbekistonda eng yaxshi manga platformasi. Eng mashhur va yangi manga, manhwa va manhualarni kashf qiling. Bepul onlayn o\'qing. Discover and read the latest manga, manhwa, and manhua online for free.',
  keywords: [
    'manga bosh sahifa',
    'manga home',
    'yangi manga',
    'mashhur manga',
    'trending manga',
    'popular manga',
    'latest manga chapters',
    'manga updates',
    'manga uzbek',
    'o\'zbekcha manga',
    'read manga online',
    'free manga',
  ],
  openGraph: {
    title: 'TopManga - Bosh sahifa | Manga, Manhwa, Manhua',
    description: 'Eng mashhur va yangi manga, manhwa va manhualarni kashf qiling. Bepul onlayn o\'qing, professional tarjima.',
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['en_US', 'ru_RU'],
    url: `${getBaseUrl()}/main`,
    siteName: 'TopManga',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TopManga - Manga Platformasi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TopManga - Bosh sahifa | Manga, Manhwa, Manhua',
    description: 'Eng mashhur va yangi manga, manhwa va manhualarni kashf qiling. Read latest manga online for free.',
    images: ['/images/og-image.png'],
    creator: '@topmanga',
  },
  alternates: {
    canonical: '/main',
    languages: {
      'uz-UZ': '/main',
      'en-US': '/main',
      'ru-RU': '/main',
    },
  },
};

export default function MainPage() {
  return <MainPageClient />;
}