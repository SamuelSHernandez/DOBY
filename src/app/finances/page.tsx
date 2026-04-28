"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useDobyStore } from "@/store";
import { useShallow } from "zustand/react/shallow";
import { calculateMonthlyPayment, calculateTotalMonthly, calculateHomeValue } from "@/lib/mortgage";
import { monthsSinceStart } from "@/lib/dates";
import { formatCurrency, formatSqFt, formatNumber } from "@/lib/formatters";
import { fd as formData } from "@/lib/form";
import PageHeader from "@/components/layout/PageHeader";
import StatBox from "@/components/shared/StatBox";
import CostBreakdown from "@/components/finances/CostBreakdown";
import RoomCostAttribution from "@/components/finances/RoomCostAttribution";
import ExpenseTracker from "@/components/finances/ExpenseTracker";
import InsurancePanel from "@/components/finances/InsurancePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeature } from "@/lib/useFeature";
import { Calculator, ChevronDown, ImagePlus, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FinancesPage() {
  const { mortgage, property, appreciation, rooms } = useDobyStore(useShallow((s) => ({
    mortgage: s.mortgage, property: s.property,
    appreciation: s.appreciation, rooms: s.rooms,
  })));
  const updateProperty = useDobyStore((s) => s.updateProperty);
  const updateMortgage = useDobyStore((s) => s.updateMortgage);

  const showExpenses = useFeature("expenseTracker");
  const showInsurance = useFeature("insurancePanel");
  const showMortgageCalc = useFeature("mortgageCalculator");
  const showCostBreakdown = useFeature("costBreakdown");
  const showRoomCost = useFeature("roomCostAttribution");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { totalMonthly, annualProjection, currentValue, appreciationGain, yearsOwned, totalSqFt, highestRoom, highestPct } = useMemo(() => {
    const monthlyPI = calculateMonthlyPayment(mortgage.loanAmount, mortgage.interestRate, mortgage.termYears);
    const _totalMonthly = calculateTotalMonthly(monthlyPI, mortgage.propertyTaxAnnual, mortgage.homeInsuranceAnnual, mortgage.pmi);
    const months = mortgage.startDate ? monthsSinceStart(mortgage.startDate) : 0;
    const yearsOwned = months / 12;
    const _currentValue = property.purchasePrice > 0
      ? calculateHomeValue(property.purchasePrice, appreciation.annualRate, yearsOwned) : 0;
    const roomData = rooms.map((r) => ({ name: r.name, sqft: formatSqFt(r.widthFt, r.widthIn, r.heightFt, r.heightIn) }));
    const _totalSqFt = roomData.reduce((sum, r) => sum + r.sqft, 0);
    const _highestRoom = [...roomData].sort((a, b) => b.sqft - a.sqft)[0];
    return {
      totalMonthly: _totalMonthly,
      annualProjection: _totalMonthly * 12,
      currentValue: _currentValue,
      appreciationGain: _currentValue - property.purchasePrice,
      yearsOwned,
      totalSqFt: _totalSqFt,
      highestRoom: _highestRoom,
      highestPct: _highestRoom && _totalSqFt > 0 ? Math.round((_highestRoom.sqft / _totalSqFt) * 100) : 0,
    };
  }, [mortgage, property, appreciation, rooms]);

  function saveProperty(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = formData(new FormData(e.currentTarget));
    updateProperty({
      purchasePrice: f.num("purchasePrice"), closingCosts: f.num("closingCosts"),
      address: f.str("address"), squareFeet: f.num("squareFeet"),
      yearBuilt: f.num("yearBuilt"), lotSize: f.str("lotSize"), hoaMonthly: f.num("hoaMonthly"),
    });
    toast.success("Property details saved");
  }

  function saveMortgage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = formData(new FormData(e.currentTarget));
    updateMortgage({
      loanAmount: f.num("loanAmount"), downPayment: f.num("downPayment"),
      interestRate: f.num("interestRate"), termYears: f.num("termYears") || 30,
      propertyTaxAnnual: f.num("propertyTaxAnnual"), homeInsuranceAnnual: f.num("homeInsuranceAnnual"),
      pmi: f.num("pmi"), loanProgram: f.str("loanProgram"),
    });
    toast.success("Mortgage details saved");
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProperty({ homeImage: reader.result as string });
      toast.success("Image saved");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <PageHeader title="Finances" />

      {/* Property details — muted inline text */}
      <p className="mb-4 text-[11px] text-text-tertiary">
        {[
          property.address,
          property.squareFeet > 0 && `${formatNumber(property.squareFeet)} sq ft`,
          property.yearBuilt > 0 && `Built ${property.yearBuilt}`,
          property.hoaMonthly > 0 && `HOA ${formatCurrency(property.hoaMonthly)}/mo`,
        ].filter(Boolean).join(" · ") || "No property details configured"}
      </p>

      {/* Valuation */}
      <h2 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Valuation</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatBox label="Home Price" value={property.purchasePrice > 0 ? formatCurrency(property.purchasePrice) : "—"} />
        <StatBox
          label="Current Value"
          value={currentValue > 0 ? formatCurrency(currentValue) : "—"}
          variant={appreciationGain > 0 ? "nominal" : "default"}
        />
        <StatBox
          label={yearsOwned > 0 ? `Appreciation (${yearsOwned.toFixed(1)}yr)` : "Appreciation"}
          value={appreciationGain !== 0 ? `${appreciationGain > 0 ? "+" : ""}${formatCurrency(appreciationGain)}` : "—"}
          variant={appreciationGain > 0 ? "nominal" : appreciationGain < 0 ? "critical" : "default"}
        />
        <StatBox label="Appreciation Rate" value={appreciation.annualRate > 0 ? `${appreciation.annualRate}% / yr` : "—"} />
      </div>

      {/* Monthly costs */}
      <h2 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Monthly Costs</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatBox label="Monthly Payment" value={totalMonthly > 0 ? formatCurrency(totalMonthly) : "—"} />
        <StatBox label="Annual Cost" value={annualProjection > 0 ? formatCurrency(annualProjection) : "—"} />
        <StatBox label="Highest Cost Room" value={highestRoom ? `${highestRoom.name} (${highestPct}%)` : "—"} />
      </div>

      {(showCostBreakdown || showRoomCost) && (
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {showCostBreakdown && <CostBreakdown />}
          {showRoomCost && <RoomCostAttribution />}
        </div>
      )}

      {showExpenses && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Expenses</h2>
          <ExpenseTracker />
        </div>
      )}

      {showInsurance && (
        <div className="mb-8">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-primary">Insurance</h2>
          <InsurancePanel />
        </div>
      )}

      {/* Mortgage Calculator Link */}
      {showMortgageCalc && <Link
        href="/finances/mortgage"
        className="mb-8 flex items-center justify-between border border-border bg-surface px-5 py-4 transition-colors hover:border-border-bright"
      >
        <div className="flex items-center gap-3">
          <Calculator size={18} className="text-azure" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Mortgage Acceleration Calculator</p>
            <p className="text-[11px] text-text-tertiary">See how extra payments shorten your loan and save on interest</p>
          </div>
        </div>
        <span className="text-text-tertiary">&rsaquo;</span>
      </Link>}

      {/* Collapsible Property & Mortgage Details — at bottom so dashboard is visible first */}
      <div className="mb-8 border border-border bg-surface">
        <button
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Property & Mortgage Details</span>
          <ChevronDown size={16} className={cn("text-text-tertiary transition-transform", detailsOpen && "rotate-180")} />
        </button>

        {detailsOpen && (
          <div className="border-t border-border px-5 pb-5 pt-4">
            {/* Home image */}
            <div className="mb-6">
              <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Home Photo</Label>
              <div className="mt-2">
                {property.homeImage ? (
                  <div className="relative">
                    <img
                      src={property.homeImage}
                      alt="Home"
                      className="h-40 w-full border border-border object-cover"
                    />
                    <button
                      onClick={() => updateProperty({ homeImage: "" })}
                      className="absolute right-2 top-2 border border-border bg-panel px-2 py-1 text-[10px] text-text-tertiary hover:text-oxblood"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex h-32 w-full items-center justify-center border border-dashed border-border text-text-tertiary hover:border-border-bright hover:text-text-secondary"
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <ImagePlus size={20} />
                      <span className="text-[11px]">Upload home photo</span>
                    </div>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>

            {/* Property form */}
            <form onSubmit={saveProperty}>
              <h3 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Property</h3>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Home Price</Label>
                  <Input name="purchasePrice" type="number" defaultValue={property.purchasePrice || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Closing Costs</Label>
                  <Input name="closingCosts" type="number" defaultValue={property.closingCosts || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Address</Label>
                  <Input name="address" defaultValue={property.address} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Square Feet</Label>
                  <Input name="squareFeet" type="number" defaultValue={property.squareFeet || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Year Built</Label>
                  <Input name="yearBuilt" type="number" defaultValue={property.yearBuilt || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Lot Size</Label>
                  <Input name="lotSize" defaultValue={property.lotSize} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">HOA (Monthly)</Label>
                  <Input name="hoaMonthly" type="number" defaultValue={property.hoaMonthly || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
              </div>
              <Button type="submit" size="sm" className="gap-1.5">
                <Save size={14} />
                Save Property
              </Button>
            </form>

            <div className="my-6 border-t border-border" />

            {/* Mortgage form */}
            <form onSubmit={saveMortgage}>
              <h3 className="mb-3 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Mortgage</h3>
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Loan Amount</Label>
                  <Input name="loanAmount" type="number" defaultValue={mortgage.loanAmount || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Down Payment</Label>
                  <Input name="downPayment" type="number" defaultValue={mortgage.downPayment || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Interest Rate (%)</Label>
                  <Input name="interestRate" type="number" step="0.125" defaultValue={mortgage.interestRate || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Term (Years)</Label>
                  <Input name="termYears" type="number" defaultValue={mortgage.termYears || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Property Tax (Annual)</Label>
                  <Input name="propertyTaxAnnual" type="number" defaultValue={mortgage.propertyTaxAnnual || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Insurance (Annual)</Label>
                  <Input name="homeInsuranceAnnual" type="number" defaultValue={mortgage.homeInsuranceAnnual || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">PMI (Monthly)</Label>
                  <Input name="pmi" type="number" defaultValue={mortgage.pmi || ""} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-text-tertiary">Loan Program</Label>
                  <Input name="loanProgram" defaultValue={mortgage.loanProgram} className="mt-1 border-border bg-carbon text-text-primary" />
                </div>
              </div>
              <Button type="submit" size="sm" className="gap-1.5">
                <Save size={14} />
                Save Mortgage
              </Button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
