import { useState, useEffect } from 'react';
import { Clock, MapPin, User, CalendarDays } from 'lucide-react';
import { weeklyRoutine } from '../data/routine';

export default function Routine() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date().getDay();
    // Map JS getDay() to our array (Sun=0, Mon=1...Sat=6). 
    // Our array starts at Saturday (index 0).
    const mappedIndex = today === 6 ? 0 : today + 1;
    setSelectedDayIndex(mappedIndex);
  }, []);

  if (!isClient) return null;

  const currentDay = weeklyRoutine[selectedDayIndex];
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <CalendarDays className="text-emerald-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Weekly Class Routine</h1>
          <p className="text-slate-400 mt-1">1st Year (EW-23) Session: 2025-26</p>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/40 p-2 rounded-2xl border border-white/5">
        {weeklyRoutine.map((dayRoutine, idx) => (
          <button
            key={dayRoutine.day}
            onClick={() => setSelectedDayIndex(idx)}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedDayIndex === idx
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            {dayRoutine.day}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300" key={currentDay.day}>
          <div className="bg-slate-800/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-200">{currentDay.day}</h2>
            {currentDay.day === weeklyRoutine[new Date().getDay() === 6 ? 0 : new Date().getDay() + 1]?.day && (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                Today
              </span>
            )}
          </div>
          
          <div className="p-6">
            {currentDay.isHoliday ? (
              <div className="text-center py-12 text-emerald-400/80 font-medium bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <div className="text-lg tracking-[0.2em] mb-2">W E E K L Y</div>
                <div className="text-3xl font-bold tracking-[0.4em] text-emerald-500/40">H O L I D A Y</div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {currentDay.periods.map((period) => (
                  <div 
                    key={period.id} 
                    className={`rounded-xl p-4 border ${
                      period.type === 'break' 
                        ? 'bg-slate-800/40 border-slate-700/50 flex flex-col justify-center items-center text-center lg:col-span-1 min-h-[120px]' 
                        : 'bg-slate-950/40 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-center lg:justify-start gap-1.5 text-emerald-400 text-xs font-medium mb-4 bg-emerald-500/10 w-fit lg:mx-0 mx-auto px-2.5 py-1 rounded-md">
                      <Clock size={14} />
                      {period.time}
                    </div>

                    {period.type === 'break' && (
                      <div className="text-slate-400 font-bold tracking-widest uppercase text-sm mt-2">
                        {period.title}
                      </div>
                    )}

                    {period.type === 'lecture' && (
                      <div className="text-center lg:text-left">
                        <div className="text-[10px] font-bold text-teal-400 mb-1.5 tracking-wider uppercase bg-teal-500/10 w-fit lg:mx-0 mx-auto px-2 py-0.5 rounded-sm">Lecture</div>
                        <h3 className="text-slate-100 font-bold text-xl mb-3 leading-tight">{period.title}</h3>
                        
                        <div className="flex items-start lg:items-center justify-center lg:justify-start gap-2 text-slate-400 text-sm mb-2">
                          <User size={14} className="shrink-0 text-slate-500" />
                          <span className="leading-tight">{period.teacher}</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 text-sm">
                          <MapPin size={14} className="shrink-0 text-slate-500" />
                          <span>{period.location}</span>
                        </div>
                      </div>
                    )}

                    {period.type === 'tutorial' && (
                      <div className="text-center lg:text-left">
                        <div className="text-[10px] font-bold text-blue-400 mb-3 tracking-wider uppercase bg-blue-500/10 w-fit lg:mx-0 mx-auto px-2 py-0.5 rounded-sm">Tutorial / Practical</div>
                        <div className="space-y-2 text-left max-w-[220px] mx-auto lg:mx-0">
                          {period.batches?.map(b => (
                            <div key={b.batch} className="flex items-start gap-2 text-sm bg-slate-900/50 p-2 rounded-lg border border-white/5">
                              <span className="font-bold text-slate-300 min-w-[1.2rem]">{b.batch}-</span>
                              <span className="text-slate-400 leading-snug">{b.details}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-slate-500 text-sm bg-slate-900/50 py-4 px-6 rounded-xl border border-white/5">
        <p>* No change in this routine is allowed without the permission of principal</p>
        <p className="mt-2 font-medium bg-slate-800/50 inline-block px-4 py-1.5 rounded-lg border border-white/5">*A Batch: 1-25, B Batch: 26-50, C Batch: 51-75, D Batch: 76-100, E Batch: 101-127.</p>
      </div>
    </div>
  );
}
