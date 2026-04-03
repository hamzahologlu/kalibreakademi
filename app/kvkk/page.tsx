import type { Metadata } from "next";
import { MarketingPage } from "@/components/marketing-page";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site-config";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "KVKK Aydınlatma Metni",
  description: `${SITE_NAME} kişisel verilerin işlenmesi ve KVKK kapsamında aydınlatma metni.`,
  path: "/kvkk",
});

export default function KvkkPage() {
  return (
    <MarketingPage
      title="KVKK Aydınlatma Metni"
      intro="6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında veri sorumlusu sıfatıyla hazırlanmış özet aydınlatma metnidir. Kesin hukuki metin için hukuk danışmanınıza başvurunuz."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">
          Veri sorumlusu
        </h2>
        <p>
          Platformu işleten tüzel kişi veri sorumlusudur. İletişim:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-violet-300 underline-offset-2 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">
          İşlenen veriler ve amaçlar
        </h2>
        <p>
          Kimlik ve iletişim bilgileri (ad, e-posta), hesap ve rol bilgileri,
          eğitim/sınav etkileşim kayıtları; hizmetin sunulması, sözleşmenin
          ifası, meşru menfaat veya açık rıza kapsamında yasalara uygun şekilde
          işlenebilir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">
          Aktarım ve saklama
        </h2>
        <p>
          Veriler; barındırma ve kimlik doğrulama için seçilen teknik altyapı
          sağlayıcılarına (ör. bulut ve kimlik hizmeti) KVKK ve sözleşmelere
          uygun olarak aktarılabilir. Saklama süreleri işleme amacına göre
          belirlenir.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-200">Haklarınız</h2>
        <p>
          KVKK’nın 11. maddesi kapsamında; verilerinizin işlenip işlenmediğini
          öğrenme, düzeltme ve silme talepleri ile şikâyet hakkınız saklıdır.
          Taleplerinizi yukarıdaki iletişim kanalından iletebilirsiniz.
        </p>
      </section>
    </MarketingPage>
  );
}
