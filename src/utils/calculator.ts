/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PayFrequency, WageCalculationResult, WageDetail, TaxBracketExplanation } from '../types';

// Fiji 2026/Statutory PAYE Resident Tax Brackets (Column 2 of the table)
export const FIJI_RESIDENT_TAX_BRACKETS = [
  { min: 0, max: 30000, rate: 0.00, baseCharge: 0, desc: "FJD 0 – 30,000" },
  { min: 30000, max: 50000, rate: 0.18, baseCharge: 0, desc: "FJD 30,001 – 50,000" },
  { min: 50000, max: 270000, rate: 0.20, baseCharge: 3600, desc: "FJD 50,001 – 270,000" },
  { min: 270000, max: 300000, rate: 0.33, baseCharge: 47600, desc: "FJD 270,001 – 300,000" },
  { min: 300000, max: 350000, rate: 0.34, baseCharge: 57500, desc: "FJD 300,001 – 350,000" },
  { min: 350000, max: 400000, rate: 0.35, baseCharge: 74500, desc: "FJD 350,001 – 400,000" },
  { min: 400000, max: 450000, rate: 0.36, baseCharge: 92000, desc: "FJD 400,001 – 450,000" },
  { min: 450000, max: 500000, rate: 0.37, baseCharge: 110000, desc: "FJD 450,001 – 500,000" },
  { min: 500000, max: 1000000, rate: 0.38, baseCharge: 128500, desc: "FJD 500,001 – 1,000,000" },
  { min: 1000000, max: Infinity, rate: 0.39, baseCharge: 318500, desc: "Over FJD 1,000,000" }
];

// Fiji 2026/Statutory PAYE Non-Resident Tax Brackets (Column 3 of the table)
export const FIJI_NON_RESIDENT_TAX_BRACKETS = [
  { min: 0, max: 30000, rate: 0.20, baseCharge: 0, desc: "FJD 0 – 30,000" },
  { min: 30000, max: 50000, rate: 0.20, baseCharge: 6000, desc: "FJD 30,001 – 50,000" },
  { min: 50000, max: 270000, rate: 0.20, baseCharge: 10000, desc: "FJD 50,001 – 270,000" },
  { min: 270000, max: 300000, rate: 0.33, baseCharge: 54000, desc: "FJD 270,001 – 300,000" },
  { min: 300000, max: 350000, rate: 0.34, baseCharge: 63900, desc: "FJD 300,001 – 350,000" },
  { min: 350000, max: 400000, rate: 0.35, baseCharge: 80900, desc: "FJD 350,001 – 400,000" },
  { min: 400000, max: 450000, rate: 0.36, baseCharge: 98400, desc: "FJD 400,001 – 450,000" },
  { min: 450000, max: 500000, rate: 0.37, baseCharge: 116400, desc: "FJD 450,001 – 500,000" },
  { min: 500000, max: 1000000, rate: 0.38, baseCharge: 134900, desc: "FJD 500,001 – 1,000,000" },
  { min: 1000000, max: Infinity, rate: 0.39, baseCharge: 324900, desc: "Over FJD 1,000,000" }
];

// Standard Statutory Employer matching rate is 8%
export const STANDARD_EMPLOYER_FNPF_RATE = 8.0;

export function calculateWages(
  inputSalary: number,
  inputFrequency: PayFrequency,
  fnpfPercentage: number,
  isFnpfTaxExempt: boolean = true,
  hoursPerWeek: number = 40,
  daysPerWeek: number = 3, // doesn't matter, will pass from App
  residencyStatus: 'resident' | 'non-resident' = 'resident'
): WageCalculationResult {
  // 1. Convert input to Annual Gross
  let annualGross = 0;
  switch (inputFrequency) {
    case 'weekly':
      annualGross = inputSalary * 52;
      break;
    case 'fortnightly':
      annualGross = inputSalary * 26;
      break;
    case 'monthly':
      annualGross = inputSalary * 12;
      break;
    case 'annual':
      annualGross = inputSalary;
      break;
  }

  // Prevent negative inputs
  annualGross = Math.max(0, annualGross);

  // 2. Compute Annual employee FNPF contribution
  const annualFnpf = annualGross * (fnpfPercentage / 100);
  
  // Employer FNPF contribution (Standard 8.0%)
  const annualEmployerFnpf = annualGross * (STANDARD_EMPLOYER_FNPF_RATE / 100);

  // 3. Compute Annual Taxable Gross
  // In Fiji, if FNPF is tax exempt, the taxable base is reduced by the FNPF employee contribution
  const annualTaxableIncome = isFnpfTaxExempt 
    ? Math.max(0, annualGross - annualFnpf)
    : annualGross;

  // 4. Compute Progressive PAYE Income Tax
  let totalTax = 0;
  let marginalTaxRate = 0;
  let currentBracketIndex = 0;

  const brackets = residencyStatus === 'non-resident' 
    ? FIJI_NON_RESIDENT_TAX_BRACKETS 
    : FIJI_RESIDENT_TAX_BRACKETS;

  const bracketsBreakdown: TaxBracketExplanation[] = brackets.map((bracket, index) => {
    let taxInBracket = 0;
    let taxableIncomeInBracket = 0;
    let isActive = false;

    if (annualTaxableIncome > bracket.min) {
      isActive = true;
      currentBracketIndex = index;
      marginalTaxRate = bracket.rate;

      const upperLimit = Math.min(annualTaxableIncome, bracket.max);
      taxableIncomeInBracket = upperLimit - bracket.min;
      taxInBracket = taxableIncomeInBracket * bracket.rate;
    }

    return {
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      baseCharge: bracket.baseCharge,
      taxInBracket,
      taxableIncomeInBracket,
      isActive,
      description: bracket.desc
    };
  });

  // Calculate total tax by adding up tax computed from each bracket
  totalTax = bracketsBreakdown.reduce((sum, b) => sum + b.taxInBracket, 0);

  // Annual Net Pay
  const annualNet = Math.max(0, annualGross - annualFnpf - totalTax);

  // 5. Structure Wage Details for different frequencies
  const makeDeatail = (freqFactor: number): WageDetail => {
    return {
      gross: annualGross / freqFactor,
      fnpfDeduction: annualFnpf / freqFactor,
      employerFnpf: annualEmployerFnpf / freqFactor,
      taxableIncome: annualTaxableIncome / freqFactor,
      incomeTax: totalTax / freqFactor,
      netPay: annualNet / freqFactor,
      takeHomeAfterAll: annualNet / freqFactor
    };
  };

  // Divide factors
  const annual = {
    gross: annualGross,
    fnpfDeduction: annualFnpf,
    employerFnpf: annualEmployerFnpf,
    taxableIncome: annualTaxableIncome,
    incomeTax: totalTax,
    netPay: annualNet,
    takeHomeAfterAll: annualNet
  };

  const monthly = makeDeatail(12);
  const fortnightly = makeDeatail(26);
  const weekly = makeDeatail(52);
  
  // Daily & Hourly depends on hours and days settings
  const totalWeeklyDays = Math.max(1, Math.min(7, daysPerWeek));
  const totalWeeklyHours = Math.max(1, Math.min(168, hoursPerWeek));
  const annualWeeks = 52;
  const annualDays = totalWeeklyDays * annualWeeks;
  const annualHours = totalWeeklyHours * annualWeeks;

  const daily = {
    gross: annualGross / annualDays,
    fnpfDeduction: annualFnpf / annualDays,
    employerFnpf: annualEmployerFnpf / annualDays,
    taxableIncome: annualTaxableIncome / annualDays,
    incomeTax: totalTax / annualDays,
    netPay: annualNet / annualDays,
    takeHomeAfterAll: annualNet / annualDays
  };

  const hourly = {
    gross: annualGross / annualHours,
    fnpfDeduction: annualFnpf / annualHours,
    employerFnpf: annualEmployerFnpf / annualHours,
    taxableIncome: annualTaxableIncome / annualHours,
    incomeTax: totalTax / annualHours,
    netPay: annualNet / annualHours,
    takeHomeAfterAll: annualNet / annualHours
  };

  const effectiveTaxRate = annualGross > 0 ? (totalTax / annualGross) * 100 : 0;

  return {
    inputSalary,
    inputFrequency,
    residencyStatus,
    fnpfPercentage,
    employerFnpfPercentage: STANDARD_EMPLOYER_FNPF_RATE,
    isFnpfTaxExempt,
    hoursPerWeek,
    daysPerWeek,
    annual,
    monthly,
    fortnightly,
    weekly,
    daily,
    hourly,
    currentBracketIndex,
    bracketsBreakdown,
    totalTaxPaid: totalTax,
    marginalTaxRate,
    effectiveTaxRate
  };
}
