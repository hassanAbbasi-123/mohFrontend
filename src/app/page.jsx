// src/app/page.jsx (Server Component - Generates manifest at root)
import { Suspense } from "react";
import ClientHome from "@/app/ClientHome";

export const dynamic = "force-dynamic"; // Optional: Keeps rendering dynamic for queries/search params

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <ClientHome />
    </Suspense>
  );
}