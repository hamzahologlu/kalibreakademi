import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site-config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Kullanım Şartları",
  description: `${SITE_NAME} platform kullanım şartları ve yükümlülükler.`,
  path: "/kullanim-sartlari",
});

export default function KullanimSartlariPage() {
  return (
    <MarketingPage
      title="Kullanım Şartları"
      intro="Bu metin, platforma erişim ve kullanımına ilişkin genel çerçeveyi özetler. Özel sözleşmeler varsa öncelik onlara aittir."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Hizmetin kapsamı</h2>
        <p>
          {SITE_NAME}, kurumsal eğitim içeriği, sınav ve sertifikasyon süreçlerini
          dijital ortamda destekler. Özellikler zaman içinde güncellenebilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Hesap ve güvenlik</h2>
        <p>
          Kullanıcılar hesap bilgilerinin gizliliğinden sorumludur. Şüpheli
          erişim durumunda derhal bildirim yapılmalıdır. Yetkisiz erişim veya
          kötüye kullanım hesabın askıya alınmasına yol açabilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">İçerik ve fikri mülkiyet</h2>
        <p>
          Platformda sunulan eğitim ve materyallerin hakları ilgili içerik
          sahiplerine aittir. İzinsiz kopyalama, dağıtım veya ticari kullanım
          yasaktır.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Sorumluluk sınırı</h2>
        <p>
          Hizmet “olduğu gibi” sunulur. Mücbir sebep veya üçüncü taraf
          hizmetlerinden kaynaklanan kesintilerden doğan zararlarda platform
          tarafının sorumluluğu, yasal olarak müsaade edilen azami ölçü ile
          sınırlıdır.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">İletişim</h2>
        <p>
          Sorularınız için:{" "}
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
