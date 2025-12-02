export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://topmanga.uz';
}

export function createUrl(path: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createMangaUrl(mangaId: string): string {
  return createUrl(`/main/manga/${mangaId}`);
}

export function createCatalogUrl(searchParams?: Record<string, string>): string {
  const basePath = '/main/manga';
  if (!searchParams || Object.keys(searchParams).length === 0) {
    return createUrl(basePath);
  }
  
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  
  return createUrl(`${basePath}?${params.toString()}`);
}
