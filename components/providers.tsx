"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        richColors
        closeButton
        duration={5000}
        toastOptions={{
          classNames: {
            toast:
              "!bg-zinc-900/95 !border !border-white/10 !text-zinc-100 !shadow-xl !backdrop-blur-md",
            title: "!text-zinc-50",
            description: "!text-zinc-400",
            error:
              "!bg-red-950/90 !border-red-500/30 !text-red-50",
            success:
              "!bg-emerald-950/90 !border-emerald-500/30 !text-emerald-50",
          },
        }}
      />
    </>
  );
}
