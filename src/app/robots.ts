import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/main/',
          '/main/manga/',
          '/main/manga/*',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/main/read/',
          '/main/profile/',
          '/main/favorites/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/main/',
          '/main/manga/',
          '/main/manga/*',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/main/read/',
          '/main/profile/',
          '/main/favorites/',
          '/_next/',
          '/private/',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/main/',
          '/main/manga/',
          '/main/manga/*',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/main/read/',
          '/main/profile/',
          '/main/favorites/',
          '/_next/',
          '/private/',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Yandex',
        allow: [
          '/',
          '/main/',
          '/main/manga/',
          '/main/manga/*',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/main/read/',
          '/main/profile/',
          '/main/favorites/',
          '/_next/',
          '/private/',
        ],
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
