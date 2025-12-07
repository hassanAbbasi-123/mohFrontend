// src/components/layout/LayoutContent.jsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {isHome && <Header />}
      {children}
      {isHome && <Footer />}
    </>
  );
}
