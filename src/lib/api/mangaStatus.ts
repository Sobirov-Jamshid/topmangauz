import adminAxios from './adminAxios';

export interface MangaStatusUpdate {
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
}

export async function updateMangaStatus(mangaId: string, status: MangaStatusUpdate['status']) {
  try {
    const response = await adminAxios.patch(`/manga/${mangaId}/`, {
      status: status
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export function checkMangaCompletion(
  totalChapters: number,
  readChapters: number,
  completionThreshold: number = 0.9 // 90% of chapters read
): boolean {
  if (totalChapters === 0) return false;
  return (readChapters / totalChapters) >= completionThreshold;
}

export function getReadingProgress(
  totalChapters: number,
  readChapters: number
): number {
  if (totalChapters === 0) return 0;
  return Math.round((readChapters / totalChapters) * 100);
}
