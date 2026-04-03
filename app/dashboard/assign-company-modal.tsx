"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2, Send, X } from "lucide-react";
import type { CompanyRow } from "@/lib/supabase";
import {
  assignCourseToCompany,
  type AssignCourseState,
} from "./uzman-actions";

const initialAssignState: AssignCourseState = { ok: false, error: null };

type Props = {
  courseId: string;
  courseTitle: string;
  companies: CompanyRow[];
  assignedCompanyIds: string[];
};

export function AssignCompanyModal({
  courseId,
  courseTitle,
  companies,
  assignedCompanyIds,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    assignCourseToCompany,
    initialAssignState
  );
  const lastHandledOk = useRef(false);
  const lastError = useRef<string | null>(null);

  const available = companies.filter((c) => !assignedCompanyIds.includes(c.id));

  useEffect(() => {
    if (state.ok && !lastHandledOk.current) {
      lastHandledOk.current = true;
      toast.success("Eğitim şirkete atandı.");
      setOpen(false);
      router.refresh();
    }
    if (!state.ok) {
      lastHandledOk.current = false;
    }
  }, [state.ok, router]);

  useEffect(() => {
    if (state.error && state.error !== lastError.current) {
      lastError.current = state.error;
      toast.error(state.error);
    }
    if (!state.error) {
      lastError.current = null;
    }
  }, [state.error]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={available.length === 0}
        className="inline-flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        Şirkete ata
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3
                  id="assign-modal-title"
                  className="text-lg font-semibold text-white"
                >
                  Şirkete ata
                </h3>
                <p className="mt-1 text-sm text-zinc-400">{courseTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {available.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">
                Tüm şirketlere atanmış veya atanabilecek şirket kalmadı.
              </p>
            ) : (
              <form action={formAction} className="mt-6 space-y-4">
                <input type="hidden" name="course_id" value={courseId} />
                <div>
                  <label
                    htmlFor={`company-${courseId}`}
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Şirket seçin
                  </label>
                  <select
                    id={`company-${courseId}`}
                    name="company_id"
                    required
                    disabled={isPending}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Seçin…
                    </option>
                    {available.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.invite_code})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden />
                  )}
                  Atamayı kaydet
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
