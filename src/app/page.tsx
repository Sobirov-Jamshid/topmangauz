import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TopManga - O\'zbekistonda Eng Yaxshi Manga, Manhwa, Manhua Platformasi',
  description: 'TopManga - O\'zbekistonda manga, manhwa va manhua o\'qish platformasi. Bepul onlayn o\'qing, professional tarjima, eng yangi boblar. Read manga, manhwa, and manhua online for free in Uzbek language.',
};

export default function Home() {
  redirect('/main');
}
