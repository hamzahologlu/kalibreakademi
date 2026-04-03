"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mx-auto mt-8 flex min-h-12 w-full max-w-xs items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm font-medium text-zinc-200 hover:bg-white/10 print:hidden"
    >
      Yazdır / PDF kaydet
    </button>
  );
}
