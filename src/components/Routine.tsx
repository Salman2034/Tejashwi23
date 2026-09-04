import { useState, useEffect } from 'react';
import { Clock, MapPin, User, CalendarDays } from 'lucide-react';
import { weeklyRoutine } from '../data/routine';

export default function Routine() {
  const [selectedYear, setSelectedYear] = useState('1st');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date().getDay();
    const mappedIndex = today === 6 ? 0 : today + 1;
    setSelectedDayIndex(mappedIndex);
  }, []);

  if (!isClient) return null;

  const currentDay = weeklyRoutine[selectedDayIndex];
  const years = ['1st', '2nd', '3rd', '4th', '5th'];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25 shadow-inner">
          <CalendarDays size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Weekly Class Routine</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Select your year to view the schedule</p>
        </div>
      </div>

      {/* Year Selector */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white/80 dark:bg-[#0a231b]/60 p-2 rounded-2xl border border-emerald-900/10 dark:border-white/5 shadow-sm">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`flex-1 min-w-[80px] py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedYear === year
                ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/30 shadow-sm'
                : 'bg-transparent text-emerald-950/70 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] hover:text-emerald-950 dark:hover:text-slate-200 border border-transparent'
            }`}
          >
            {year} Year
          </button>
        ))}
      </div>

      {selectedYear === '1st' ? (
        <>
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 mb-8 bg-white/80 dark:bg-[#0a231b]/60 p-2 rounded-2xl border border-emerald-900/10 dark:border-white/5 shadow-sm">
            {weeklyRoutine.map((dayRoutine, idx) => (
              <button
                key={dayRoutine.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedDayIndex === idx
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/30 shadow-sm'
                    : 'bg-transparent text-emerald-950/70 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] hover:text-emerald-950 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                {dayRoutine.day}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white/90 dark:bg-[#0a231b]/70 border border-emerald-900/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300" key={currentDay.day}>
              <div className="bg-emerald-100/70 dark:bg-[#082218] px-6 py-4 border-b border-emerald-900/10 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentDay.day} (1st Year)</h2>
                {currentDay.day === weeklyRoutine[new Date().getDay() === 6 ? 0 : new Date().getDay() + 1]?.day && (
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-500/25">
                    Today
                  </span>
                )}
              </div>
              
              <div className="p-6">
                {currentDay.isHoliday ? (
                  <div className="text-center py-12 text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-200 dark:border-emerald-500/10">
                    <div className="text-lg tracking-[0.2em] mb-2 font-semibold">W E E K L Y</div>
                    <div className="text-3xl font-bold tracking-[0.4em] text-emerald-800/50 dark:text-emerald-500/40">H O L I D A Y</div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {currentDay.periods.map((period) => (
                      <div 
                        key={period.id} 
                        className={`rounded-xl p-4 border ${
                          period.type === 'break' 
                            ? 'bg-emerald-50/60 dark:bg-slate-800/40 border-emerald-200/60 dark:border-slate-700/50 flex flex-col justify-center items-center text-center lg:col-span-1 min-h-[120px]' 
                            : 'bg-emerald-50/30 dark:bg-slate-950/40 border-emerald-900/10 dark:border-white/5 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-center lg:justify-start gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 w-fit lg:mx-0 mx-auto px-2.5 py-1 rounded-md">
                          <Clock size={14} />
                          {period.time}
                        </div>

                        {period.type === 'break' && (
                          <div className="text-slate-700 dark:text-slate-400 font-bold tracking-widest uppercase text-sm mt-2">
                            {period.title}
                          </div>
                        )}

                        {period.type === 'lecture' && (
                          <div className="text-center lg:text-left">
                            <div className="text-[10px] font-bold text-emerald-800 dark:text-teal-400 mb-1.5 tracking-wider uppercase bg-emerald-100 dark:bg-teal-500/10 w-fit lg:mx-0 mx-auto px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-transparent">Lecture</div>
                            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-xl mb-3 leading-tight">{period.title}</h3>
                            
                            <div className="flex items-start lg:items-center justify-center lg:justify-start gap-2 text-slate-600 dark:text-slate-400 text-sm mb-2">
                              <User size={14} className="shrink-0 text-emerald-600 dark:text-slate-500" />
                              <span className="leading-tight">{period.teacher}</span>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
                              <MapPin size={14} className="shrink-0 text-emerald-600 dark:text-slate-500" />
                              <span>{period.location}</span>
                            </div>
                          </div>
                        )}

                        {period.type === 'tutorial' && (
                          <div className="text-center lg:text-left">
                            <div className="text-[10px] font-bold text-emerald-800 dark:text-blue-400 mb-3 tracking-wider uppercase bg-emerald-100 dark:bg-blue-500/10 w-fit lg:mx-0 mx-auto px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-transparent">Tutorial / Practical</div>
                            <div className="space-y-2 text-left max-w-[220px] mx-auto lg:mx-0">
                              {period.batches?.map(b => (
                                <div key={b.batch} className="flex items-start gap-2 text-sm bg-white dark:bg-slate-900/50 p-2 rounded-lg border border-emerald-900/10 dark:border-white/5 shadow-xs">
                                  <span className="font-bold text-emerald-800 dark:text-slate-300 min-w-[1.2rem]">{b.batch}-</span>
                                  <span className="text-slate-600 dark:text-slate-400 leading-snug">{b.details}</span>
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
          
          <div className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm bg-white/80 dark:bg-[#0a231b]/60 py-4 px-6 rounded-xl border border-emerald-900/10 dark:border-white/5 shadow-sm">
            <p className="text-red-600 dark:text-red-400 font-semibold">* No change in this routine is allowed without the permission of principal</p>
            <p className="mt-2 font-semibold bg-emerald-50 dark:bg-[#082218] text-emerald-900 dark:text-emerald-300 inline-block px-4 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">*A Batch: 1-25, B Batch: 26-50, C Batch: 51-75, D Batch: 76-100, E Batch: 101-127.</p>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm border border-emerald-900/10 dark:border-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-300 shadow-sm">
          <CalendarDays className="mx-auto text-emerald-700/40 dark:text-slate-600 mb-6" size={64} />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">{selectedYear} Year Routine</h2>
          <p className="text-slate-600 dark:text-slate-400">The routine for the {selectedYear} year will be published soon.</p>
        </div>
      )}
    </div>
  );
}
