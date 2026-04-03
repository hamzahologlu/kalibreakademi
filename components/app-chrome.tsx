import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-zinc-950 text-zinc-50">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
