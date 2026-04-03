"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clapperboard, Loader2, User, X } from "lucide-react";
import type { CourseRow } from "@/lib/supabase";
import { initialCourseMutationState } from "./dashboard-mutation-state";
import { updateCourse } from "./course-mutations";

type Props = {
  course: CourseRow;
  defaultSpecialistName: string;
  onClose: () => void;
};

export function EditCourseModal({
  course,
  defaultSpecialistName,
  onClose,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    updateCourse,
    initialCourseMutationState
  );
  const handledOk = useRef(false);
  const lastErr = useRef<string | null>(null);

  useEffect(() => {
    if (state.ok && !handledOk.current) {
      handledOk.current = true;
      toast.success("Eğitim güncellendi.");
      onClose();
      router.refresh();
    }
    if (!state.ok) {
      handledOk.current = false;
    }
  }, [state.ok, onClose, router]);

  useEffect(() => {
    if (state.error && state.error !== lastErr.current) {
      lastErr.current = state.error;
      toast.error(state.error);
    }
    if (!state.error) {
      lastErr.current = null;
    }
  }, [state.error]);

  const specialistDefault =
    (course.specialist_name?.trim() || defaultSpecialistName) || "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-course-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
              <Clapperboard className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2
                id="edit-course-title"
                className="text-lg font-semibold text-white"
              >
                Eğitimi düzenle
              </h2>
              <p className="text-xs text-zinc-500">Başlık, video ve uzman bilgisi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="id" value={course.id} />

          <div>
            <label
              htmlFor={`edit-course-title-${course.id}`}
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Eğitim başlığı
            </label>
            <input
              id={`edit-course-title-${course.id}`}
              name="title"
              type="text"
              required
              disabled={isPending}
              defaultValue={course.title}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-course-video-${course.id}`}
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              YouTube video URL
            </label>
            <input
              id={`edit-course-video-${course.id}`}
              name="video_url"
              type="url"
              required
              disabled={isPending}
              defaultValue={course.video_url ?? ""}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor={`edit-course-specialist-${course.id}`}
              className="mb-1.5 flex items-center gap-2 text-sm font-medium text-zinc-300"
            >
              <User className="h-3.5 w-3.5 text-violet-400" aria-hidden />
              Eğitimi veren uzman adı
            </label>
            <input
              id={`edit-course-specialist-${course.id}`}
              name="specialist_name"
              type="text"
              disabled={isPending}
              defaultValue={specialistDefault}
              placeholder="Ad Soyad"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
