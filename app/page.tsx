import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  Clock,
  GraduationCap,
  HardHat,
  HeartPulse,
  Layers,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Zap,
} from "lucide-react";

const EGITIM_OZET = [
  {
    icon: Truck,
    title: "Sürücü İSG Eğitimi",
    desc: "Yol güvenliği ve yasal yükümlülükler.",
    tone: "text-amber-300",
    bg: "bg-amber-500/10",
  },
  {
    icon: HardHat,
    title: "İşyeri Genel İSG",
    desc: "Riskler, KKD ve acil durum.",
    tone: "text-cyan-300",
    bg: "bg-cyan-500/10",
  },
  {
    icon: HeartPulse,
    title: "Temel İlk Yardım",
    desc: "Yaşam bulguları ve temel müdahale.",
    tone: "text-rose-300",
    bg: "bg-rose-500/10",
  },
  {
    icon: Zap,
    title: "Elektrik Güvenliği",
    desc: "Ekipman ve bakım kuralları.",
    tone: "text-violet-300",
    bg: "bg-violet-500/10",
  },
] as const;

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-zinc-950 text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 right-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"
      />

      <main className="relative z-10">
        {/* Hero */}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-12 text-center sm:px-8 sm:pt-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-violet-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Kurumsal eğitim, tek platformda
          </div>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight md:text-6xl">
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Kalibre Akademi
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            Ekibiniz için video kurslar, sınavlar ve şirket bazlı içerik yönetimi.
            Öğrenmeyi ölçülebilir ve sürdürülebilir kılın.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-4 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/giris"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-8 text-base font-semibold text-white shadow-lg shadow-violet-600/30 transition hover:from-violet-500 hover:to-violet-400"
            >
              Giriş Yap
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/kayit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition hover:border-white/25 hover:bg-white/10"
            >
              Kayıt Ol
            </Link>
          </div>

          <div className="mt-20 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Kurslar",
                desc: "Video içerik ve uzman bilgisi",
              },
              {
                icon: GraduationCap,
                title: "Sertifikasyon",
                desc: "Sınavlarla bilgiyi pekiştirin",
              },
              {
                icon: Sparkles,
                title: "Şirket alanı",
                desc: "Davet kodu ile güvenli erişim",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur"
              >
                <Icon
                  className="mb-3 h-8 w-8 text-violet-400"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h2 className="font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Biz kimiz */}
        <section
          id="biz-kimiz"
          className="border-t border-white/5 bg-zinc-950/50 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-violet-400/90">
                  Biz kimiz
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  İSG ve kurumsal öğrenmeye odaklı dijital akademi
                </h2>
                <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
                  Kalibre Akademi; iş sağlığı ve güvenliği uzmanları ile şirketlerin
                  aynı çatı altında buluştuğu, eğitim içeriklerinin güvenle
                  yönetildiği ve personelin ölçülebilir şekilde geliştiği bir
                  platformdur. Amacımız, zorunlu ve sürekli eğitimleri tek
                  merkezden sunmak ve uyumu kolaylaştırmaktır.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Users,
                    t: "Uzman & şirket",
                    d: "İçerik üretimi ve atama tek akışta.",
                  },
                  {
                    icon: Building2,
                    t: "Kurumsal yapı",
                    d: "Şirket ve davet kodu ile kontrollü erişim.",
                  },
                  {
                    icon: ShieldCheck,
                    t: "Güvenilir süreç",
                    d: "Sınav ve sertifika ile tamamlanma kaydı.",
                  },
                  {
                    icon: Layers,
                    t: "Ölçeklenebilir",
                    d: "Birden fazla şirket ve eğitim yönetimi.",
                  },
                ].map(({ icon: Icon, t, d }) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <Icon
                      className="h-8 w-8 text-cyan-400/90"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h3 className="mt-3 font-semibold text-white">{t}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sistem nasıl çalışır */}
        <section
          id="sistem"
          className="border-t border-white/5 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-violet-400/90">
                Sistem nasıl çalışır
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Dört adımda operasyonel süreç
              </h2>
              <p className="mt-4 text-zinc-400">
                Personel ve uzman rolleri için net bir yol haritası.
              </p>
            </div>
            <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Kayıt & erişim",
                  body: "Personel şirket koduyla, uzman bağımsız hesapla kayıt olur.",
                },
                {
                  step: "02",
                  title: "Atama",
                  body: "Uzman eğitimleri oluşturur ve ilgili şirketlere atar.",
                },
                {
                  step: "03",
                  title: "Öğrenme",
                  body: "Video izlenir, bilgi sınavı ile pekiştirilir.",
                },
                {
                  step: "04",
                  title: "Kayıt & sertifika",
                  body: "Sonuçlar kaydedilir; başarıda sertifikaya erişilir.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 pt-8"
                >
                  <span className="absolute right-5 top-5 font-mono text-2xl font-bold text-white/10">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-center">
              <Link
                href="/nasil-calisir"
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200"
              >
                Detaylı anlatım
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </p>
          </div>
        </section>

        {/* Avantajlar */}
        <section
          id="avantajlar"
          className="border-t border-white/5 bg-zinc-950/50 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-violet-400/90">
                Avantajlar
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Neden Kalibre Akademi?
              </h2>
            </div>
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BarChart3,
                  title: "Ölçülebilir sonuçlar",
                  desc: "Sınav puanları ve tamamlanma durumu tek panelde.",
                },
                {
                  icon: Lock,
                  title: "Şirkete özel erişim",
                  desc: "İçerik yalnızca atanmış şirket personeline açılır.",
                },
                {
                  icon: Clock,
                  title: "Zaman ve maliyet",
                  desc: "Yüz yüze tekrarları azaltan dijital süreç.",
                },
                {
                  icon: Rocket,
                  title: "Hızlı devreye alma",
                  desc: "Davet kodu ve rol bazlı akışla kısa sürede başlangıç.",
                },
                {
                  icon: GraduationCap,
                  title: "Sertifika",
                  desc: "Başarılı tamamlamada belgelenebilir çıktı.",
                },
                {
                  icon: Sparkles,
                  title: "Güncel içerik",
                  desc: "Uzmanların modülleri tek merkezden güncellemesi.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Eğitimler */}
        <section id="egitimler" className="border-t border-white/5 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-violet-400/90">
                  Eğitimler
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  İSG odaklı modüller
                </h2>
                <p className="mt-3 max-w-xl text-zinc-400">
                  Video ve sınav ile desteklenen başlıca eğitim alanlarımızdan
                  bir seçki.
                </p>
              </div>
              <Link
                href="/egitimler"
                className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/5 sm:self-auto"
              >
                Tümünü gör
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EGITIM_OZET.map(({ icon: Icon, title, desc, tone, bg }) => (
                <li
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15"
                >
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${tone}`}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/5 pb-24 pt-4 sm:pb-28">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.12] via-violet-950/40 to-zinc-950 px-8 py-14 text-center sm:px-12 sm:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl"
              />
              <div className="relative">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                  Ekibinizi bugün dijitale taşıyın
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-zinc-300">
                  Kayıt olun veya giriş yapın; şirketinize tanımlanan eğitimlere
                  hemen erişin.
                </p>
                <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/kayit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
                  >
                    Hemen kayıt ol
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/giris"
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    Zaten hesabım var
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
