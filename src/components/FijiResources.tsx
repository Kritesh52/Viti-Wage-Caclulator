/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Info, ShieldAlert, CheckCircle2, Coins, HeartHandshake, Home, Smartphone, Monitor } from 'lucide-react';

export default function FijiResources() {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('ios');

  const FNPF_BENEFITS = [
    {
      icon: <Home className="w-4 h-4 text-teal-300 animate-pulse" />,
      title: "First Home Assistance",
      desc: "Apply up to 30% of your accumulated FNPF balance directly to pay deposits or build your first primary residence."
    },
    {
      icon: <HeartHandshake className="w-4 h-4 text-sky-300" />,
      title: "Education Support",
      desc: "Draw approved balances directly to fund certified local or international tertiary certificates and medical emergencies."
    },
    {
      icon: <Coins className="w-4 h-4 text-emerald-300" />,
      title: "Annual Compound Interest",
      desc: "Benefit from tax-sheltered annual compound interest declared by the FNPF board to secure your retirement safety net."
    }
  ];

  return (
    <div className="backdrop-blur-xl bg-white/10 dark:bg-slate-950/25 border border-white/20 rounded-[32px] p-6 shadow-2xl space-y-6 text-left animate-fade-in" id="fiji-resources-panel">
      
      {/* Save App Shortcut Manual Instructions - Added directly under requests */}
      <div className="p-5 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-[24px] border border-teal-500/30 text-left space-y-4" id="save-shortcut-guide">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-teal-300 animate-bounce" />
          <div>
            <h3 className="text-xs font-black text-teal-200 uppercase tracking-widest">
              Save To Phone Home Screen
            </h3>
            <p className="text-[10px] text-teal-100/70 font-semibold mt-0.5">
              Add "Viti Wage" straight to your home screen for quick, offline-friendly access!
            </p>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex gap-1 bg-black/25 p-1 rounded-xl">
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              platform === 'ios'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            id="install-tab-ios"
          >
            <span> iPhone</span>
          </button>
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              platform === 'android'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            id="install-tab-android"
          >
            <span>🤖 Android</span>
          </button>
          <button
            onClick={() => setPlatform('desktop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              platform === 'desktop'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            id="install-tab-desktop"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Step List Content */}
        <div className="bg-black/15 border border-white/5 p-3.5 rounded-xl text-[11px] font-semibold text-white/95 leading-relaxed space-y-3">
          {platform === 'ios' && (
            <ol className="list-decimal pl-4.5 space-y-2">
              <li>Open this app link in your Apple <strong className="text-teal-300">Safari</strong> browser.</li>
              <li>Tap the <strong className="text-teal-300">Share</strong> button at the bottom navigation bar (a square icon with an arrow pointing up).</li>
              <li>Scroll down the share sheet options list and tap <strong className="text-teal-300">"Add to Home Screen"</strong>.</li>
              <li>Make sure the title says "Viti Wage" and tap <strong className="text-teal-300">"Add"</strong> in the top right corner.</li>
            </ol>
          )}

          {platform === 'android' && (
            <ol className="list-decimal pl-4.5 space-y-2">
              <li>Open this app link using <strong className="text-teal-300">Google Chrome</strong>.</li>
              <li>Tap the <strong className="text-teal-300">Settings</strong> button (three vertical dots) in the top-right corner.</li>
              <li>Choose <strong className="text-teal-300">"Add to Home screen"</strong> or <strong className="text-teal-300">"Install app"</strong> from the menu.</li>
              <li>Tap <strong className="text-teal-300">"Add"</strong> or <strong className="text-teal-300">"Install"</strong> to confirm the prompt.</li>
            </ol>
          )}

          {platform === 'desktop' && (
            <ol className="list-decimal pl-4.5 space-y-2">
              <li>Open this page using <strong className="text-teal-300">Google Chrome, Edge, or Brave</strong> on your computador.</li>
              <li>Look at the far right of the address bar (where the URL is entered) at the top of your browser window.</li>
              <li>Click the small <strong className="text-teal-300">"Install app"</strong> icon (looks like a monitor screen with an arrow, or a plus icon).</li>
              <li>A popup will appear—click <strong className="text-teal-300">"Install"</strong>, and it will run as a standalone desktop utility app.</li>
            </ol>
          )}

          <div className="text-[9px] text-teal-300/80 font-bold uppercase tracking-widest text-center pt-1 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Uses Fiji flag color icon on your screen!</span>
          </div>
        </div>
      </div>

      {/* Panel header instructions */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-widest text-teal-200">
          <Info className="w-4 h-4 text-teal-300" />
          Fiji Financial Guides
        </h3>
        <p className="text-[11px] text-white/50 mt-1 font-semibold">
          Official statutory rules under Fiji Revenue and Customs Service (FRCS) & Fiji National Provident Fund (FNPF).
        </p>
      </div>

      {/* FNPF benefits catalogs */}
      <div className="space-y-3 text-left">
        <h4 className="text-xs font-bold text-teal-200 uppercase tracking-widest pl-0.5">
          Why contribute above 8.0% to FNPF?
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {FNPF_BENEFITS.map((benefit, idx) => (
            <div 
              key={idx}
              className="flex gap-3.5 p-4 bg-white/5 border border-white/5 hover:border-white/15 rounded-2xl hover:bg-white/10 transition-all duration-300"
              id={`fnpf-benefit-${idx}`}
            >
              <div className="p-2.5 h-fit bg-white/10 border border-white/10 rounded-xl shadow-inner">
                {benefit.icon}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-extrabold text-white">
                  {benefit.title}
                </span>
                <p className="text-[10px] text-white/60 leading-relaxed font-semibold">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FRCS system highlights */}
      <div className="p-4 bg-teal-400/10 rounded-2xl border border-teal-400/20 text-left space-y-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-teal-300 animate-pulse" />
          <span className="text-xs font-bold text-teal-200 uppercase tracking-wider">
            Fiji PAYE Tax System (2026 Guidelines)
          </span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed font-semibold">
          Compensation in Fiji uses the progressive <strong>Pay-As-You-Earn (PAYE)</strong> system. Employers automatically deduct statutory PAYE tax and employee FNPF shares from periodic wage cycles and remit them directly.
        </p>
        <div className="pt-1 flex items-center gap-1.5 text-[10px] text-teal-300 font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>FJD 30,000 annual threshold is tax-free!</span>
        </div>
      </div>

      {/* Helpful FAQ section */}
      <div className="border-t border-white/10 pt-4 space-y-3 text-left">
        <h4 className="text-xs font-bold text-teal-200 uppercase tracking-widest">
          Quick Tax FAQs
        </h4>
        
        <div className="space-y-3.5 text-xs text-white">
          <div className="space-y-0.5">
            <strong className="text-white block font-bold">How many pay cycles are inside a Fijian fiscal year?</strong>
            <span className="text-white/50 text-[10px] block leading-relaxed font-semibold">
              Corporate and civil service payroll cycles divide the standard year into exactly <strong>26 fortnights</strong> or <strong>52 weeks</strong>.
            </span>
          </div>

          <div className="space-y-0.5">
            <strong className="text-white block font-bold">What is the Employer FNPF share?</strong>
            <span className="text-white/50 text-[10px] block leading-relaxed font-semibold">
              While you save 8% to 12% (the employee share), your employer provides a statutory <strong>10.0% FNPF contribution</strong>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
