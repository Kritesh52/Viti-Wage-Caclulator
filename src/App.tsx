/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import AndroidFrame from './components/AndroidFrame';
import SalaryInputCard from './components/SalaryInputCard';
import WageBreakdownTable from './components/WageBreakdownTable';
import TaxBracketMeter from './components/TaxBracketMeter';
import FijiResources from './components/FijiResources';
import ExpensePlanner from './components/ExpensePlanner';
import { calculateWages } from './utils/calculator';
import { PayFrequency } from './types';
import { useFirebase } from './context/FirebaseContext';
import { Calculator, Percent, Sparkles, BookOpen, Pocket, X, Sliders } from 'lucide-react';

export default function App() {
  const { user, isLoggingIn, loginWithGoogle, logout, settings, saveSettings } = useFirebase();

  // Core user states
  const [salary, setSalary] = useState<number>(65000); // Set default to match fixed design state
  const [frequency, setFrequency] = useState<PayFrequency>('annual');
  const [residencyStatus, setResidencyStatus] = useState<'resident' | 'non-resident'>('resident');
  const [fnpfPercent, setFnpfPercent] = useState<number>(8); // Defaults to law minimum 8%
  const [isFnpfTaxExempt, setIsFnpfTaxExempt] = useState<boolean>(false); // FNPF is not tax-deductible under standard Fiji PAYE tax rules
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);

  // Active view tab centered around specific variables (avoiding congested parallel display columns)
  const [activeTab, setActiveTab] = useState<'inputs' | 'breakdown' | 'brackets' | 'planner' | 'guides'>('inputs');

  // Synchronize initial settings load from database (or guest local storage) on boot and auth events
  useEffect(() => {
    if (settings) {
      setSalary(settings.salary);
      setFrequency(settings.frequency);
      setResidencyStatus(settings.residencyStatus);
      setFnpfPercent(settings.fnpfPercent);
      setIsFnpfTaxExempt(settings.isFnpfTaxExempt);
      setHoursPerWeek(settings.hoursPerWeek);
      setDaysPerWeek(settings.daysPerWeek);
    }
  }, [settings]);

  // Save settings debounced to avoid lock-outs during fast interactive edits on slider or inputs
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveSettings({
        salary,
        frequency,
        residencyStatus,
        fnpfPercent,
        isFnpfTaxExempt,
        hoursPerWeek,
        daysPerWeek
      });
    }, 600);
    return () => clearTimeout(timeout);
  }, [salary, frequency, residencyStatus, fnpfPercent, isFnpfTaxExempt, hoursPerWeek, daysPerWeek]);

  // Compute calculated metrics
  const calculation = calculateWages(
    salary,
    frequency,
    fnpfPercent,
    isFnpfTaxExempt,
    hoursPerWeek,
    daysPerWeek,
    residencyStatus
  );

  return (
    <AndroidFrame>
      <div className="flex-1 flex flex-col min-h-0 bg-transparent text-white">
        
        {/* Banner header with elegant Frosted Glass accents and Fiji motifs */}
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-5 sm:px-6 py-5 shrink-0 text-left relative overflow-hidden">
          {/* Subtle tropical wave/island translucent visual decor */}
          <div className="absolute top-0 right-0 opacity-15 translate-x-12 -translate-y-4 select-none pointer-events-none text-teal-355">
            <svg width="240" height="240" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10,90 Q30,10 50,90 T90,90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
              <path d="M20,95 Q40,15 60,95 T100,95" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <img
                src="/src/assets/images/viti_fiji_flag_app_icon_1780029383288.png"
                alt="Viti Wage Calculator Icon"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl border border-white/10 shadow-lg shadow-teal-500/5 shrink-0"
              />
              <div className="space-y-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-[9px] font-black uppercase rounded-md tracking-wider shadow-sm">
                    Fiji FJD
                  </span>
                  <span className="text-[10px] text-teal-200 font-bold uppercase tracking-widest flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-teal-300 fill-teal-300 animate-pulse" />
                    Statutory Wage Hub
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase opacity-95" id="main-title">
                  Viti Wage Calculator
                </h1>
                <p className="text-xs text-white/70 leading-relaxed font-semibold hidden sm:block">
                  Calculate Fiji PAYE income tax, customize FNPF pension savings, and plan expenses.
                </p>
              </div>
            </div>

            {/* Auth panel */}
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
              {user ? (
                <div className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/15 pl-3 pr-1.5 py-1.5 rounded-2xl transition duration-200 shadow-sm">
                  <div className="text-right min-w-0">
                    <div className="text-[9px] font-black text-teal-400 uppercase tracking-widest leading-none">Cloud Synced</div>
                    <div className="text-[10px] text-white/60 font-semibold truncate max-w-[120px] mt-0.5">
                      {user.displayName || user.email}
                    </div>
                  </div>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Google user avatar"
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-teal-400/30 object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-teal-500/25 text-teal-300 border border-teal-500/20 text-xs font-black flex items-center justify-center">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-450 transition duration-150"
                    title="Sign Out"
                    id="auth-logout-btn"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  disabled={isLoggingIn}
                  id="auth-login-btn"
                  className="px-3.5 py-2 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 active:scale-95 text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-teal-500/10 transition-all duration-200 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>{isLoggingIn ? 'Connecting...' : 'Backup to Gmail'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Global Tab Navigation - Separates congested sections into unique pages to maximize visual breathing room */}
        <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-2 shrink-0 flex items-center justify-start md:justify-center gap-1 md:gap-2 overflow-x-auto scrollbar-none z-15 sticky top-0" role="tablist">
          <button
            onClick={() => setActiveTab('inputs')}
            id="tab-btn-inputs"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'inputs'
                ? 'bg-white/10 text-teal-300 border border-white/20 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Salary Inputs</span>
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            id="tab-btn-breakdown"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'breakdown'
                ? 'bg-white/10 text-teal-300 border border-white/20 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Wage Paycheck</span>
          </button>

          <button
            onClick={() => setActiveTab('brackets')}
            id="tab-btn-brackets"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'brackets'
                ? 'bg-white/10 text-teal-300 border border-white/20 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>PAYE Brackets</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            id="tab-btn-planner"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'planner'
                ? 'bg-gradient-to-r from-teal-400/20 to-emerald-500/20 text-teal-300 border border-teal-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Pocket className="w-4 h-4 text-emerald-300" />
            <span className="flex items-center gap-1">
              <span>Expense Planner</span>
              <span className="px-1.5 py-0.5 bg-teal-400 text-slate-950 text-[8px] font-black uppercase rounded tracking-wider leading-none">NEW</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            id="tab-btn-guides"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'guides'
                ? 'bg-white/10 text-teal-300 border border-white/20 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Fiji Guides</span>
          </button>
        </div>

        {/* Core display layout - Centered, comfortable container maximizing spacing & legibility */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full animate-fade-in space-y-6">
            {activeTab === 'inputs' && (
              <div className="space-y-4">
                <SalaryInputCard
                  salary={salary}
                  setSalary={setSalary}
                  frequency={frequency}
                  setFrequency={setFrequency}
                  residencyStatus={residencyStatus}
                  setResidencyStatus={setResidencyStatus}
                  fnpfPercent={fnpfPercent}
                  setFnpfPercent={setFnpfPercent}
                  isFnpfTaxExempt={isFnpfTaxExempt}
                  setIsFnpfTaxExempt={setIsFnpfTaxExempt}
                  hoursPerWeek={hoursPerWeek}
                  setHoursPerWeek={setHoursPerWeek}
                  daysPerWeek={daysPerWeek}
                  setDaysPerWeek={setDaysPerWeek}
                />
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveTab('breakdown')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 active:scale-95 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/15 transition-all duration-200"
                  >
                    <span>Calculate Paycheck →</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="space-y-4">
                <WageBreakdownTable calculation={calculation} />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveTab('inputs')}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/80 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200"
                  >
                    <span>← Adjust Inputs</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('brackets')}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 active:scale-95 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/15 transition-all duration-200"
                  >
                    <span>View PAYE Brackets →</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'brackets' && (
              <div className="space-y-4">
                <TaxBracketMeter calculation={calculation} />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveTab('breakdown')}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/80 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200"
                  >
                    <span>← Back to Breakdown</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('planner')}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 active:scale-95 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/15 transition-all duration-200"
                  >
                    <span>Go to Expense Planner →</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'planner' && (
              <div className="space-y-4">
                <ExpensePlanner calculation={calculation} />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveTab('brackets')}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/80 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200"
                  >
                    <span>← Back to PAYE Brackets</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('guides')}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-400 to-emerald-400 hover:opacity-90 active:scale-95 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/15 transition-all duration-200"
                  >
                    <span>Browse Fiji Guides →</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="space-y-4">
                <FijiResources />
                
                <div className="flex justify-start pt-2">
                  <button
                    onClick={() => setActiveTab('inputs')}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white/80 hover:text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-200"
                  >
                    <span>← Adjust Salary & Settings</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Humble aesthetic glass footer */}
        <footer className="py-4 px-5 bg-white/5 backdrop-blur-sm border-t border-white/10 text-center shrink-0">
          <p className="text-[10px] text-white/50 font-bold tracking-wider uppercase flex items-center justify-center gap-1.5">
            <span>SECURED FIJI WAGE HUB</span>
            <span className="text-white/30">•</span>
            <span>FRCS & FNPF STATUTORY COMPLIANT</span>
          </p>
          <p className="text-[9px] text-white/40 mt-1 max-w-2xl mx-auto leading-normal">
            Calculated under standard Fiji Revenue & Customs Service (FRCS) and Fiji National Provident Fund (FNPF) regulations. Verify with human payroll units for definitive corporate filings.
          </p>
        </footer>
      </div>
    </AndroidFrame>
  );
}
