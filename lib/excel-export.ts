/** Tarayıcıda .xlsx indirme (SheetJS). */

export type PersonelExcelRow = {
  Ad: string;
  "E-posta": string;
  Şirket: string;
  "Atanan eğitim": number;
};

export type SirketExcelRow = {
  "Şirket adı": string;
  "Davet kodu": string;
};

function todaySlug(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function downloadPersonelExcel(rows: PersonelExcelRow[]): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Personel");
  XLSX.writeFile(wb, `kalibre-personel-${todaySlug()}.xlsx`);
}

export async function downloadSirketlerExcel(rows: SirketExcelRow[]): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Şirketler");
  XLSX.writeFile(wb, `kalibre-sirketler-${todaySlug()}.xlsx`);
}
