import React from 'react';
import ReadPageClient from './ReadPageClient';

export default async function ReadPage({
  params,
}: { 
  params: Promise<{ id: string; chapterNumber: string }>;
}) {
  const { id, chapterNumber } = await params;
  return <ReadPageClient id={id} chapterNumber={chapterNumber} />;
} 