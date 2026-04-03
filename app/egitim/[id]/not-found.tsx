import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function EgitimNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 text-center text-zinc-50">
      <GraduationCap className="mb-4 h-12 w-12 text-zinc-600" aria-hidden />
      <h1 className="text-xl font-semibold">Eğitim bulunamadı</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Bu içeriğe erişim yetkiniz yok veya bağlantı geçersiz.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 text-sm font-medium text-violet-400 hover:text-violet-300"
      >
        Panele dön
      </Link>
    </div>
  );
}
