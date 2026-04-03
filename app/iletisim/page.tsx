import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { MarketingPage } from "@/components/marketing-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site-config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "İletişim",
  description: `${SITE_NAME} ile iletişime geçin — kurumsal eğitim ve platform sorularınız için.`,
  path: "/iletisim",
});

export default function IletisimPage() {
  return (
    <MarketingPage
      title="İletişim"
      intro="Kurumsal iş birlikleri, demo talepleri ve teknik konular için bize yazabilirsiniz."
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
            <Mail className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-zinc-300">E-posta</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-1 inline-block text-base font-semibold text-white underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-4 text-sm text-zinc-500">
              Mesajınızda şirket adı ve talep konusunu kısaca belirtmeniz yanıt
              süresini hızlandırır.
            </p>
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
