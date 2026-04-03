"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Loader2, RefreshCw, X } from "lucide-react";
import type { CompanyRow } from "@/lib/supabase";
import { initialCompanyMutationState } from "./dashboard-mutation-state";
import { updateCompany } from "./company-mutations";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateClientInvite(): string {
  let part = "";
  for (let i = 0; i < 5; i++) {
    part += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `KLR-${part}`;
}

type Props = {
  company: CompanyRow;
  onClose: () => void;
};

export function EditCompanyModal({ company, onClose }: Props) {
  const router = useRouter();
  const [inviteInput, setInviteInput] = useState(company.invite_code);
  const [state, formAction, isPending] = useActionState(
    updateCompany,
    initialCompanyMutationState
  );
  const handledOk = useRef(false);
  const lastErr = useRef<string | null>(null);

  useEffect(() => {
    if (state.ok && !handledOk.current) {
      handledOk.current = true;
      toast.success("Şirket güncellendi.");
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-company-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2
                id="edit-company-title"
                className="text-lg font-semibold text-white"
              >
                Şirketi düzenle
              </h2>
              <p className="text-xs text-zinc-500">Ad ve davet kodu</p>
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
          <input type="hidden" name="id" value={company.id} />

          <div>
            <label
              htmlFor={`edit-company-name-${company.id}`}
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Şirket adı
            </label>
            <input
              id={`edit-company-name-${company.id}`}
              name="name"
              type="text"
              required
              disabled={isPending}
              defaultValue={company.name}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor={`edit-company-invite-${company.id}`}
                className="text-sm font-medium text-zinc-300"
              >
                Davet kodu
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setInviteInput(generateClientInvite())}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" aria-hidden />
                Yenile
              </button>
            </div>
            <input
              id={`edit-company-invite-${company.id}`}
              name="invite_code"
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
              disabled={isPending}
              autoComplete="off"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-sm text-cyan-100 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
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
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
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
