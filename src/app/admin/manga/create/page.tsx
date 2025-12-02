"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

export default function CreateMangaPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/manga/create");
  }, [router]);

  return (
    <div className="p-6 flex justify-center items-center h-[60vh]">
      <Spin size="large" tip="Yuklanyapti..." />
    </div>
  );
} 