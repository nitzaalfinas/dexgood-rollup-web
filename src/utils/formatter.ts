import { DEFAULT_DECIMALS } from "@/config/token";

/**
 * Mempersingkat alamat blockchain untuk keperluan tampilan
 * @param address - Alamat blockchain lengkap
 * @param chars - Jumlah karakter yang ditampilkan di awal dan akhir (default: 4)
 * @returns Alamat yang dipersingkat dalam format "0x1234...5678"
 * @example shortenAddress("0x1234567890abcdef", 4) => "0x1234...cdef"
 */
export const shortenAddress = (address = "", chars = 4): string => {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Membersihkan dan memvalidasi input angka
 * Mempertahankan input desimal dan membatasi tempat desimal
 * @param value - Nilai input yang akan dibersihkan
 * @param decimals - Maksimal tempat desimal yang diizinkan (default: 18)
 * @returns String angka yang bersih tanpa koma
 * @example formatTokenAmount("1234567.123456", 6) => "1234567.123456"
 * @example formatTokenAmount("1234.", 6) => "1234." (mempertahankan titik di akhir)
 */
export const formatTokenAmount = (
  value: string,
  decimals: number = DEFAULT_DECIMALS
): string => {
  const cleaned = String(value)
    .replace(/[^0-9.]/g, "")
    .replace(/\.(?=.*\.)/g, "");

  if (!cleaned || cleaned === ".") return cleaned;

  const [intPart = "", decPart] = cleaned.split(".");

  return decPart !== undefined
    ? intPart + "." + decPart.substring(0, decimals)
    : cleaned.endsWith(".")
      ? intPart + "."
      : intPart;
};

/**
 * Menambahkan koma sebagai pemisah ribuan pada angka
 * @param value - String angka yang akan diformat
 * @returns String angka dengan koma sebagai pemisah ribuan
 * @example addCommas("1234567.89") => "1,234,567.89"
 * @example addCommas("1000") => "1,000"
 */
export const addCommas = (value: string): string => {
  if (!value || value === "" || value === ".") return value;

  const [intPart = "", decPart] = String(value).split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decPart !== undefined
    ? formattedInt + "." + decPart
    : value.endsWith(".")
      ? formattedInt + "."
      : formattedInt;
};

/**
 * Memformat angka dengan pemisah ribuan dan jumlah desimal yang tetap
 * Menggunakan toLocaleString untuk formatting yang sesuai dengan locale browser
 * @param n - Nilai yang akan diformat (number, string, atau any type)
 * @param d - Jumlah digit desimal yang ditampilkan (default: 2)
 * @returns String angka yang diformat dengan pemisah koma dan desimal tetap, atau "-" jika nilai invalid
 * @example formatNumberWithDecimals(1234.5, 2) => "1,234.50"
 * @example formatNumberWithDecimals(1000000, 0) => "1,000,000"
 * @example formatNumberWithDecimals("999.999", 3) => "999.999"
 * @example formatNumberWithDecimals(null) => "-"
 * @example formatNumberWithDecimals(undefined) => "-"
 * @example formatNumberWithDecimals("abc") => "-"
 */
export const formatNumberWithDecimals = (n: any, d = 2): string =>
  n !== undefined && n !== null && !isNaN(Number(n))
    ? Number(n).toLocaleString(undefined, {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : "-";
