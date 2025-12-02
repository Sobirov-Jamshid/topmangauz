import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TopManga - Manga, Manhwa, Manhua O\'qish Platformasi',
    short_name: 'TopManga',
    description: 'TopManga - O\'zbekistonda eng yaxshi manga, manhwa va manhua platformasi. Bepul onlayn o\'qing, professional tarjima.',
    start_url: '/main',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#ff9900',
    icons: [
      {
        src: '/images/icon.png',
        sizes: '64x64',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/images/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['entertainment', 'books', 'lifestyle', 'reading'],
    lang: 'uz',
    dir: 'ltr',
    orientation: 'portrait-primary',
    prefer_related_applications: false,
  };
}
