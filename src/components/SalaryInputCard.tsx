/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PayFrequency } from '../types';
import { Sliders, Calendar, Clock, Sparkles, Shield, Tag } from 'lucide-react';

interface SalaryInputCardProps {
  salary: number;
  setSalary: (s: number) => void;
  frequency: PayFrequency;
  setFrequency: (f: PayFrequency) => void;
  residencyStatus: 'resident' | 'non-resident';
  setResidencyStatus: (r: 'resident' | 'non-resident') => void;
  fnpfPercent: number;
  setFnpfPercent: (p: number) => void;
  isFnpfTaxExempt: boolean;
  setIsFnpfTaxExempt: (e: boolean) => void;
  hoursPerWeek: number;
  setHoursPerWeek: (h: number) => void;
  daysPerWeek: number;
  setDaysPerWeek: (d: number) => void;
}

export default function SalaryInputCard({
  salary,
  setSalary,
  frequency,
  setFrequency,
  residencyStatus,
  setResidencyStatus,
  fnpfPercent,
  setFnpfPercent,
  isFnpfTaxExempt,
  setIsFnpfTaxExempt,
  hoursPerWeek,
  setHoursPerWeek,
  daysPerWeek,
  setDaysPerWeek,
}: SalaryInputCardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fiji Common Salary Presets
  const PRESETS = [
    { label: 'Entry Level', amount: 15000, freq: 'annual' as PayFrequency, desc: 'FJD 15k/yr' },
    { label: 'Civil Servant', amount: 35000, freq: 'annual' as PayFrequency, desc: 'FJD 35k/yr' },
    { label: 'Mid-Senior Officer', amount: 65000, freq: 'annual' as PayFrequency, desc: 'FJD 65k/yr' },
    { label: 'Director / Exec', amount: 120000, freq: 'annual' as PayFrequency, desc: 'FJD 120k/yr' },
    { label: 'Fortnightly Base', amount: 1200, freq: 'fortnightly' as PayFrequency, desc: 'FJD 1.2k/fn' },
  ];

  const handleSalaryChange = (valStr: string) => {
    const rawVal = parseFloat(valStr.replace(/[^0-9.]/g, ''));
    if (isNaN(rawVal)) {
      setSalary(0);
    } else {
      setSalary(rawVal);
    }
  };

  const handlePresetSelect = (amount: number, freq: PayFrequency) => {
    setSalary(amount);
    setFrequency(freq);
  };

  const incrementFnpf = () => {
    setFnpfPercent(Math.min(100, fnpfPercent + 1));
  };

  const decrementFnpf = () => {
    setFnpfPercent(Math.max(8, fnpfPercent - 1)); // Statutory min is usually 8%
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-950/25 border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-6 text-left" id="salary-input-panel">
      {/* Salary input and Frequency */}
      <div className="space-y-2">
        <label htmlFor="salary-amount-input" className="text-xs font-bold uppercase tracking-widest text-teal-200 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-teal-300" />
          Enter Annual / Periodic Wage (FJD)
        </label>
        
        <div className="relative rounded-2xl border border-white/15 focus-within:ring-2 focus-within:ring-teal-400 bg-white/5 flex items-center overflow-hidden shadow-inner backdrop-blur-md transition-all">
          <span className="pl-4 pr-1 text-xl font-bold text-teal-300/80 font-mono">
            $
          </span>
          <input
            id="salary-amount-input"
            type="text"
            inputMode="decimal"
            value={salary === 0 ? '' : salary.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            onChange={(e) => handleSalaryChange(e.target.value)}
            placeholder="0.00"
            className="w-full pl-2 pr-4 py-4 bg-transparent text-2xl font-black font-mono text-white focus:outline-none placeholder-white/30"
          />
        </div>
      </div>

      {/* Fiji Tax Residency Status Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-teal-200/80 uppercase tracking-widest block">
          Tax Residency Status (Table Columns 2 & 3):
        </span>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 border border-white/5 rounded-2xl" role="tablist">
          <button
            id="resid-btn-resident"
            onClick={() => setResidencyStatus('resident')}
            role="tab"
            aria-selected={residencyStatus === 'resident'}
            type="button"
            className={`py-2 px-1 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 flex flex-col items-center justify-center ${
              residencyStatus === 'resident'
                ? 'bg-gradient-to-r from-teal-400/20 to-emerald-400/20 text-teal-350 border border-teal-400/30 shadow-md ring-1 ring-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-xs">Fiji Resident</span>
            <span className="text-[9px] font-medium opacity-60 leading-tight">Col 2: Free up to $30K</span>
          </button>
          <button
            id="resid-btn-non-resident"
            onClick={() => setResidencyStatus('non-resident')}
            role="tab"
            aria-selected={residencyStatus === 'non-resident'}
            type="button"
            className={`py-2 px-1 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 flex flex-col items-center justify-center ${
              residencyStatus === 'non-resident'
                ? 'bg-gradient-to-r from-rose-400/20 to-amber-500/25 text-rose-300 border border-rose-400/30 shadow-md ring-1 ring-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-xs">Non-Resident</span>
            <span className="text-[9px] font-medium opacity-60 leading-tight">Col 3: Flat 20% Start</span>
          </button>
        </div>
      </div>

      {/* Pay Frequency Selection tabs with frosted tabs */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-teal-200/80 uppercase tracking-widest block">
          Payment Interval Calculation Base:
        </span>
        <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl" role="tablist">
          {(['weekly', 'fortnightly', 'monthly', 'annual'] as PayFrequency[]).map((freq) => (
            <button
              key={freq}
              id={`freq-btn-${freq}`}
              onClick={() => setFrequency(freq)}
              role="tab"
              aria-selected={frequency === freq}
              className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                frequency === freq
                  ? 'bg-white/15 text-teal-350 border border-white/20 shadow-md ring-1 ring-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {freq === 'fortnightly' ? 'Fort' : freq === 'annual' ? 'Annual' : freq}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended presets with premium glassy buttons */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-300 fill-teal-300/20" />
          <span className="text-[10px] font-bold text-teal-200 uppercase tracking-widest block">
            Fiji Standard Wage Presets
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              id={`preset-btn-${idx}`}
              onClick={() => handlePresetSelect(preset.amount, preset.freq)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/30 text-left rounded-xl transition-all shadow-sm shrink-0"
            >
              <div className="font-bold text-white text-xs">{preset.label}</div>
              <div className="text-[9px] text-white/50 select-none">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* FNPF Contribution Section */}
      <div className="space-y-3.5 border-t border-white/10 pt-5">
        <div className="flex justify-between items-center">
          <div>
            <label htmlFor="fnpf-range" className="text-xs font-bold uppercase tracking-widest text-teal-200 block">
              FNPF Contribution %
            </label>
            <span className="text-[10px] text-white/50">Personal goal adjustment</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={decrementFnpf} 
              id="fnpf-dec"
              disabled={fnpfPercent <= 8}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold font-mono text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center text-lg font-black text-teal-300 font-mono">
              {fnpfPercent}%
            </span>
            <button 
              onClick={incrementFnpf} 
              id="fnpf-inc"
              disabled={fnpfPercent >= 100}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold font-mono text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Custom custom slider style */}
        <div className="space-y-2">
          <input
            id="fnpf-range"
            type="range"
            min="8"
            max="30"
            step="1"
            value={fnpfPercent}
            onChange={(e) => setFnpfPercent(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[9px] text-white/40 px-0.5 font-bold uppercase tracking-wider">
            <span>8% (Law Min)</span>
            <span>12%</span>
            <span>15%</span>
            <span>20%</span>
            <span>30% (Savings)</span>
          </div>
          {isFnpfTaxExempt && fnpfPercent > 0 ? (
            <span className="text-[10px] text-teal-300 font-semibold block mt-1.5 flex items-center gap-1 bg-teal-400/10 border border-teal-400/20 py-1.5 px-3 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span><strong>Fiji Rule:</strong> FNPF is Tax-Exempt.{fnpfPercent}% lowers your PAYE taxable base.</span>
            </span>
          ) : (
            <span className="text-[10px] text-amber-300 font-semibold block mt-1.5 flex items-center gap-1 bg-amber-400/10 border border-amber-400/20 py-1.5 px-3 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
              <span><strong>Pure Gross Mode:</strong> PAYE is charged directly on full gross salary.</span>
            </span>
          )}
        </div>
      </div>

      {/* Advanced Settings Expandable */}
      <div className="border-t border-white/10 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          id="btn-toggle-advanced"
          className="flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors uppercase tracking-widest"
        >
          <Sliders className={`w-3.5 h-3.5 text-teal-400 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} />
          <span>{showAdvanced ? 'Hide parameters' : 'Configure Schedule'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pt-1 animate-fade-in text-left">
            {/* Work schedule indicators */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor="hours-per-week" className="text-[10px] uppercase font-bold tracking-wider text-teal-200/80 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  Hours / Week
                </label>
                <input
                  id="hours-per-week"
                  type="number"
                  min="1"
                  max="168"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Math.max(1, Math.min(168, parseInt(e.target.value) || 40)))}
                  className="w-full p-2.5 text-sm font-bold border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="days-per-week" className="text-[10px] uppercase font-bold tracking-wider text-teal-200/80 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-400" />
                  Days / Week
                </label>
                <input
                  id="days-per-week"
                  type="number"
                  min="1"
                  max="7"
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Math.max(1, Math.min(7, parseInt(e.target.value) || 5)))}
                  className="w-full p-2.5 text-sm font-bold border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* FNPF Tax exemption setting toggle */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-300" />
                  FNPF is Tax-Exempt
                </span>
                <p className="text-[10px] text-white/50 leading-relaxed font-semibold">
                  PAYE is computed on taxable base (Gross minus employee FNPF shares). Uncheck to enforce tax charges on gross totals.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  id="chk-tax-exempt"
                  checked={isFnpfTaxExempt}
                  onChange={(e) => setIsFnpfTaxExempt(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-400"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
