export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const gtag = {
  config: (id: string, config?: any) => {
    if (typeof window !== 'undefined') {
      (window as any).gtag('config', id, config);
    }
  },
  event: (action: string, parameters?: any) => {
    if (typeof window !== 'undefined') {
      (window as any).gtag('event', action, parameters);
    }
  },
  pageview: (url: string) => {
    if (typeof window !== 'undefined') {
      (window as any).gtag('config', GA_TRACKING_ID, {
        page_path: url,
      });
    }
  },
};

export const trackMangaView = (mangaId: string, mangaTitle: string) => {
  gtag.event('manga_view', {
    manga_id: mangaId,
    manga_title: mangaTitle,
    event_category: 'manga',
    event_label: mangaTitle,
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  gtag.event('search', {
    search_term: query,
    results_count: resultsCount,
    event_category: 'search',
  });
};

export const trackCategoryView = (category: string) => {
  gtag.event('category_view', {
    category_name: category,
    event_category: 'navigation',
  });
};

export const trackReadingProgress = (mangaId: string, chapterNumber: number) => {
  gtag.event('reading_progress', {
    manga_id: mangaId,
    chapter_number: chapterNumber,
    event_category: 'reading',
  });
};
