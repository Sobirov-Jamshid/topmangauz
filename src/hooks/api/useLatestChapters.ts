import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/api/axios";

export interface LatestChapter {
  id: number;              // manga ID
  title: string;           // manga nomi
  slug: string;
  cover?: string | null;
  rating: number;          // manga reytingi
  age?: {
    id: number;
    name: string;
  } | null;

  last_chapter_id: number;         // eng so‘nggi bob ID
  last_chapter_title: string;      // eng so‘nggi bob nomi
  last_chapter_created_at: string; // sana (ISO)
  new_chapters_count: number;      // nechta yangi bob (oxirgi 2 kunda)
}

export const useLatestChapters = () => {
  const {
    data: latestChapters,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["latestChapters"],
    queryFn: async (): Promise<LatestChapter[]> => {
      const response = await axios.get("/chapters/latest-updates/");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    latestChapters: latestChapters || [],
    isLoading,
    error,
    refetch,
  };
};
