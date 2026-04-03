import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CirclePlay,
  ClipboardCheck,
  ListVideo,
  User,
} from "lucide-react";
import { PageBackBar } from "@/components/page-back-bar";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import { getYouTubeEmbedSrc, getYouTubeVideoId } from "@/lib/youtube";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EgitimPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/kayit");
  }

  const profile = await loadMyProfile(supabase);

  if (!profile?.company_id) {
    notFound();
  }

  const { data: assignment } = await supabase
    .from("course_assignments")
    .select("id")
    .eq("course_id", id)
    .eq("company_id", profile.company_id)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, video_url, specialist_name")
    .eq("id", id)
    .maybeSingle();

  if (error || !course) {
    notFound();
  }

  const watchHref =
    course.video_url && course.video_url.startsWith("http")
      ? course.video_url
      : null;

  const youtubeId = watchHref ? getYouTubeVideoId(watchHref) : null;
  const embedSrc = youtubeId ? getYouTubeEmbedSrc(youtubeId) : null;

  let directVideo = false;
  if (watchHref && !youtubeId) {
    try {
      directVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(
        new URL(watchHref).pathname
      );
    } catch {
      directVideo = false;
    }
  }

  const { data: quizRow } = await supabase
    .from("quizzes")
    .select("id")
    .eq("course_id", id)
    .limit(1)
    .maybeSingle();

  const hasQuiz = Boolean(quizRow?.id);
  const specialist = course.specialist_name ?? "Uzman";

  const hasPlayableVideo = Boolean(embedSrc || (watchHref && directVideo));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]"
      />

      <PageBackBar href="/dashboard" containerClass="max-w-[1600px]">
        Panele dön
      </PageBackBar>

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav
          className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500"
          aria-label="Sayfa konumu"
        >
          <Link
            href="/dashboard"
            className="transition hover:text-zinc-300"
          >
            Panel
          </Link>
          <span className="text-zinc-600" aria-hidden>
            /
          </span>
          <span className="line-clamp-2 text-zinc-400">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,380px)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Sol: başlık + geniş video */}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[1.75rem] xl:text-4xl">
              {course.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <User className="h-4 w-4 text-violet-400" aria-hidden />
                {specialist}
              </span>
            </div>

            <div className="mt-8">
              {embedSrc ? (
                <>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.6)]">
                    <iframe
                      title={`${course.title} — video`}
                      src={embedSrc}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                    Videoyu tamamladıktan sonra sağdaki panelden sınava
                    geçebilirsiniz.
                  </p>
                </>
              ) : watchHref && directVideo ? (
                <>
                  <video
                    src={watchHref}
                    controls
                    playsInline
                    className="w-full rounded-lg bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_25px_50px_-12px_rgba(0,0,0,0.5)]"
                  >
                    Tarayıcınız bu videoyu oynatamıyor.
                  </video>
                  <p className="mt-4 text-sm text-zinc-500">
                    İzledikten sonra sınava geçmek için sağdaki paneli kullanın.
                  </p>
                </>
              ) : watchHref ? (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-100/90">
                  Bu video adresi gömülü oynatıcıda açılamıyor. Lütfen YouTube
                  veya doğrudan .mp4 / .webm bağlantısı kullanılsın.
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-zinc-500">
                  Bu eğitim için henüz video bağlantısı eklenmemiş.
                </div>
              )}
            </div>

            {/* Mobilde: içerik listesi altında tekrar CTA */}
            {hasQuiz ? (
              <div className="mt-8 lg:hidden">
                <Link
                  href={`/sinav/${id}`}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-950/40"
                >
                  <ClipboardCheck className="h-5 w-5 shrink-0" aria-hidden />
                  Sınava başla
                </Link>
              </div>
            ) : null}
          </div>

          {/* Sağ: Udemy tarzı içerik paneli */}
          <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-white/10 bg-zinc-900/90 shadow-xl shadow-black/40 backdrop-blur-sm">
              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2 text-white">
                  <ListVideo className="h-5 w-5 text-violet-400" aria-hidden />
                  <h2 className="text-base font-semibold">Eğitim içeriği</h2>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Bu eğitimdeki adımlar
                </p>
              </div>
              <ul className="divide-y divide-white/5 p-2">
                <li>
                  <div className="flex items-start gap-3 rounded-lg bg-violet-500/10 px-3 py-3 ring-1 ring-violet-500/25">
                    <CirclePlay
                      className="mt-0.5 h-5 w-5 shrink-0 text-violet-400"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        Eğitim videosu
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {hasPlayableVideo
                          ? "Şu an izleniyor"
                          : "Video henüz yok"}
                      </p>
                    </div>
                  </div>
                </li>
                {hasQuiz ? (
                  <li>
                    <Link
                      href={`/sinav/${id}`}
                      className="flex items-start gap-3 rounded-lg px-3 py-3 transition hover:bg-white/[0.04]"
                    >
                      <ClipboardCheck
                        className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200">
                          Sınav
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          Videoyu bitirdikten sonra
                        </p>
                      </div>
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>

            {hasQuiz ? (
              <Link
                href={`/sinav/${id}`}
                className="mt-4 hidden min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-950/50 transition hover:from-cyan-500 hover:to-cyan-400 lg:flex"
              >
                <ClipboardCheck className="h-5 w-5 shrink-0" aria-hidden />
                Sınava başla
              </Link>
            ) : null}

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Eğitmen
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-100">
                {specialist}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
