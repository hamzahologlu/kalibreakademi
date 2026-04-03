"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Check,
  Copy,
  Loader2,
  PlusCircle,
  RefreshCw,
  X,
} from "lucide-react";
import {
  createCompany,
  type CreateCompanyState,
} from "./create-company-actions";

const initial: CreateCompanyState = {
  ok: false,
  error: null,
  company: null,
};

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateClientInvite(): string {
  let part = "";
  for (let i = 0; i < 5; i++) {
    part += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `KLR-${part}`;
}

function AddCompanyModalInner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [inviteInput, setInviteInput] = useState(generateClientInvite);
  const [state, formAction, isPending] = useActionState(createCompany, initial);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.ok && state.company) {
      toast.success("Şirket kaydedildi.");
      router.refresh();
    }
  }, [state.ok, state.company, router]);

  const handleCopy = async () => {
    if (!state.company?.invite_code) return;
    try {
      await navigator.clipboard.writeText(state.company.invite_code);
      setCopied(true);
      toast.success("Davet kodu kopyalandı.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Kopyalanamadı.");
    }
  };

  if (state.ok && state.company) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-success-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          aria-label="Kapat"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-500/25 bg-zinc-900 p-6 shadow-2xl">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Check className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="company-success-title"
                className="text-lg font-semibold text-white"
              >
                Şirket eklendi
              </h2>
              <p className="mt-1 text-sm text-zinc-400">{state.company.name}</p>
              <div className="mt-4 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Davet kodu
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 break-all font-mono text-base text-cyan-300">
                    {state.company.invite_code}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:bg-white/10"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden />
                    )}
                    Kopyala
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3 text-sm font-semibold text-white"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-form-title"
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
                id="company-form-title"
                className="text-lg font-semibold text-white"
              >
                Yeni şirket
              </h2>
              <p className="text-xs text-zinc-500">
                Firma adı ve personel kaydı için davet kodu
              </p>
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
          <div>
            <label
              htmlFor="company-name"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              Şirket adı
            </label>
            <input
              id="company-name"
              name="name"
              type="text"
              required
              disabled={isPending}
              placeholder="Örn. Kalibre İnşaat"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label
                htmlFor="company-invite"
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
              id="company-invite"
              name="invite_code"
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
              disabled={isPending}
              placeholder="KLR-XXXXX"
              autoComplete="off"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-sm text-cyan-100 placeholder:text-zinc-600 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Otomatik üretilir; dilerseniz düzenleyebilirsiniz. Boş bırakırsanız
              sunucu benzersiz kod üretir.
            </p>
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

export function AddCompanyModal() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSession((s) => s + 1);
          setOpen(true);
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-500/35 bg-gradient-to-r from-cyan-600/90 to-cyan-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:from-cyan-500 hover:to-cyan-400"
      >
        <PlusCircle className="h-4 w-4" aria-hidden />
        Yeni Şirket Ekle
      </button>

      {open ? (
        <AddCompanyModalInner
          key={session}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
