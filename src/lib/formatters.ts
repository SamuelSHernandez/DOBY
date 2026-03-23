const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const currencyFormatterCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatCurrencyExact(amount: number): string {
  return currencyFormatterCents.format(amount);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatSqFt(widthFt: number, widthIn: number, heightFt: number, heightIn: number): number {
  const widthTotal = widthFt + widthIn / 12;
  const heightTotal = heightFt + heightIn / 12;
  return Math.round(widthTotal * heightTotal);
}

export function formatDimensions(ft: number, inches: number): string {
  if (inches === 0) return `${ft}'`;
  return `${ft}'${inches}"`;
}
