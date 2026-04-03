import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KayitBrand, RegisterForm } from "./register-form";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Kayıt Ol",
  description:
    "Şirket kodu ile personel kaydı veya İSG uzmanı hesabı oluşturun.",
  path: "/kayit",
});

export default async function KayitPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"
      />

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-col px-4 pb-10 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
        <KayitBrand />
        <p className="mb-6 max-w-prose text-sm leading-relaxed text-zinc-400 sm:mb-8">
          Personel olarak şirket koduyla kayıt olun veya İSG Uzmanı olarak
          bağımsız hesap oluşturun.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-8">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
