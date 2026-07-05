import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const idNumberFormatter = new Intl.NumberFormat("id-ID");
const idCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** Format a plain number with Indonesian grouping (no currency symbol). */
export function formatNumber(value: number): string {
  return idNumberFormatter.format(value);
}

/** Format a number as IDR currency */
export function formatCurrency(amount: number): string {
  return idCurrencyFormatter.format(amount);
}

function formatIndonesianDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions,
  empty = "-",
): string {
  if (!dateStr) return empty;
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", options).format(date);
  } catch {
    return dateStr;
  }
}

/** Format an ISO date string to localized Indonesian short date */
export function formatDate(dateStr: string): string {
  return formatIndonesianDate(dateStr, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format an ISO date string with time (settings audit / master data). */
export function formatDateTime(dateStr: string): string {
  return formatIndonesianDate(dateStr, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Extract a user-facing message from an unknown caught error. */
export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan koneksi",
): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.length > 0) return error;
  return fallback;
}
