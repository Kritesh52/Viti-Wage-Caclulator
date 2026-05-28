/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { WageCalculationResult, PayFrequency } from '../types';
import { Coins, PiggyBank, Receipt, Wallet, Sparkles } from 'lucide-react';

interface WageBreakdownTableProps {
  calculation: WageCalculationResult;
}

export default function WageBreakdownTable({ calculation }: WageBreakdownTableProps) {
  const [activeTab, setActiveTab] = useState<PayFrequency>('fortnightly');

  const { annual, monthly, fortnightly, weekly, fnpfPercentage, employerFnpfPercentage } = calculation;

  const currentDetail = (() => {
    switch (activeTab) {
      case 'weekly': return weekly;
      case 'fortnightly': return fortnightly;
      case 'monthly': return monthly;
      case 'annual': return annual;
    }
  })();

  const activeLabel = (() => {
    switch (activeTab) {
      case 'weekly': return 'Weekly';
      case 'fortnightly': return 'Fortnightly';
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
    }
  })();

  // Format currency
  const formatFJD = (value: number) => {
    return new Intl.NumberFormat('en-FJ', {
      style: 'currency',
      currency: 'FJD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Percentage calculations relative to Gross
  const grossValue = currentDetail.gross;
  const fnpfValue = currentDetail.fnpfDeduction;
  const taxValue = currentDetail.incomeTax;
  const netValue = currentDetail.netPay;

  const fnpfPct = grossValue > 0 ? (fnpfValue / grossValue) * 100 : 0;
  const taxPct = grossValue > 0 ? (taxValue / grossValue) * 100 : 0;
  const netPct = grossValue > 0 ? (netValue / grossValue) * 100 : 0;

  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-950/25 border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-6 text-left animate-fade-in" id="wage-breakdown-panel">
      
      {/* Tab Switcher - Frosted Glass tabs */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-1 rounded-2xl" role="tablist">
        {(['weekly', 'fortnightly', 'monthly', 'annual'] as PayFrequency[]).map((tab) => (
          <button
            key={tab}
            id={`breakdown-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white/15 text-teal-300 border border-white/20 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'fortnightly' ? 'Fort' : tab === 'annual' ? 'Annual' : tab}
          </button>
        ))}
      </div>

      {/* Focus Numbers - Frosted highlight card */}
      <div className="text-center py-6 bg-white/10 dark:bg-black/20 rounded-3xl border border-white/15 shadow-2xl">
        <span className="text-[10px] uppercase font-bold tracking-widest text-teal-200 block">
          Estimated {activeLabel} Net Wage
        </span>
        <div className="text-4xl font-black font-mono text-teal-300 tracking-tight mt-1 animate-pulse">
          {formatFJD(currentDetail.netPay)}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1.5 flex items-center justify-center gap-1.5 font-bold">
          <span>Gross: {formatFJD(currentDetail.gross)}</span>
          <span className="text-white/30 font-mono">•</span>
          <span>Deductions: {formatFJD(currentDetail.fnpfDeduction + currentDetail.incomeTax)}</span>
        </div>
      </div>

      {/* Stacked Proportional Bar */}
      <div className="space-y-2.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-teal-200/80 block">
          Wages Distribution Proportions
        </span>
        <div className="h-6 bg-white/5 rounded-xl overflow-hidden flex shadow-inner border border-white/10">
          <div 
            className="h-full bg-emerald-400 hover:brightness-110 transition-all flex items-center justify-center text-[9px] font-black text-slate-950 overflow-hidden min-w-[20px]"
            style={{ width: `${netPct}%` }}
            title={`Net Take-home: ${netPct.toFixed(1)}%`}
          >
            {netPct > 15 && `Net ${netPct.toFixed(0)}%`}
          </div>
          <div 
            className="h-full bg-sky-450 hover:brightness-110 transition-all flex items-center justify-center text-[9px] font-black text-slate-950 overflow-hidden min-w-[20px]"
            style={{ width: `${fnpfPct}%` }}
            title={`FNPF: ${fnpfPct.toFixed(1)}%`}
          >
            {fnpfPct > 15 && `FNPF ${fnpfPct.toFixed(0)}%`}
          </div>
          <div 
            className="h-full bg-rose-450 hover:brightness-110 transition-all flex items-center justify-center text-[9px] font-black text-slate-950 overflow-hidden min-w-[20px]"
            style={{ width: `${taxPct}%` }}
            title={`PAYE Tax: ${taxPct.toFixed(1)}%`}
          >
            {taxPct > 15 && `Tax ${taxPct.toFixed(0)}%`}
          </div>
        </div>

        {/* Proportional bar legends */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-left">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-sm"></span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Take-Home</span>
            </div>
            <div className="pl-4 text-xs font-mono font-bold text-teal-200">
              {formatFJD(currentDetail.netPay)}
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-sky-450 rounded-sm"></span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">FNPF ({fnpfPercentage}%)</span>
            </div>
            <div className="pl-4 text-xs font-mono font-bold text-sky-200">
              {formatFJD(currentDetail.fnpfDeduction)}
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-rose-450 rounded-sm"></span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">PAYE Tax</span>
            </div>
            <div className="pl-4 text-xs font-mono font-bold text-rose-200">
              {formatFJD(currentDetail.incomeTax)}
            </div>
          </div>
        </div>
      </div>

      {/* Full comprehensive comparison table */}
      <div className="border-t border-white/10 pt-5 text-left">
        <h4 className="text-xs font-bold text-teal-200 uppercase tracking-widest mb-3.5">
          Tax Cycle Periodic Analysis
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-white/15 bg-white/5">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/10 text-teal-200 border-b border-white/15">
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-left">Pay Cycle components</th>
                <th className="py-3 px-2 font-bold uppercase tracking-wider text-right">Weekly</th>
                <th className="py-3 px-2 font-bold uppercase tracking-wider text-right">Fortnightly</th>
                <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-right">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-medium">
              {/* Gross Earnings */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3.5 text-white/90 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-white/50" />
                  Gross Wages
                </td>
                <td className="py-3 px-2 text-right font-mono text-white">{formatFJD(weekly.gross)}</td>
                <td className="py-3 px-2 text-right font-mono text-white">{formatFJD(fortnightly.gross)}</td>
                <td className="py-3 px-3.5 text-right font-mono font-black text-teal-300 bg-white/5">{formatFJD(annual.gross)}</td>
              </tr>

              {/* FNPF Contribution */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3.5 text-white/90 flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-sky-400" />
                  <span>FNPF Deduction ({fnpfPercentage}%)</span>
                </td>
                <td className="py-3 px-2 text-right font-mono text-white/75">-{formatFJD(weekly.fnpfDeduction)}</td>
                <td className="py-3 px-2 text-right font-mono text-white/75">-{formatFJD(fortnightly.fnpfDeduction)}</td>
                <td className="py-3 px-3.5 text-right font-mono font-semibold text-sky-300 bg-white/5">-{formatFJD(annual.fnpfDeduction)}</td>
              </tr>

              {/* PAYE Income Tax */}
              <tr className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3.5 text-white/90 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-400" />
                  FRCS PAYE Tax
                </td>
                <td className="py-3 px-2 text-right font-mono text-white/75">-{formatFJD(weekly.incomeTax)}</td>
                <td className="py-3 px-2 text-right font-mono text-white/75">-{formatFJD(fortnightly.incomeTax)}</td>
                <td className="py-3 px-3.5 text-right font-mono font-semibold text-rose-300 bg-white/5">-{formatFJD(annual.incomeTax)}</td>
              </tr>

              {/* Net Income footer */}
              <tr className="bg-emerald-500/10">
                <td className="py-3.5 px-3.5 text-emerald-300 font-bold flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-400 animate-bounce" />
                  Net Take-Home Pay
                </td>
                <td className="py-3.5 px-2 text-right font-mono font-bold text-emerald-200">{formatFJD(weekly.netPay)}</td>
                <td className="py-3.5 px-2 text-right font-mono font-bold text-emerald-200">{formatFJD(fortnightly.netPay)}</td>
                <td className="py-3.5 px-3.5 text-right font-mono font-black text-emerald-300 bg-emerald-500/20">{formatFJD(annual.netPay)}</td>
              </tr>

              {/* Match FNPF */}
              <tr className="bg-white/5">
                <td className="py-2.5 px-3.5 text-white/50 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 pl-5">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-ping"></span>
                  Employer FNPF ({employerFnpfPercentage}%)
                </td>
                <td className="py-2.5 px-2 text-right font-mono text-[10px] text-white/50 font-bold font-mono">+{formatFJD(weekly.employerFnpf)}</td>
                <td className="py-2.5 px-2 text-right font-mono text-[10px] text-white/50 font-bold font-mono">+{formatFJD(fortnightly.employerFnpf)}</td>
                <td className="py-2.5 px-3.5 text-right font-mono text-[10px] text-white/50 font-bold font-mono bg-white/5">+{formatFJD(annual.employerFnpf)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FNPF Matched Note */}
        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-3 items-start shadow-inner">
          <Sparkles className="w-5 h-5 text-teal-300 shrink-0 mt-0.5 animate-pulse" />
          <p className="text-[11px] text-white/80 leading-relaxed font-semibold">
            <strong className="text-teal-300 uppercase tracking-widest block text-[9px] mb-0.5">Total Pension Savings Base:</strong>
            By contributing {fnpfPercentage}%, combined with the statutory {employerFnpfPercentage}% employer share, your overall wealth compounding in your personal account increases by <strong className="font-mono text-teal-200">{formatFJD(annual.fnpfDeduction + annual.employerFnpf)}</strong> annually!
          </p>
        </div>
      </div>
    </div>
  );
}
