export class AppUtils {
  static formatAmount(
    amount: number | string,
    options?: {
      currency?: string;
      decimals?: number;
    },
  ) {
    const { currency = "₦", decimals = 2 } = options || {};

    const value =
      typeof amount === "string" ? Number(amount.replace(/,/g, "")) : amount;

    if (Number.isNaN(value)) {
      return {
        whole: `${currency} 0`,
        decimal: ".00",
        full: `${currency} 0.00`,
      };
    }

    const formatted = value.toLocaleString("en-NG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    const [whole, decimal] = formatted.split(".");

    return {
      whole: `${currency} ${whole}`,
      decimal: decimal ? `.${decimal}` : "",
      full: `${currency} ${formatted}`,
    };
  }
}
