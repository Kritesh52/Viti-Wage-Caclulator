/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WageCalculationResult } from '../types';
import { Percent, TrendingUp, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TaxBracketMeterProps {
  calculation: WageCalculationResult;
}

export default function TaxBracketMeter({ calculation }: TaxBracketMeterProps) {
  const { 
    bracketsBreakdown, 
    annual, 
    totalTaxPaid, 
    marginalTaxRate, 
    effectiveTaxRate,
    isFnpfTaxExempt,
    fnpfPercentage
  } = calculation;

  // Format currency
  const formatFJD = (value: number) => {
    return new Intl.NumberFormat('en-FJ', {
      style: 'currency',
      currency: 'FJD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getTaxColor = (rate: number, isActive: boolean) => {
    if (!isActive) return 'border-white/5 opacity-30 text-white/40';
    if (rate === 0) return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    if (rate <= 0.20) return 'border-teal-400 bg-teal-400/20 text-teal-200';
    if (rate <= 0.35) return 'border-amber-400/50 bg-amber-400/15 text-amber-200';
    return 'border-rose-500/40 bg-rose-500/15 text-rose-200';
  };

  const getTaxBadgeClass = (rate: number) => {
    if (rate === 0) return 'bg-emerald-500 text-slate-950';
    if (rate <= 0.20) return 'bg-teal-400 text-slate-950';
    if (rate <= 0.35) return 'bg-amber-400 text-slate-950';
    return 'bg-rose-500 text-white';
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-950/25 border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-6 text-left animate-fade-in" id="tax-bracket-meter-panel">
      
      {/* Overview stats - Frosted twin cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-teal-200 font-bold uppercase tracking-widest text-[9px] mb-1">
            <Percent className="w-3.5 h-3.5 text-teal-300" />
            <span>Marginal</span>
          </div>
          <p className="text-2xl font-black text-white font-mono leading-none">
            {(marginalTaxRate * 100).toFixed(0)}%
          </p>
          <span className="text-[10px] text-white/50 block mt-1 font-semibold leading-tight">Top slab rate</span>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-teal-200 font-bold uppercase tracking-widest text-[9px] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-300" />
            <span>Effective</span>
          </div>
          <p className="text-2xl font-black text-white font-mono leading-none">
            {effectiveTaxRate.toFixed(1)}%
          </p>
          <span className="text-[10px] text-white/50 block mt-1 font-semibold leading-tight">Overall rate</span>
        </div>
      </div>

      {/* Tax thermometer progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] text-white/70 uppercase tracking-widest">
          <span className="font-bold flex items-center gap-1">
            Taxable Base allocation:
          </span>
          <span className="font-mono font-black text-teal-300">
            {formatFJD(annual.taxableIncome)}
          </span>
        </div>

        {/* Custom tiered progress meter with glass styling */}
        <div className="h-4 bg-white/10 border border-white/5 rounded-full overflow-hidden flex gap-0.5 shadow-inner" title="Fiji Tax Bands">
          <div 
            className="h-full bg-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
            style={{ width: `${Math.min(100, (annual.taxableIncome / 30000) * 100) * 0.3}%` }}
          />
          <div 
            className="h-full bg-teal-400 transition-all duration-500 shadow-[0_0_10px_rgba(45,212,191,0.3)]"
            style={{ 
              width: `${(annual.taxableIncome > 30000 
                ? Math.min(100, ((annual.taxableIncome - 30000) / 20000) * 100) 
                : 0) * 0.2}%` 
            }}
          />
          <div 
            className="h-full bg-amber-400 transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
            style={{ 
              width: `${(annual.taxableIncome > 50000 
                ? Math.min(100, ((annual.taxableIncome - 50000) / 220000) * 100) 
                : 0) * 0.35}%` 
            }}
          />
          <div 
            className="h-full bg-rose-500 transition-all duration-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
            style={{ 
              width: `${(annual.taxableIncome > 270000 
                ? Math.min(100, ((annual.taxableIncome - 270000) / 730000) * 100) 
                : 0) * 0.15}%` 
            }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] text-white/40 font-bold uppercase tracking-wider">
          <span>$0 (Free)</span>
          <span>30K</span>
          <span>50K</span>
          <span>270K</span>
          <span>1M+</span>
        </div>
      </div>

      {/* Step-by-step Formula Breakdown */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
        <h5 className="text-[10px] font-bold text-teal-300 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Step-by-Step PAYE Validation</span>
        </h5>
        
        {/* Step 1: Base Derivation */}
        <div className="space-y-1.5 text-xs">
          <span className="text-[9px] font-bold text-teal-200/80 uppercase tracking-wider block">
            Step 1: Compute Taxable Income Base
          </span>
          <div className="flex flex-col gap-1 p-2.5 bg-black/20 rounded-xl font-mono text-[11px] text-white/95">
            <div className="flex justify-between">
              <span className="text-white/60">Annual Gross Salary:</span>
              <span className="font-bold">{formatFJD(annual.gross)}</span>
            </div>
            {isFnpfTaxExempt && annual.fnpfDeduction > 0 ? (
              <>
                <div className="flex justify-between text-sky-305">
                  <span className="text-white/60">− Employee FNPF ({fnpfPercentage}%):</span>
                  <span className="text-sky-300">-{formatFJD(annual.fnpfDeduction)}</span>
                </div>
                <div className="border-t border-white/10 my-1"></div>
                <div className="flex justify-between font-black text-teal-300">
                  <span>= Net Taxable Base:</span>
                  <span>{formatFJD(annual.taxableIncome)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-white/50 text-[10px] pl-2">
                  <span>Standard Fiji PAYE Rule:</span>
                  <span className="font-semibold text-teal-300">No FNPF Deduction</span>
                </div>
                <div className="border-t border-white/10 my-1"></div>
                <div className="flex justify-between font-black text-teal-300">
                  <span>= Net Taxable Base:</span>
                  <span>{formatFJD(annual.taxableIncome)}</span>
                </div>
              </>
            )}
          </div>
          {!isFnpfTaxExempt ? (
            <div className="p-2.5 rounded-xl bg-teal-400/10 border border-teal-400/20 text-[10px] text-teal-200/90 leading-relaxed font-semibold">
              💡 <strong>Tax Resolution:</strong> Under standard Fiji regulations, your employee FNPF contribution is a post-tax deduction. PAYE is calculated directly based on your <strong>{formatFJD(annual.gross)}</strong> Gross Salary.
              <p className="mt-1 text-white/50 font-normal">
                To test custom models where FNPF is tax-deductible, expand <strong>"Configure Schedule"</strong> and check <strong>"FNPF is Tax-Exempt"</strong>!
              </p>
            </div>
          ) : fnpfPercentage > 0 && Math.round(annual.gross) === 50789 ? (
            <div className="p-2.5 rounded-xl bg-teal-400/10 border border-teal-400/20 text-[10px] text-teal-200/90 leading-relaxed font-semibold">
              💡 <strong>Tax Resolution:</strong> FNPF savings ({formatFJD(annual.fnpfDeduction)}) have been deducted tax-free. This lowers your taxable base to <strong>{formatFJD(annual.taxableIncome)}</strong>, holding you within the 2nd bracket.
              <p className="mt-1 text-white/50">
                To test your direct math on full gross: disable FNPF tax-exemptions in settings!
              </p>
            </div>
          ) : null}
        </div>

        {/* Step 2: Bracket formula trace */}
        <div className="space-y-1.5 text-xs">
          <span className="text-[9px] font-bold text-teal-200/80 uppercase tracking-wider block">
            Step 2: Apply Progressive Fiji Band Formula
          </span>
          <div className="bg-black/20 p-2.5 rounded-xl space-y-2 font-mono text-[11px] text-white/95 text-left" id="paye-progressive-formula-box">
            
            {/* Dynamic Formula Display */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl mb-3 space-y-2.5 text-center">
              <span className="text-[8px] font-bold text-teal-300 uppercase tracking-widest block text-left">
                Dynamic Math Equation:
              </span>
              <div className="text-[12px] font-extrabold text-teal-200 tracking-tight leading-relaxed select-all font-mono">
                {bracketsBreakdown.filter(b => b.taxableIncomeInBracket > 0)
                  .map(b => `(${new Intl.NumberFormat('en-FJ').format(Math.round(b.taxableIncomeInBracket))} × ${(b.rate * 100).toFixed(0)}%)`)
                  .join(' + ')
                }
              </div>
              <div className="text-[11px] font-bold text-white/95 flex justify-center gap-1.5 items-center bg-black/35 py-1.5 px-3 rounded-lg border border-white/5">
                <span>=</span>
                {bracketsBreakdown.filter(b => b.taxableIncomeInBracket > 0)
                  .map(b => `${new Intl.NumberFormat('en-FJ').format(Math.round(b.taxInBracket))}`)
                  .join(' + ')
                }
                <span className="text-emerald-300 font-extrabold ml-1 border-l border-white/10 pl-2">
                  {formatFJD(totalTaxPaid)}
                </span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed text-left border-t border-white/5 pt-2 mt-1 font-sans">
                ℹ️ Progressive taxes are calculated using your <strong>{formatFJD(annual.taxableIncome)}</strong> Net Taxable Base from Step 1 (after deducting FNPF pension savings) instead of your full gross salary.
              </p>
            </div>

            {bracketsBreakdown.filter(b => b.taxableIncomeInBracket > 0).map((bracket, index) => {
              // Find matching index in full list for proper labels
              const fullIndexText = bracket.rate === 0 
                ? "Band 1 (Tax-Free)" 
                : bracket.rate === 0.18 
                ? "Band 2 (18% Over 30K)" 
                : bracket.rate === 0.20 
                ? "Band 3 (20% Over 50K)"
                : `Band (${(bracket.rate*100).toFixed(0)}%)`;

              return (
                <div key={index} className="flex flex-col gap-0.5 pb-1.5 border-b border-white/5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between font-bold text-white/90">
                    <span>{fullIndexText}:</span>
                    <span className="text-teal-300 font-bold">+{formatFJD(bracket.taxInBracket)}</span>
                  </div>
                  <div className="text-[10px] text-white/50 pl-2">
                    {formatFJD(bracket.taxableIncomeInBracket)} taxable income in tier × {(bracket.rate * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}
            <div className="border-t border-white/10 my-1.5"></div>
            <div className="flex justify-between font-black text-teal-300">
              <span>Total PAYE Tax Calculated:</span>
              <span className="text-emerald-300 text-xs font-black">{formatFJD(totalTaxPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax bracket list */}
      <div className="border-t border-white/10 pt-4 space-y-4">
        <h4 className="text-xs font-bold text-teal-200 tracking-widest uppercase flex items-center justify-between">
          <span>PAYE Progressive Tiers</span>
          <span className="text-[9px] font-semibold text-white/40 lowercase italic">progressive deduction flow</span>
        </h4>

        {/* List of brackets */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {bracketsBreakdown.map((bracket, idx) => {
            const isHighestActive = calculation.currentBracketIndex === idx;
            
            return (
              <div 
                key={idx}
                id={`tax-bracket-card-${idx}`}
                className={`p-3.5 rounded-2xl border transition-all duration-300 text-left ${getTaxColor(bracket.rate, bracket.isActive)} ${
                  isHighestActive ? 'ring-2 ring-teal-400/50 scale-[1.01] shadow-lg font-bold' : ''
                }`}
              >
                {/* Header row */}
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-[13px] tracking-tight">
                      <span className="text-white">{bracket.description}</span>
                      {isHighestActive && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wider bg-teal-400 text-slate-950 animate-pulse">
                          Active Tier
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      Base Rate: {(bracket.rate * 100).toFixed(0)}%
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold pb-0.5 tracking-tight ${getTaxBadgeClass(bracket.rate)}`}>
                    {(bracket.rate * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Sub details if active */}
                {bracket.isActive && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-white/40 text-[9px] font-bold uppercase tracking-wide block">Income in bracket: </span>
                      <strong className="font-mono text-white leading-normal text-xs">{formatFJD(bracket.taxableIncomeInBracket)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-white/40 text-[9px] font-bold uppercase tracking-wide block">Tax contribution: </span>
                      <strong className="font-mono text-teal-300 leading-normal text-xs">{formatFJD(bracket.taxInBracket)}</strong>
                    </div>
                  </div>
                )}
                
                {/* Specific details on non-taxed brackets */}
                {idx === 0 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-500/15 py-1 px-2.5 rounded-lg w-fit border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    First FJD 30,000 is 100% Tax-Free
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
