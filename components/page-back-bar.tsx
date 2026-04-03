"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
  children: React.ReactNode;
  /** Örn. max-w-2xl, max-w-[1600px] */
  containerClass?: string;
};

export function PageBackBar({
  href,
  children,
  containerClass = "max-w-6xl",
}: Props) {
  return (
    <div className="border-b border-white/10 bg-zinc-950/70 backdrop-blur-sm print:hidden">
      <div
        className={`mx-auto flex items-center px-4 py-2.5 sm:px-6 lg:px-8 ${containerClass}`}
      >
        <Link
          href={href}
          className="inline-flex min-h-10 items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          {children}
        </Link>
      </div>
    </div>
  );
}
