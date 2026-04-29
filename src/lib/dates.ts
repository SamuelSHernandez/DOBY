import { format, formatDistanceToNow, differenceInDays, differenceInYears, parseISO, addMonths } from "date-fns";

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return format(parseISO(dateStr), "MMM d, yyyy");
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "—";
  return format(parseISO(dateStr), "MM/dd/yy");
}

export function formatRelative(dateStr: string): string {
  if (!dateStr) return "—";
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function daysUntil(dateStr: string): number {
  if (!dateStr) return 0;
  return differenceInDays(parseISO(dateStr), new Date());
}

/**
 * Days until `months` after `startDate`. Honors actual calendar months
 * (Jan→Feb is 28-31 days, not a flat 30) so reminders don't drift.
 */
export function daysUntilAfterMonths(startDate: string, months: number): number {
  if (!startDate || months <= 0) return 0;
  return differenceInDays(addMonths(parseISO(startDate), months), new Date());
}

export function yearsElapsed(dateStr: string): number {
  if (!dateStr) return 0;
  return differenceInYears(new Date(), parseISO(dateStr));
}

export function yearsFractional(dateStr: string): number {
  if (!dateStr) return 0;
  const days = differenceInDays(new Date(), parseISO(dateStr));
  return days / 365.25;
}

export function monthsSinceStart(startDateStr: string): number {
  if (!startDateStr) return 0;
  const start = parseISO(startDateStr);
  const now = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function currentYear(): number {
  return new Date().getFullYear();
}
