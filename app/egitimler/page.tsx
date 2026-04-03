import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Clock,
  GraduationCap,
  HardHat,
  HeartPulse,
  PlayCircle,
  Sparkles,
  Truck,
  Video,
  Zap,
} from "lucide-react";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Eğitimler",
  description:
    "Kalibre Akademi İSG ve iş güvenliği eğitimleri: sürücü İSG, genel İSG, ilk yardım, elektrik güvenliği ve kurumsal uyum modülleri.",
  path: "/egitimler",
});

const EGITIMLER = [
  {
    icon: Truck,
    title: "Sürücü İSG Eğitimi",
    desc: "Filolar ve saha sürücüleri için trafik ve iş güvenliği bütünlüğü.",
    highlights: [
      "Yol ve çevre riskleri, yorgunluk yönetimi",
      "Araç kontrolü, yük güvenliği ve yasal çerçeve",
    ],
    duration: "~50–70 dk",
    category: "İSG · Ulaştırma",
    tone: "text-amber-300",
    bg: "bg-amber-500/10",
    ring: "group-hover:shadow-amber-500/10",
  },
  {
    icon: HardHat,
    title: "İşyeri Genel İSG",
    desc: "Tüm çalışanlar için temel iş sağlığı ve güvenliği farkındalığı.",
    highlights: [
      "Risk değerlendirme ve KKD seçimi",
      "Acil durum, yangın ve tahliye ilkeleri",
    ],
    duration: "~45–60 dk",
    category: "İSG · Genel",
    tone: "text-cyan-300",
    bg: "bg-cyan-500/10",
    ring: "group-hover:shadow-cyan-500/10",
  },
  {
    icon: HeartPulse,
    title: "Temel İlk Yardım",
    desc: "İşyerinde güvenli müdahale ve temel yaşam desteği bilgisi.",
    highlights: [
      "Yaşam bulguları ve güvenli saha",
      "Temel yaralanma ve şok yaklaşımı",
    ],
    duration: "~40–55 dk",
    category: "Sağlık · Acil",
    tone: "text-rose-300",
    bg: "bg-rose-500/10",
    ring: "group-hover:shadow-rose-500/10",
  },
  {
    icon: Zap,
    title: "Elektrik Güvenliği",
    desc: "Enerji ile çalışan ekipman ve bakım alanlarına giriş seviyesi güvenlik.",
    highlights: [
      "Temel elektrik riskleri ve izolasyon",
      "Bakım-etiketleme ve yetki bilinci",
    ],
    duration: "~35–50 dk",
    category: "İSG · Teknik",
    tone: "text-violet-300",
    bg: "bg-violet-500/10",
    ring: "group-hover:shadow-violet-500/10",
  },
  {
    icon: BookOpen,
    title: "Kurumsal Uyum Eğitimleri",
    desc: "Şirket içi politika, davranış ve etik kurallarının dijital modülleri.",
    highlights: [
      "Davranış kuralları ve bilgi güvenliği farkındalığı",
      "Raporlama ve uyum kültürü",
    ],
    duration: "~30–45 dk",
    category: "Uyum · Politika",
    tone: "text-emerald-300",
    bg: "bg-emerald-500/10",
    ring: "group-hover:shadow-emerald-500/10",
  },
] as const;

const FAQ = [
  {
    q: "Eğitimlere nasıl erişirim?",
    a: "Şirketiniz platformda tanımlıysa davet kodu ile kayıt olur, panele giriş yaptıktan sonra size atanan modülleri açarsınız.",
  },
  {
    q: "Süreler sabit mi?",
    a: "Verilen aralıklar tipik video uzunluğu ve sınav için örnek süredir. İçerik uzmanınız tarafından güncellenebilir.",
  },
  {
    q: "Sertifika ne zaman oluşur?",
    a: "Modül sınavını baraj notunun üzerinde tamamladığınızda sertifikaya erişebilirsiniz; kayıt ilk başarılı geçişe göre sabitlenir.",
  },
] as const;

export default function EgitimlerPage() {
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
        className="pointer-events-none fixed bottom-0 left-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12 sm:px-8 sm:pt-16">
        {/* Hero */}
        <header className="text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-violet-200 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            Modül kataloğu
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Eğitimler
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
            İş sağlığı ve güvenliği odaklı dijital modüller; uzman içeriği, video
            anlatım ve bilgi sınavı ile bir arada. Şirketinize atanmış kapsamda
            panele giriş yaparak ilerlersiniz.
          </p>
        </header>

        {/* Özet şerit */}
        <ul className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Video,
              t: "Video + sınav",
              d: "İzleme ve ölçme tek akışta",
            },
            {
              icon: GraduationCap,
              t: "Uzman içeriği",
              d: "İSG uzmanı tarafından yönetilen modüller",
            },
            {
              icon: Award,
              t: "Sertifikasyon",
              d: "Başarılı tamamlamada belge",
            },
          ].map(({ icon: Icon, t, d }) => (
            <li
              key={t}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-white">{t}</p>
                <p className="mt-1 text-sm text-zinc-500">{d}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Modül kartları */}
        <section className="mt-20" aria-labelledby="modul-baslik">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                id="modul-baslik"
                className="text-sm font-medium uppercase tracking-wider text-violet-400/90"
              >
                Başlıca modüller
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
                İSG ve kurumsal uyum alanı
              </h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-500 sm:text-base">
                Aşağıdaki başlıklar yaygın kurumsal ihtiyaçlara göre yapılandırılmıştır.
                İçerik derinliği ve sınav barajı şirket politikalarınıza göre
                özelleştirilebilir.
              </p>
            </div>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EGITIMLER.map(
              ({
                icon: Icon,
                title,
                desc,
                highlights,
                duration,
                category,
                tone,
                bg,
                ring,
              }) => (
                <li key={title}>
                  <article
                    className={`group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05] hover:shadow-xl ${ring}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}
                      >
                        <Icon
                          className={`h-6 w-6 ${tone}`}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </span>
                      <span className="rounded-full border border-white/10 bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                        {category}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      {desc}
                    </p>
                    <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-sm text-zinc-400">
                      {highlights.map((h) => (
                        <li key={h} className="flex gap-2">
                          <span
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400/80"
                            aria-hidden
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-white/5 pt-5">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <Clock className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
                        {duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <PlayCircle className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
                        Video
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                        <ClipboardCheck className="h-3.5 w-3.5 text-zinc-600" aria-hidden />
                        Sınav
                      </span>
                    </div>
                  </article>
                </li>
              )
            )}
          </ul>
        </section>

        {/* Süreç */}
        <section className="mt-20 border-t border-white/10 pt-16" aria-labelledby="surec-baslik">
          <h2
            id="surec-baslik"
            className="text-center text-2xl font-semibold text-white sm:text-3xl"
          >
            Modülü tamamlamak
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-zinc-500 sm:text-base">
            Kullanıcı tarafında tipik akış üç adımda özetlenir.
          </p>
          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "1",
                t: "Videoyu izleyin",
                b: "Modül içeriğini eksiksiz tamamlayın.",
              },
              {
                n: "2",
                t: "Sınava girin",
                b: "Çoktan seçmeli sorularla bilgiyi pekiştirin.",
              },
              {
                n: "3",
                t: "Sonucu görün",
                b: "Baraj üzerindeyseniz sertifikaya geçin.",
              },
            ].map((s) => (
              <li
                key={s.n}
                className="relative rounded-2xl border border-white/10 bg-zinc-950/60 p-6 text-center"
              >
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-zinc-500">{s.b}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* SSS */}
        <section className="mt-20" aria-labelledby="sss-baslik">
          <h2
            id="sss-baslik"
            className="text-center text-2xl font-semibold text-white sm:text-3xl"
          >
            Sık sorulanlar
          </h2>
          <div className="mx-auto mt-10 max-w-2xl space-y-3">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 open:border-violet-500/25 open:bg-violet-500/[0.06]"
              >
                <summary className="cursor-pointer list-none font-medium text-white [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {q}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-zinc-500 transition group-open:rotate-180"
                      aria-hidden
                    />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/[0.12] via-zinc-950 to-violet-950/40 px-8 py-12 text-center sm:px-10 sm:py-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 left-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
            />
            <div className="relative">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Atanan eğitimlere giriş yapın
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
                Şirket kodunuz hazırsa kayıt olun; uzman iseniz bağımsız hesap
                oluşturarak içerik yönetimine başlayın.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/kayit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
                >
                  Kayıt Ol
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/giris"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/nasil-calisir"
                  className="inline-flex h-12 items-center justify-center text-sm font-medium text-zinc-400 transition hover:text-white sm:ml-1"
                >
                  Süreç rehberi →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
