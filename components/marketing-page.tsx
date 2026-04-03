import type { ReactNode } from "react";

type Props = {
  title: string;
  intro?: string;
  children: ReactNode;
};

export function MarketingPage({ title, intro, children }: Props) {
  return (
    <div className="min-h-full bg-zinc-950 pb-20 pt-10 text-zinc-50 sm:pt-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-4 text-base leading-relaxed text-zinc-400">{intro}</p>
        ) : null}
        <div className="mt-10 space-y-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          {children}
        </div>
      </div>
    </div>
  );
}
