"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DynamicTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);

    const title = parts
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

    document.title =
      title + " | " + (process.env.NEXT_PUBLIC_NAME || "Boutique");
  }, [pathname]);

  return null;
}