import React from 'react';
import { Metadata } from 'next';
import MangaDetailClient from './MangaDetailClient';
import { generateMangaMetadata, MangaData } from '@/lib/seo/metadata';
import { generateMangaStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo/structured-data';
import { getBaseUrl } from '@/lib/seo/url';

async function getMangaData(id: string): Promise<MangaData | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    const response = await fetch(`${API_URL}/manga/${id}/`, {
      cache: 'no-store', // Always fetch fresh data for SEO
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const manga = await response.json();
    
    // Transform API response to MangaData format
    return {
      id: manga.slug || id,
      title: manga.title,
      description: manga.description,
      author: manga.author?.name,
      status: manga.status,
      genres: manga.genres?.map((g: any) => g.name) || [],
      categories: manga.category ? [manga.category.name] : [],
      cover_image: manga.cover,
      views: manga.views,
      rating: manga.rating,
      created_at: manga.created_at,
      updated_at: manga.updated_at,
      slug: manga.slug || id,
    };
  } catch (error) {
    // Silent fail
    return null;
  }
}

export async function generateMetadata({
  params,
}: { 
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const manga = await getMangaData(id);
  
  if (manga) {
    return generateMangaMetadata(manga);
  }
  
  return {
    title: `Manga - TopManga`,
    description: 'Manga o\'qing. Eng yangi va mashhur mangalar, to\'liq boshqotirmalar va professional tarjima.',
  };
}

export default async function MangaDetailPage({
  params,
}: { 
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const manga = await getMangaData(id);
  const baseUrl = getBaseUrl();
  
  // Breadcrumb structured data
  const breadcrumbItems = [
    { name: 'Bosh sahifa', url: baseUrl },
    { name: 'Manga Katalogi', url: `${baseUrl}/main/manga` },
    { name: manga?.title || 'Manga', url: `${baseUrl}/main/manga/${id}` },
  ];
  
  return (
    <>
      {manga && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateMangaStructuredData(manga)),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateBreadcrumbStructuredData(breadcrumbItems)),
            }}
          />
        </>
      )}
      <MangaDetailClient slug={id} />
    </>
  );
} 