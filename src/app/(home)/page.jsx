"use client"; // Required to stop prerendering

import { Suspense } from "react";
import HomePageClient from "@/components/HomePageClient";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // Forces dynamic rendering on Vercel

export default function HomePage() {
  const searchParams = useSearchParams();

  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <HomePageClient initialSearchParams={Object.fromEntries(searchParams)} />
    </Suspense>
  );
}
