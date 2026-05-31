"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

interface TechLogoProps {
  label: string;
  website?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getDomain(website?: string) {
  if (!website) return "";

  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function TechLogo({ label, website, name, size = "md", className = "" }: TechLogoProps) {
  const [hasError, setHasError] = useState(false);
  const initial = label.substring(0, 2).toUpperCase();
  const domain = getDomain(website);
  const logoSrc = useMemo(() => {
    if (!domain) return "";
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  }, [domain]);

  const sizeClass = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-16 h-16" : "w-14 h-14";
  const iconSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-lg";

  return (
    <div className={`${sizeClass} bg-[#131313] rounded-lg flex items-center justify-center border border-[#333333] overflow-hidden shrink-0 ${className}`}>
      {logoSrc && !hasError ? (
        <Image
          src={logoSrc}
          alt={`${name || label} logo`}
          width={64}
          height={64}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className={`font-headline font-bold ${iconSize} text-[#b4c5ff]`}>{initial}</span>
      )}
    </div>
  );
}