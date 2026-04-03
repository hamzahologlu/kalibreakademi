import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site-config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Çerez Politikası",
  description: `${SITE_NAME} çerez ve benzeri teknolojilerin kullanımı.`,
  path: "/cerez-politikasi",
});

export default function CerezPolitikasiPage() {
  return (
    <MarketingPage
      title="Çerez Politikası"
      intro="Bu sayfa, oturum ve güvenlik için gerekli çerezler ile tercihlere bağlı çerezler hakkında bilgi verir."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Çerez nedir?</h2>
        <p>
          Çerezler, ziyaret ettiğiniz site tarafından tarayıcınıza kaydedilen
          küçük metin dosyalarıdır. Oturumunuzu sürdürmek ve güvenliği sağlamak
          için kullanılabilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">
          {SITE_NAME} hangi çerezleri kullanır?
        </h2>
        <p>
          Kimlik doğrulama ve oturum yönetimi için zorunlu çerezler
          kullanılabilir (ör. güvenli giriş sonrası oturum bilgisi). Bu çerezler
          olmadan platform işlevleri sağlıklı çalışmayabilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Üçüncü taraflar</h2>
        <p>
          Video oynatma veya analitik gibi gömülü hizmetler kendi çerez
          politikalarına tabi olabilir. İlgili sağlayıcıların açıklamalarını
          incelemeniz önerilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Tercihleriniz</h2>
        <p>
          Tarayıcı ayarlarından çerezleri kısıtlayabilirsiniz; ancak oturum
          çerezlerini devre dışı bırakmak giriş yapmayı engelleyebilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">İletişim</h2>
        <p>
          Sorularınız:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-violet-300 underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </MarketingPage>
  );
}
