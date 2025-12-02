import { useEffect, useState } from "react";
import { Star } from "lucide-react";

function MangaRatingStats({ slug }: { slug: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`https://auth.topmanga.uz/api/manga/${slug}/rating-stats/`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Statistika yuklanmadi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [slug]);

  if (loading) {
    return <p className="text-center text-[#a0a0a0]">Yuklanmoqda...</p>;
  }

  if (!stats) {
    return <p className="text-center text-[#a0a0a0]">Statistik ma'lumot topilmadi</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm sm:text-xl font-semibold text-center">
        O‘rtacha reyting: <span className="text-[#ff9900]">{stats.average_rating}</span> ⭐
      </h2>

      <div className="space-y-2">
        {stats.ratings.map((item: any) => (
          <div key={item.rating} className="flex items-center gap-2">
            <div className="w-4 text-right">{item.rating}</div>
            <Star className="w-4 h-4 text-[#ffcc00]" fill="#ffcc00" />
            <div className="flex-1 h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ff9900] rounded-full"
                style={{
                  width: `${
                    stats.ratings[0].count > 0
                      ? (item.count / stats.ratings[0].count) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="w-8 text-right text-xs text-[#a0a0a0]">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MangaRatingStats;
