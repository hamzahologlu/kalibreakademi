import { notFound, redirect } from "next/navigation";
import { Award } from "lucide-react";
import { loadMyProfile } from "@/lib/supabase/load-my-profile";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../print-button";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

/** Sertifika satırına özgü, sabit görünen numara (yenilemede değişmez). */
function certificateNumber(resultId: string, issuedAt: Date): string {
  const year = issuedAt.getFullYear();
  const segment = resultId.replace(/-/g, "").slice(0, 10).toUpperCase();
  return `KA-${year}-${segment}`;
}

export default async function SertifikaPage({ params }: PageProps) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/kayit");
  }

  /** İlk başarılı geçiş = tek sertifika; sonraki başarılar tarih/no değiştirmez. */
  const { data: result } = await supabase
    .from("quiz_results")
    .select("id, created_at")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("passed", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!result) {
    notFound();
  }

  const { data: course } = await supabase
    .from("courses")
    .select("title, specialist_name")
    .eq("id", courseId)
    .maybeSingle();

  const profileRow = await loadMyProfile(supabase);

  const displayName =
    profileRow?.full_name?.trim() ||
    profileRow?.email ||
    user.email ||
    "Katılımcı";
  const title = course?.title ?? "Eğitim";
  const specialistName =
    course?.specialist_name?.trim() || "—";
  const issuedAt = new Date(result.created_at);
  const date = issuedAt.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const certNo = certificateNumber(result.id, issuedAt);

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-50 print:bg-white print:text-zinc-900">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-zinc-900/80 to-zinc-950 p-8 shadow-2xl shadow-amber-900/20 print:border-amber-600 print:bg-white print:shadow-none sm:p-12">
          <div className="mb-8 flex w-full flex-row items-start justify-between gap-4">
            <div className="min-w-0 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 print:text-zinc-500">
                Tarih
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-200 print:text-zinc-800 sm:text-base">
                {date}
              </p>
            </div>
            <div className="min-w-0 shrink-0 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 print:text-zinc-500">
                Sertifika No
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-amber-200/95 print:text-amber-900 sm:text-base">
                {certNo}
              </p>
            </div>
          </div>

          <div className="flex justify-center print:text-amber-700">
            <Award
              className="h-14 w-14 text-amber-400 print:text-amber-600"
              strokeWidth={1.25}
              aria-hidden
            />
          </div>
          <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-200/90 print:text-amber-800">
            Kalibre Akademi
          </p>
          <h1 className="mt-3 text-center text-2xl font-bold text-white print:text-zinc-900 sm:text-3xl">
            Başarı Sertifikası
          </h1>
          <p className="mx-auto mt-8 max-w-md text-center text-sm leading-relaxed text-zinc-400 print:text-zinc-600">
            Bu belge, aşağıda adı geçen kişinin
          </p>
          <p className="mt-4 text-center text-xl font-semibold text-white print:text-zinc-900 sm:text-2xl">
            {displayName}
          </p>
          <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-relaxed text-zinc-400 print:text-zinc-600">
            <span className="font-medium text-zinc-200 print:text-zinc-800">
              {title}
            </span>{" "}
            eğitimine ilişkin sınavı başarıyla tamamladığını belirtir.
          </p>
          <div className="mt-10 border-t border-white/10 pt-8 text-center print:border-zinc-200">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 print:text-zinc-500">
              Eğitimi veren İSG Uzmanı Adı Soyadı
            </p>
            <p className="mt-2 text-base font-semibold text-zinc-200 print:text-zinc-900 sm:text-lg">
              {specialistName}
            </p>
          </div>
        </div>

        <PrintButton />
      </main>
    </div>
  );
}
