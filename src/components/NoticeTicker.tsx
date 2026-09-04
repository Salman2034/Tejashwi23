import { AlertCircle } from 'lucide-react';
import { Notice } from '../types';

export default function NoticeTicker({ notices, setActiveTab }: { notices: Notice[], setActiveTab: (tab: string) => void }) {
  if (!notices || notices.length === 0) return null;

  // Duplicate the notices array to create a seamless looping effect
  const tickerItems = [...notices, ...notices];

  return (
    <div 
      onClick={() => setActiveTab('notices')}
      className="bg-emerald-50/90 dark:bg-[#061811] border-b border-emerald-900/10 dark:border-emerald-500/15 flex items-center h-10 overflow-hidden relative w-full cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-[#092218] transition-colors"
    >
      {/* Fixed Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 bg-emerald-100 dark:bg-[#0a271e] border-r border-emerald-300/60 dark:border-emerald-500/20 px-3.5 sm:px-4 flex items-center gap-2 shadow-[6px_0_15px_rgba(4,40,24,0.06)] dark:shadow-[10px_0_20px_rgba(0,0,0,0.6)] shrink-0">
        <AlertCircle size={15} className="text-rose-500 animate-pulse shrink-0" />
        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-emerald-900 dark:text-emerald-300 uppercase">Notice</span>
      </div>

      {/* Scrolling Content */}
      <div 
        className="flex-1 h-full overflow-hidden flex items-center pl-28 group"
        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 1%, black 99%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 1%, black 99%, transparent)' }}
      >
        <div className="flex items-center whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] w-max">
          {tickerItems.map((notice, index) => (
            <div key={`${notice.id}-${index}`} className="flex items-center">
              <span className="mx-5 text-emerald-900/20 dark:text-emerald-500/20 font-light">/</span>
              <span className={`text-xs sm:text-sm ${notice.isImportant ? 'text-rose-700 dark:text-rose-400 font-semibold' : 'text-emerald-950/80 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white transition-colors'}`}>
                {notice.isImportant && (
                  <span className="mr-2 px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold uppercase text-[10px] tracking-wider border border-rose-300/40 dark:border-rose-500/30">
                    Breaking
                  </span>
                )}
                {notice.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
