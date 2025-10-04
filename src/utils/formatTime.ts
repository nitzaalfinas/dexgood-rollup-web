/**
 * Format waktu berdasarkan ISO date string
 * - Jika lebih dari 1 hari: mengembalikan dd/mm/yyyy
 * - Jika kurang dari 1 hari: mengembalikan hh:mm:ss
 * @param isoDate - ISO date string (contoh: "2025-08-20T10:30:45.000Z")
 * @returns String waktu yang diformat
 * @example
 * formatTimeFromISO("2025-08-19T10:30:45.000Z") => "19/08/2025" (jika hari ini 20 Agustus)
 * formatTimeFromISO("2025-08-20T10:30:45.000Z") => "10:30:45" (jika hari ini 20 Agustus)
 */
export const formatTimeFromISO = (isoDate: string): string => {
  const date = new Date(isoDate);
  const now = new Date();

  // Reset waktu ke midnight untuk perbandingan tanggal saja
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Jika tanggal berbeda (lebih dari sehari atau kurang dari sehari)
  if (dateOnly.getTime() !== nowOnly.getTime()) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Jika tanggal sama (hari ini), tampilkan waktu
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};
