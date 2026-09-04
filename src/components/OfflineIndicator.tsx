import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#09221a] text-white border border-emerald-500/40 shadow-2xl backdrop-blur-md">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
          <WifiOff size={18} />
        </div>
        <div className="flex-grow text-xs leading-tight">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <span>Offline Mode</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
          <div className="text-slate-300 text-[11px] mt-0.5 font-medium flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
            <span>Using cached batch resources offline.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
