export interface AmortizationRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
  totalPrincipal: number;
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

export function calculateTotalMonthly(
  monthlyPayment: number,
  propertyTaxAnnual: number,
  homeInsuranceAnnual: number,
  pmi: number
): number {
  return monthlyPayment + propertyTaxAnnual / 12 + homeInsuranceAnnual / 12 + pmi;
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number
): AmortizationRow[] {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return [];

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  const schedule: AmortizationRow[] = [];

  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalPrincipal += principalPaid;

    schedule.push({
      month,
      year: Math.ceil(month / 12),
      payment: monthlyPayment,
      principal: principalPaid,
      interest,
      balance,
      totalInterest,
      totalPrincipal,
    });
  }

  return schedule;
}

export function calculateEquity(
  purchasePrice: number,
  loanAmount: number,
  schedule: AmortizationRow[],
  currentMonth: number
): number {
  const downPayment = purchasePrice - loanAmount;
  if (currentMonth <= 0 || schedule.length === 0) return downPayment;
  const idx = Math.min(currentMonth - 1, schedule.length - 1);
  return downPayment + schedule[idx].totalPrincipal;
}

export function calculateHomeValue(
  purchasePrice: number,
  annualAppreciationRate: number,
  yearsOwned: number
): number {
  return purchasePrice * Math.pow(1 + annualAppreciationRate / 100, yearsOwned);
}
