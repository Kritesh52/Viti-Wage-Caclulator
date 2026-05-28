/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WageCalculationResult, PayFrequency } from '../types';
import { useFirebase } from '../context/FirebaseContext';
import { 
  Home, 
  Car, 
  Zap, 
  ShoppingBag, 
  CreditCard, 
  Coins, 
  TrendingDown, 
  TrendingUp,
  Plus, 
  Trash2, 
  CheckCircle, 
  HelpCircle,
  Sparkles,
  Pocket,
  Info,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  frequency: PayFrequency;
  category: 'housing' | 'transport' | 'utilities' | 'food' | 'loans' | 'personal' | 'savings';
}

interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  frequency: PayFrequency;
  category: 'side_hustle' | 'farming' | 'rental' | 'dividends' | 'other_income';
}

interface ExpensePlannerProps {
  calculation: WageCalculationResult;
}

const CATEGORIES = {
  housing: { label: 'Housing & Rent', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-400/15', text: 'text-amber-300', icon: Home },
  transport: { label: 'Transport & Fuel', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-400/15', text: 'text-sky-300', icon: Car },
  utilities: { label: 'Utilities & Bills', color: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-400/15', text: 'text-cyan-300', icon: Zap },
  food: { label: 'Food & Groceries', color: 'from-emerald-400 to-green-500', bg: 'bg-emerald-400/15', text: 'text-emerald-300', icon: ShoppingBag },
  loans: { label: 'Loans & Hire Purchases', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-400/15', text: 'text-rose-300', icon: CreditCard },
  personal: { label: 'Personal & Lifestyle', color: 'from-violet-400 to-purple-500', bg: 'bg-violet-400/15', text: 'text-violet-300', icon: Coins },
  savings: { label: 'Additional Savings', color: 'from-teal-400 to-emerald-400', bg: 'bg-teal-400/15', text: 'text-teal-300', icon: Pocket },
};

const INCOME_CATEGORIES = {
  side_hustle: { label: 'Side Hustles / Gig work', color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-400/15', text: 'text-emerald-300', icon: Sparkles },
  farming: { label: 'Agriculture & Kava Sales', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-400/15', text: 'text-amber-300', icon: Coins },
  rental: { label: 'Rental & Lodging', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-400/15', text: 'text-sky-300', icon: Home },
  dividends: { label: 'Unit Trust Dividends', color: 'from-violet-400 to-fuchsia-500', bg: 'bg-violet-400/15', text: 'text-violet-300', icon: TrendingUp },
  other_income: { label: 'Other revenue', color: 'from-slate-400 to-slate-500', bg: 'bg-slate-400/15', text: 'text-slate-200', icon: Pocket },
};

// Standard Fiji cost presets
const PRESETS: Omit<ExpenseItem, 'id'>[] = [
  { name: 'Suva / Nadi Flat Rent', amount: 650, frequency: 'monthly', category: 'housing' },
  { name: 'EFL Electricity Bill', amount: 80, frequency: 'monthly', category: 'utilities' },
  { name: 'Water Authority (WAF)', amount: 15, frequency: 'monthly', category: 'utilities' },
  { name: 'Vodafone/Digicel Mobile Pack', amount: 25, frequency: 'monthly', category: 'utilities' },
  { name: 'Municipal Market & Groceries', amount: 120, frequency: 'fortnightly', category: 'food' },
  { name: 'Minibus / Bus Fare / Taxi commute', amount: 35, frequency: 'weekly', category: 'transport' },
  { name: 'Courts / Carpenters Hire Purchase', amount: 90, frequency: 'monthly', category: 'loans' },
  { name: 'TSLS Student Loan Payback', amount: 100, frequency: 'monthly', category: 'loans' },
];

// Standard Fiji side income presets
const INCOME_PRESETS: Omit<IncomeItem, 'id'>[] = [
  { name: 'Yaqona / Kava Farm Proceeds', amount: 250, frequency: 'monthly', category: 'farming' },
  { name: 'Weekend Market Produce', amount: 90, frequency: 'weekly', category: 'farming' },
  { name: 'Backhouse Lodging / Flat Rental', amount: 300, frequency: 'monthly', category: 'rental' },
  { name: 'Taxi / Minibus driving shifts', amount: 120, frequency: 'weekly', category: 'side_hustle' },
  { name: 'FHL / UTOF Dividends', amount: 50, frequency: 'monthly', category: 'dividends' },
];

// Conversions to calculate standard annual values
const FREQUENCY_MULTIPLIERS: Record<PayFrequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  annual: 1,
};

export default function ExpensePlanner({ calculation }: ExpensePlannerProps) {
  const {
    expenses,
    incomes,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome
  } = useFirebase();

  // Display cadence matches input frequency by default
  const [viewFrequency, setViewFrequency] = useState<PayFrequency>(calculation.inputFrequency);

  // Auto-sync display cadence if the core paycheck frequency changes
  useEffect(() => {
    setViewFrequency(calculation.inputFrequency);
  }, [calculation.inputFrequency]);

  // Unified Toggle for the Add Form: adds 'expense' or 'income'
  const [entryType, setEntryType] = useState<'expense' | 'income'>('expense');

  // Input states
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newExpenseCategory, setNewExpenseCategory] = useState<keyof typeof CATEGORIES>('housing');
  const [newIncomeCategory, setNewIncomeCategory] = useState<keyof typeof INCOME_CATEGORIES>('side_hustle');
  const [newFrequency, setNewFrequency] = useState<PayFrequency>('monthly');

  // Inline Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'expense' | 'income' | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editFrequency, setEditFrequency] = useState<PayFrequency>('monthly');
  const [editCategory, setEditCategory] = useState<string>('housing');

  // Edit Event Handlers
  const handleStartEdit = (item: ExpenseItem | IncomeItem, type: 'expense' | 'income') => {
    setEditingId(item.id);
    setEditingType(type);
    setEditName(item.name);
    setEditAmount(item.amount.toString());
    setEditFrequency(item.frequency);
    setEditCategory(item.category);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
  };

  const handleSaveEdit = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editName.trim() || !editAmount || parseFloat(editAmount) <= 0) return;

    if (editingType === 'expense') {
      await updateExpense(id, {
        name: editName.trim(),
        amount: parseFloat(editAmount),
        frequency: editFrequency,
        category: editCategory as any,
      });
    } else if (editingType === 'income') {
      await updateIncome(id, {
        name: editName.trim(),
        amount: parseFloat(editAmount),
        frequency: editFrequency,
        category: editCategory as any,
      });
    }
    setEditingId(null);
    setEditingType(null);
  };

  // Convert an expense to annual, then scale to desired view frequency
  const getExpenseInViewFrequency = (item: ExpenseItem, targetFreq: PayFrequency): number => {
    const annualAmount = item.amount * FREQUENCY_MULTIPLIERS[item.frequency];
    return annualAmount / FREQUENCY_MULTIPLIERS[targetFreq];
  };

  // Convert alternate income to annual, then scale to desired view frequency
  const getIncomeInViewFrequency = (item: IncomeItem, targetFreq: PayFrequency): number => {
    const annualAmount = item.amount * FREQUENCY_MULTIPLIERS[item.frequency];
    return annualAmount / FREQUENCY_MULTIPLIERS[targetFreq];
  };

  // Convert salary paycheck into the desired view frequency
  const getPaycheckInViewFrequency = (targetFreq: PayFrequency): number => {
    return calculation.annual.netPay / FREQUENCY_MULTIPLIERS[targetFreq];
  };

  // Convert employer or employee FNPF savings into chosen frequency
  const getFnpfInViewFrequency = (targetFreq: PayFrequency): number => {
    return calculation.annual.fnpfDeduction / FREQUENCY_MULTIPLIERS[targetFreq];
  };

  const paycheckAmount = getPaycheckInViewFrequency(viewFrequency);
  const fnpfAmount = getFnpfInViewFrequency(viewFrequency);

  // Sum side incomes
  const totalOtherIncome = incomes.reduce((sum, item) => sum + getIncomeInViewFrequency(item, viewFrequency), 0);
  const totalCombinedIncome = paycheckAmount + totalOtherIncome;

  // Total calculated expense in active frequency
  const totalExpenses = expenses.reduce((sum, item) => sum + getExpenseInViewFrequency(item, viewFrequency), 0);
  const remainingCash = Math.max(0, totalCombinedIncome - totalExpenses);
  const isOverdrawn = totalExpenses > totalCombinedIncome;
  const overdrawAmount = Math.abs(totalCombinedIncome - totalExpenses);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount || parseFloat(newAmount) <= 0) return;

    if (entryType === 'expense') {
      await addExpense({
        name: newName.trim(),
        amount: parseFloat(newAmount),
        frequency: newFrequency,
        category: newExpenseCategory,
      });
    } else {
      await addIncome({
        name: newName.trim(),
        amount: parseFloat(newAmount),
        frequency: newFrequency,
        category: newIncomeCategory,
      });
    }

    setNewName('');
    setNewAmount('');
  };

  const handleAddPreset = async (preset: Omit<ExpenseItem, 'id'>) => {
    if (expenses.some(e => e.name === preset.name)) return;
    await addExpense(preset);
  };

  const handleAddIncomePreset = async (preset: Omit<IncomeItem, 'id'>) => {
    if (incomes.some(e => e.name === preset.name)) return;
    await addIncome(preset);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id);
  };

  // Helper formatting currency
  const formatValue = (val: number) => {
    return '$' + new Intl.NumberFormat('en-FJ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const frequencyLabel = (freq: PayFrequency) => {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'fortnightly': return 'Fortnightly';
      case 'monthly': return 'Monthly';
      case 'annual': return 'Annual';
    }
  };

  // Computes percent ratio cleanly
  const getPercentageOfPay = (amt: number) => {
    if (totalCombinedIncome <= 0) return 0;
    return Math.min(100, Math.round((amt / totalCombinedIncome) * 100));
  };

  const expensePercentageOfIncome = getPercentageOfPay(totalExpenses);

  const getFinancialHealthAdvice = () => {
    if (isOverdrawn) {
      return {
        title: 'Overdraw Warning',
        desc: `Your planned expenses exceed your combined salary & side-hustles by ${formatValue(overdrawAmount)}. Look into deferring high-interest Hire Purchases or expanding weekend local stalls.`,
        color: 'border-red-500/30 bg-red-500/10 text-red-200',
        dot: 'bg-red-400'
      };
    }
    if (expensePercentageOfIncome > 85) {
      return {
        title: 'Tight Budget Margin',
        desc: 'You are allocating over 85% of your combined earnings to bills. Consider harvesting backhouse produce or reducing miscellaneous hire purchases to build emergency funds.',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
        dot: 'bg-amber-400'
      };
    }
    if (expensePercentageOfIncome < 50) {
      return {
        title: 'Outstanding Surplus Flow',
        desc: `Excellent! You preserve over 50% of your total stream earnings (${formatValue(remainingCash)}). Consider compounding Fiji Unit Trust products (UTOF, FHL) or funding long-term land deposits.`,
        color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
        dot: 'bg-emerald-400'
      };
    }
    return {
      title: 'Stable Balanced Budget',
      desc: `Outflows use ${expensePercentageOfIncome}% of combined revenue. You have sound breathing room of ${formatValue(remainingCash)} left per ${viewFrequency === 'weekly' ? 'week' : viewFrequency === 'fortnightly' ? 'fortnight' : viewFrequency === 'monthly' ? 'month' : 'year'}.`,
      color: 'border-teal-500/30 bg-teal-500/10 text-teal-200',
      dot: 'bg-teal-400'
    };
  };

  const advice = getFinancialHealthAdvice();

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative text-left select-none flex flex-col h-full shadow-lg" id="expense-planner-card">
      
      {/* Dynamic Palm/Sea glow header gradient */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400"></div>

      {/* Main card header */}
      <div className="p-5 sm:p-6 border-b border-white/10 space-y-4 pt-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-500/25 border border-teal-400/20 text-teal-300">
              <Pocket className="w-5 h-5 text-emerald-300" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Fiji Budget & Alternate Income Planner
              </h3>
              <p className="text-[10px] text-white/50 tracking-wide font-mono font-bold mt-0.5">
                TRACK TOTAL COMBINED EARNINGS & FIXED EXPENSES
              </p>
            </div>
          </div>

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Cadence view selectors */}
        <div className="flex items-center justify-between bg-black/25 p-1 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold text-white/40 pl-2 uppercase tracking-wider font-mono">
            View Cadence:
          </span>
          <div className="flex gap-0.5">
            {(['weekly', 'fortnightly', 'monthly', 'annual'] as PayFrequency[]).map(freq => (
              <button
                key={freq}
                onClick={() => setViewFrequency(freq)}
                id={`planner-btn-${freq}`}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                  viewFrequency === freq
                    ? 'bg-teal-400 text-slate-950 font-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {freq === 'fortnightly' ? 'Fort' : freq === 'annual' ? 'Ann' : freq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive budget report panels */}
      <div className="p-5 sm:p-6 space-y-5 bg-black/10 select-all border-b border-white/5">
        
        {/* Real-time cashflow blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Main PAYE Job Net Pay */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[9px] font-bold text-teal-300 uppercase tracking-widest flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span>
              Job Net Pay
            </span>
            <div className="text-base font-black text-white/95 truncate">
              {formatValue(paycheckAmount)}
            </div>
            <span className="text-[9px] text-white/40 block">
              Dynamic PAYE
            </span>
          </div>

          {/* Alternate Income Sources */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
            <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              Side Incomes
            </span>
            <div className="text-base font-black text-emerald-300 truncate">
              +{formatValue(totalOtherIncome)}
            </div>
            <span className="text-[9px] text-white/40 block">
              {incomes.length} alternate stream{incomes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Combined Expense Outflows */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
              Total Expenses
            </span>
            <div className={`text-base font-black truncate ${isOverdrawn ? 'text-rose-400' : 'text-white/95'}`}>
              {formatValue(totalExpenses)}
            </div>
            <span className={`text-[9px] font-bold ${isOverdrawn ? 'text-rose-400/80' : 'text-white/40'} block`}>
              {expensePercentageOfIncome}% of combined revenue
            </span>
          </div>

        </div>

        {/* Dynamic Visual Fill Gauge */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-white/80">
            <span>Combined Allocation bar</span>
            <span className="font-mono text-teal-300">
              {formatValue(remainingCash)} ({100 - expensePercentageOfIncome}% remaining)
            </span>
          </div>
          
          <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden flex border border-white/5">
            {expenses.map((item) => {
              const share = getPercentageOfPay(getExpenseInViewFrequency(item, viewFrequency));
              if (share <= 0) return null;
              const catConfig = CATEGORIES[item.category];
              return (
                <div
                  key={item.id}
                  style={{ width: `${share}%` }}
                  className={`h-full bg-gradient-to-r ${catConfig.color} transition-all duration-300 border-r border-black/20 last:border-r-0`}
                  title={`${item.name} (Expense): ${formatValue(getExpenseInViewFrequency(item, viewFrequency))} (${share}%)`}
                />
              );
            })}
            {!isOverdrawn && remainingCash > 0 && (
              <div 
                style={{ width: `${100 - expensePercentageOfIncome}%` }} 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 animate-pulse"
                title={`Disposable Cash: ${formatValue(remainingCash)}`}
              />
            )}
          </div>

          {/* Stat Box detailing statutory FNPF savings & Alternate Streams */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[9px] text-white/50 gap-1.5 pt-1.5 font-mono bg-black/20 py-2.5 px-3.5 rounded-xl border border-white/5">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>FNPF Pension (8% Job Savings): <strong className="text-cyan-300">{formatValue(fnpfAmount)}</strong></span>
            </span>
            <span className="font-bold text-emerald-300">
              Total Budget Revenue Capacity: {formatValue(totalCombinedIncome)}
            </span>
          </div>
        </div>

        {/* Health advisory feedback */}
        <div className={`p-3 rounded-2xl border text-[11px] leading-relaxed transition-all duration-300 ${advice.color}`}>
          <div className="font-extrabold flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full ${advice.dot}`} />
            {advice.title}
          </div>
          <p className="font-medium opacity-90">{advice.desc}</p>
        </div>

      </div>

      {/* Main planner tabs & workspace scrolling zone */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto min-h-[220px] max-h-[380px] space-y-6">
        
        {/* Unified Input Form */}
        <form onSubmit={handleAddEntry} className="space-y-4.5 p-4 bg-white/5 border border-white/5 rounded-2xl relative">
          
          {/* Segment Toggle selector to switch between adding Expense Outflow vs. Side Hustle/Other Income */}
          <div className="flex gap-1.5 bg-black/35 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setEntryType('expense');
                setNewName('');
                setNewAmount('');
              }}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                entryType === 'expense'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              📉 Add Expense Outflow
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryType('income');
                setNewName('');
                setNewAmount('');
              }}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                entryType === 'income'
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              🚀 Add Side Income / Hustle
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder={entryType === 'expense' ? "e.g., EFL Power bill, Suva flat rent, bus commute..." : "e.g., Kava farm crops, spare room rent, taxi shifts..."}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  id="planner-entry-name"
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-teal-400 transition"
                  required
                />
              </div>

              <div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-white/50 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="Amount (FJD)"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    id="planner-entry-amount"
                    className="w-full bg-black/35 border border-white/10 rounded-xl pl-6.5 pr-2 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-teal-400 transition font-mono"
                    min="1"
                    step="any"
                    required
                  />
                </div>
              </div>

              <div>
                <select
                  value={newFrequency}
                  onChange={e => setNewFrequency(e.target.value as PayFrequency)}
                  id="planner-entry-frequency"
                  className="w-full bg-black/35 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white/80 focus:outline-none focus:border-teal-400 transition"
                >
                  <option value="weekly" className="bg-slate-900 text-white">per Week</option>
                  <option value="fortnightly" className="bg-slate-900 text-white">per Fortnight</option>
                  <option value="monthly" className="bg-slate-900 text-white">per Month</option>
                  <option value="annual" className="bg-slate-900 text-white">per Year</option>
                </select>
              </div>

              <div className="col-span-2">
                {entryType === 'expense' ? (
                  <select
                    value={newExpenseCategory}
                    onChange={e => setNewExpenseCategory(e.target.value as keyof typeof CATEGORIES)}
                    id="planner-expense-category"
                    className="w-full bg-black/35 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white/85 focus:outline-none focus:border-teal-400 transition"
                  >
                    {Object.entries(CATEGORIES).map(([key, config]) => (
                      <option key={key} value={key} className="bg-slate-900 text-white">
                        📂 {config.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={newIncomeCategory}
                    onChange={e => setNewIncomeCategory(e.target.value as keyof typeof INCOME_CATEGORIES)}
                    id="planner-income-category"
                    className="w-full bg-black/35 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white/85 focus:outline-none focus:border-teal-400 transition"
                  >
                    {Object.entries(INCOME_CATEGORIES).map(([key, config]) => (
                      <option key={key} value={key} className="bg-slate-900 text-white">
                        🌱 {config.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <button
              type="submit"
              id="planner-submit-btn"
              className={`w-full py-2 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition flex items-center justify-center gap-1.5 shadow-md ${
                entryType === 'expense' 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
                  : 'bg-gradient-to-r from-emerald-400 to-teal-400'
              }`}
            >
              <Plus className="w-4 h-4 text-slate-950 font-black stroke-[3]" />
              <span>{entryType === 'expense' ? 'Register Expense Outflow' : 'Register Side Income'}</span>
            </button>
          </div>
        </form>

        {/* Alternate Streams Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-400/80 tracking-wider font-mono">
            <span>Alternate Incomes / Side Hustles</span>
            <span>({incomes.length} Active Stream{incomes.length !== 1 ? 's' : ''})</span>
          </div>

          {incomes.length === 0 ? (
            <div className="p-4 text-center rounded-2xl border border-dashed border-white/5 text-white/30 text-xs bg-black/5">
              No side incomes listed! Add your agriculture, market, or ride-share shifts to complete the budget.
            </div>
          ) : (
            <div className="space-y-1.5">
              {incomes.map(item => {
                const catConfig = INCOME_CATEGORIES[item.category];
                const CatIcon = catConfig.icon;
                const convertedValue = getIncomeInViewFrequency(item, viewFrequency);
                const isEditing = editingId === item.id && editingType === 'income';

                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/35 space-y-3 relative text-left"
                    >
                      <div className="text-[10px] font-bold text-teal-300 uppercase tracking-widest flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></span>
                        ✏️ Edit Side Income Stream
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 transition"
                          placeholder="Income description"
                          required
                          id={`edit-inc-name-${item.id}`}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-xs text-white/50 font-bold">$</span>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={e => setEditAmount(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 transition font-mono"
                              placeholder="Amount"
                              min="1"
                              step="any"
                              required
                              id={`edit-inc-amount-${item.id}`}
                            />
                          </div>

                          <select
                            value={editFrequency}
                            onChange={e => setEditFrequency(e.target.value as PayFrequency)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-teal-400 transition"
                            id={`edit-inc-select-frequency-${item.id}`}
                          >
                            <option value="weekly" className="bg-slate-900 text-white">per Week</option>
                            <option value="fortnightly" className="bg-slate-900 text-white">per Fortnight</option>
                            <option value="monthly" className="bg-slate-900 text-white">per Month</option>
                            <option value="annual" className="bg-slate-900 text-white">per Year</option>
                          </select>
                        </div>

                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-teal-400 transition"
                          id={`edit-inc-select-category-${item.id}`}
                        >
                          {Object.entries(INCOME_CATEGORIES).map(([key, config]) => (
                            <option key={key} value={key} className="bg-slate-900 text-white">
                              🌱 {config.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1.5 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg transition"
                          id={`edit-inc-btn-cancel-${item.id}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1.5 text-[10px] bg-emerald-400 text-slate-950 rounded-lg font-black uppercase tracking-wider shadow-md"
                          id={`edit-inc-btn-save-${item.id}`}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-950/15 hover:bg-emerald-950/25 border border-emerald-500/10 transition group text-left animate-fade-in"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`p-1.5 rounded-lg ${catConfig.bg} ${catConfig.text} shrink-0`}>
                        <CatIcon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-white/95 block truncate group-hover:text-emerald-300 transition">
                          {item.name}
                        </span>
                        <span className="text-[9px] text-white/40 font-mono flex items-center gap-1">
                          <span>{catConfig.label}</span>
                          <span>•</span>
                          <span>{formatValue(item.amount)}/{item.frequency === 'weekly' ? 'wk' : item.frequency === 'fortnightly' ? 'fn' : item.frequency === 'monthly' ? 'mo' : 'yr'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-bold text-emerald-400 mr-1">
                        +{formatValue(convertedValue)}
                      </span>
                      <button
                        onClick={() => handleStartEdit(item, 'income')}
                        className="p-1 rounded bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-300 transition"
                        title="Edit entry"
                        id={`edit-inc-start-${item.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIncome(item.id)}
                        className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition"
                        title="Delete entry"
                        id={`delete-inc-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Existing Expenses Line Items */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-amber-400/80 tracking-wider font-mono">
            <span>Budget Outflows & Expenses</span>
            <span>({expenses.length} Active Expense{expenses.length !== 1 ? 's' : ''})</span>
          </div>

          {expenses.length === 0 ? (
            <div className="p-4 text-center rounded-2xl border border-dashed border-white/5 text-white/30 text-xs bg-black/5">
              No expenses listed! Tap presets below to instantly prefill common bills.
            </div>
          ) : (
            <div className="space-y-1.5">
              {expenses.map(item => {
                const catConfig = CATEGORIES[item.category];
                const CatIcon = catConfig.icon;
                const convertedValue = getExpenseInViewFrequency(item, viewFrequency);
                const isEditing = editingId === item.id && editingType === 'expense';

                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-500/35 space-y-3 relative text-left"
                    >
                      <div className="text-[10px] font-bold text-teal-300 uppercase tracking-widest flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping"></span>
                        ✏️ Edit Expense Item
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-400 transition"
                          placeholder="Expense name"
                          required
                          id={`edit-exp-name-${item.id}`}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-xs text-white/50 font-bold">$</span>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={e => setEditAmount(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-xl pl-6 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 transition font-mono"
                              placeholder="Amount"
                              min="1"
                              step="any"
                              required
                              id={`edit-exp-amount-${item.id}`}
                            />
                          </div>

                          <select
                            value={editFrequency}
                            onChange={e => setEditFrequency(e.target.value as PayFrequency)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-teal-400 transition"
                            id={`edit-exp-select-frequency-${item.id}`}
                          >
                            <option value="weekly" className="bg-slate-900 text-white">per Week</option>
                            <option value="fortnightly" className="bg-slate-900 text-white">per Fortnight</option>
                            <option value="monthly" className="bg-slate-900 text-white">per Month</option>
                            <option value="annual" className="bg-slate-900 text-white">per Year</option>
                          </select>
                        </div>

                        <select
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-teal-400 transition"
                          id={`edit-exp-select-category-${item.id}`}
                        >
                          {Object.entries(CATEGORIES).map(([key, config]) => (
                            <option key={key} value={key} className="bg-slate-900 text-white">
                              📂 {config.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2.5 py-1.5 text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg transition"
                          id={`edit-exp-btn-cancel-${item.id}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1.5 text-[10px] bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 rounded-lg font-black uppercase tracking-wider shadow-md"
                          id={`edit-exp-btn-save-${item.id}`}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition group text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`p-1.5 rounded-lg ${catConfig.bg} ${catConfig.text} shrink-0`}>
                        <CatIcon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-white/95 block truncate group-hover:text-teal-300 transition">
                          {item.name}
                        </span>
                        <span className="text-[9px] text-white/40 font-mono flex items-center gap-1">
                          <span>{catConfig.label}</span>
                          <span>•</span>
                          <span>{formatValue(item.amount)}/{item.frequency === 'weekly' ? 'wk' : item.frequency === 'fortnightly' ? 'fn' : item.frequency === 'monthly' ? 'mo' : 'yr'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-bold text-white/90 mr-1">
                        {formatValue(convertedValue)}
                      </span>
                      <button
                        onClick={() => handleStartEdit(item, 'expense')}
                        className="p-1 rounded bg-white/5 hover:bg-teal-500/20 text-white/40 hover:text-teal-300 transition"
                        title="Edit entry"
                        id={`edit-btn-start-${item.id}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 transition"
                        title="Delete expense"
                        id={`delete-btn-${item.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fiji Budget Presets Panel */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          
          {/* Outflow Presets */}
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-300/80 block font-mono">
              💡 Quick Outflow Cost Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset, idx) => {
                const catConfig = CATEGORIES[preset.category];
                const active = expenses.some(e => e.name === preset.name);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    disabled={active}
                    className={`px-2.5 py-1.5 rounded-xl text-[9.5px] font-bold border flex items-center gap-1 select-none transition ${
                      active
                        ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed line-through'
                        : 'bg-black/25 border-white/10 text-white/80 hover:bg-white/5 hover:border-amber-400/40 hover:text-white cursor-pointer'
                    }`}
                  >
                    <span className={catConfig.text}>+{formatValue(preset.amount)}</span>
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Income Presets */}
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-300/80 block font-mono">
              🌱 Quick Fiji Side Hustle Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {INCOME_PRESETS.map((preset, idx) => {
                const catConfig = INCOME_CATEGORIES[preset.category];
                const active = incomes.some(i => i.name === preset.name);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddIncomePreset(preset)}
                    disabled={active}
                    className={`px-2.5 py-1.5 rounded-xl text-[9.5px] font-bold border flex items-center gap-1 select-none transition ${
                      active
                        ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed line-through'
                        : 'bg-black/25 border-white/10 text-white/80 hover:bg-white/5 hover:border-emerald-400/40 hover:text-white cursor-pointer'
                    }`}
                  >
                    <span className={catConfig.text}>+{formatValue(preset.amount)}</span>
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Aesthetic helper status bar */}
      <div className="p-3.5 bg-white/5 border-t border-white/10 flex items-center gap-2 text-[9.5px] text-white/50 leading-relaxed shrink-0">
        <Info className="w-3.5 h-3.5 text-teal-300 shrink-0" />
        <span>
          Planner calculations sync immediately using net pay derived dynamically from the <strong>Gross {formatValue(calculation.annual.gross)}</strong> calculation in Step 1.
        </span>
      </div>

    </div>
  );
}
