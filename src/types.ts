/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PayFrequency = 'weekly' | 'fortnightly' | 'monthly' | 'annual';

export interface TaxBracketExplanation {
  min: number;
  max: number;
  rate: number;
  baseCharge: number;
  taxInBracket: number;
  taxableIncomeInBracket: number;
  isActive: boolean;
  description: string;
}

export interface WageDetail {
  gross: number;
  fnpfDeduction: number;
  employerFnpf: number;
  taxableIncome: number;
  incomeTax: number;
  netPay: number;
  takeHomeAfterAll: number; // net pay
}

export interface WageCalculationResult {
  inputSalary: number;
  inputFrequency: PayFrequency;
  residencyStatus: 'resident' | 'non-resident';
  fnpfPercentage: number;
  employerFnpfPercentage: number;
  isFnpfTaxExempt: boolean;
  hoursPerWeek: number;
  daysPerWeek: number;

  // Key metrics summarized
  annual: WageDetail;
  monthly: WageDetail;
  fortnightly: WageDetail;
  weekly: WageDetail;
  daily: WageDetail;
  hourly: WageDetail;

  // Bracket breakdown status
  currentBracketIndex: number;
  bracketsBreakdown: TaxBracketExplanation[];
  totalTaxPaid: number;
  marginalTaxRate: number;
  effectiveTaxRate: number;
}
