interface CurrencyOptions {
  currency?: string;
  locale?: string;
  decimals?: number;
}

export function formatCurrency(
  value: number,
  { currency = "NGN", locale = "en-NG", decimals = 2 }: CurrencyOptions = {},
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatNumber(value: number, locale = "en-NG"): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCompactNumber(value: number, locale = "en-NG"): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}
