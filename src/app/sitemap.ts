import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/url';

async function getAllMangas() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    const response = await fetch(`${API_URL}/manga/`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.results || data?.data || []);
  } catch (error) {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/main`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/main/manga`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  const categoryPages = [
    'action',
    'adventure',
    'comedy',
    'drama',
    'fantasy',
    'horror',
    'mystery',
    'romance',
    'sci-fi',
    'slice-of-life',
    'sports',
    'supernatural',
    'thriller'
  ].map(category => ({
    url: `${baseUrl}/main/manga?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const genrePages = [
    'shounen',
    'shoujo',
    'seinen',
    'josei',
    'yaoi',
    'yuri',
    'harem',
    'ecchi',
    'mature'
  ].map(genre => ({
    url: `${baseUrl}/main/manga?genre=${genre}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Fetch all manga and generate pages
  const mangas = await getAllMangas();
  const mangaPages = mangas.map((manga: any) => ({
    url: `${baseUrl}/main/manga/${manga.slug || manga.id}`,
    lastModified: manga.updated_at ? new Date(manga.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...genrePages,
    ...mangaPages,
  ];
}
