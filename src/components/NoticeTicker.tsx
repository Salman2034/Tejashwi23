import { AlertCircle } from 'lucide-react';
import { Notice } from '../types';

export default function NoticeTicker({ notices, setActiveTab }: { notices: Notice[], setActiveTab: (tab: string) => void }) {
  if (!notices || notices.length === 0) return null;

  // Duplicate the notices array to create a seamless looping effect
  const tickerItems = [...notices, ...notices];

  return (
    <div 
      onClick={() => setActiveTab('notices')}
      className="bg-slate-950 border-b border-white/5 flex items-center h-10 overflow-hidden relative w-full cursor-pointer hover:bg-slate-900 transition-colors"
    >
      {/* Fixed Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 bg-slate-900 border-r border-white/10 px-4 flex items-center gap-2 shadow-[10px_0_20px_rgba(0,0,0,0.8)] shrink-0">
        <AlertCircle size={16} className="text-red-500 animate-pulse" />
        <span className="text-xs font-bold tracking-widest text-slate-200 uppercase">Notice</span>
      </div>

      {/* Scrolling Content */}
      <div 
        className="flex-1 h-full overflow-hidden flex items-center pl-28 group"
        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 1%, black 99%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 1%, black 99%, transparent)' }}
      >
        <div className="flex items-center whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] w-max">
          {tickerItems.map((notice, index) => (
            <div key={`${notice.id}-${index}`} className="flex items-center">
              <span className="mx-6 text-slate-700">|</span>
              <span className={`text-sm ${notice.isImportant ? 'text-red-400 font-medium' : 'text-slate-300 hover:text-white transition-colors'}`}>
                {notice.isImportant && <span className="mr-2 text-red-500 font-bold uppercase text-xs tracking-wider">Breaking</span>}
                {notice.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
