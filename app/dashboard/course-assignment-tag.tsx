"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { unassignCourseFromCompany } from "./uzman-actions";

type Props = {
  courseId: string;
  companyId: string;
  label: string;
};

export function CourseAssignmentTag({ courseId, companyId, label }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      const r = await unassignCourseFromCompany(courseId, companyId);
      if (r.ok) {
        toast.success("Şirket ataması kaldırıldı.");
        router.refresh();
      } else {
        toast.error(r.error ?? "Atama kaldırılamadı.");
      }
    });
  }

  return (
    <span className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-white/10 bg-white/5 py-0.5 pl-2.5 pr-1 text-xs text-zinc-300">
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        onClick={handleRemove}
        disabled={pending}
        title="Atamayı kaldır"
        className="flex shrink-0 rounded-md p-1 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <X className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
    </span>
  );
}
