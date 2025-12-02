export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://auth.topmanga.uz/api';

export function absoluteMedia(url: string): string {
  if (url.startsWith('http')) return url;
  const base = API_URL.replace(/\/api$/, '');
  return base + url;
} 