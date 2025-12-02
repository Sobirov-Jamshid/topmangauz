"use client";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  const router = useRouter();
  return (
    <Result
      status="500"
      title="Xatolik yuz berdi"
      subTitle={error.message}
      extra={
        <>
          <Button type="primary" onClick={reset} style={{ marginRight: 8 }}>
            Qayta urinib ko'rish
          </Button>
          <Button onClick={() => router.push("/admin")}>Bosh sahifa</Button>
        </>
      }
    />
  );
} 