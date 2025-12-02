"use client";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function AdminNotFound() {
  const router = useRouter();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sahifa topilmadi."
      extra={
        <Button type="primary" onClick={() => router.push("/admin")}>Bosh sahifaga</Button>
      }
    />
  );
} 