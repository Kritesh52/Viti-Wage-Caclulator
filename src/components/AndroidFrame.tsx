/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Wifi, Battery, Signal, Zap } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'responsive'>('responsive');
  const [currentTime, setCurrentTime] = useState('12:00');

  // Update time for the phone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to HH:MM Fiji Time (approx. UTC+12)
      // Since our local time is provided, we can dynamically display regional clock or standard system time.
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Pacific/Fiji'
      };
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
        setCurrentTime(timeStr);
      } catch (err) {
        // Fallback to local system time if Fiji timezone isn't supported in browser environment
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        setCurrentTime(`${hours}:${minutes}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-cyan-650 via-teal-800 to-indigo-950 font-sans p-2 sm:p-6 transition-colors duration-300">
      
      {/* Device View Mode Toggle - Specially stylized with Frosted layout */}
      <div className="hidden md:flex items-center gap-1.5 p-1 backdrop-blur-md bg-white/10 dark:bg-slate-900/40 rounded-full shadow-lg mb-6 border border-white/20 z-10 self-center">
        <button
          onClick={() => setDeviceMode('responsive')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
            deviceMode === 'responsive'
              ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-950 shadow-md scale-105'
              : 'text-white/80 hover:text-white hover:bg-white/5'
          }`}
          id="btn-view-responsive"
        >
          <Laptop className="w-3.5 h-3.5" />
          Web Mode (Frosted)
        </button>
        <button
          onClick={() => setDeviceMode('mobile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
            deviceMode === 'mobile'
              ? 'bg-gradient-to-r from-sky-400 to-indigo-400 text-slate-950 shadow-md scale-105'
              : 'text-white/80 hover:text-white hover:bg-white/5'
          }`}
          id="btn-view-mobile"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Android App Screen
        </button>
      </div>

      {deviceMode === 'mobile' ? (
        /* Mobile Device Shell - Frosted edition */
        <div 
          id="android-device-shell"
          className="relative w-[400px] h-[840px] bg-slate-950/80 backdrop-blur-2xl rounded-[48px] shadow-2xl border-[12px] border-slate-900/90 flex flex-col overflow-hidden ring-1 ring-white/10"
        >
          {/* Punch hole camera */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center border-2 border-slate-800">
            <div className="w-1.5 h-1.5 bg-sky-900/40 rounded-full"></div>
          </div>

          {/* Android Status Bar */}
          <div className="h-10 bg-slate-950/40 backdrop-blur-md text-white px-7 py-2 flex items-center justify-between text-xs font-medium z-20 select-none border-b border-white/5">
            <span className="tracking-tight text-[11px] font-semibold text-white/90">{currentTime} <span className="text-[9px] text-teal-300 ml-0.5">FJT</span></span>
            <div className="flex items-center gap-1.5 text-white/90">
              <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
              <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
              <div className="flex items-center gap-0.5 bg-white/10 px-1 py-0.5 rounded text-[9px] font-bold">
                <Zap className="w-2.5 h-2.5 text-teal-300 fill-teal-300 animate-pulse" />
                <span>98%</span>
              </div>
              <Battery className="w-4 h-4 stroke-[2.2] rotate-90 origin-center -ml-1 text-emerald-400 fill-emerald-500" />
            </div>
          </div>

          {/* Dynamic Content Frame - allows beautiful back-blur */}
          <div className="flex-1 overflow-y-auto bg-slate-950/20 backdrop-blur-2xl scrollbar-none flex flex-col">
            {children}
          </div>

          {/* Android Soft Navigation Bar */}
          <div className="h-12 bg-slate-950/60 backdrop-blur-md flex items-center justify-around px-8 z-20 border-t border-white/5">
            <button className="p-3 text-white/40 hover:text-white transition-colors" title="Back">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="p-3 text-white/40 hover:text-white transition-colors" title="Home">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/40 hover:border-white transition-all"></div>
            </button>
            <button className="p-3 text-white/40 hover:text-white transition-colors" title="Recent">
              <div className="w-3.5 h-3.5 border-2 border-white/40 hover:border-white rounded-sm transition-all"></div>
            </button>
          </div>
        </div>
      ) : (
        /* Responsive View Frame - Glass Container */
        <div 
          id="web-responsive-frame"
          className="w-full max-w-5xl backdrop-blur-2xl bg-white/10 dark:bg-slate-950/20 border border-white/25 rounded-[32px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
        >
          {/* Header decorative frosted banner */}
          <div className="h-1.5 bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400 opacity-80"></div>
          
          <div className="p-1 md:p-1.5">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
