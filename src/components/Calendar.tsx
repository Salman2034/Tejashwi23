import { useState, useEffect } from 'react';
import { Calendar, CalendarDays, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { academicCalendar } from '../data/calendar';

const PHASES = ['1st Phase', '2nd Phase', '3rd Phase', '4th Phase'];

export default function CalendarPage() {
  const [selectedPhase, setSelectedPhase] = useState('1st Phase');
  const [selectedCalendarIndex, setSelectedCalendarIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    let currentIdx = academicCalendar.findIndex(c => c.year === y && c.monthIndex === m);
    if (currentIdx === -1) currentIdx = 0; // fallback to start of calendar if not found
    setSelectedCalendarIndex(currentIdx);
  }, []);

  if (!isClient) return null;

  const currentMonth = academicCalendar[selectedCalendarIndex];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="text-rose-500 dark:text-rose-400" size={18} />;
      case 'holiday': return <CalendarDays className="text-emerald-600 dark:text-emerald-400" size={18} />;
      case 'academic': return <BookOpen className="text-teal-600 dark:text-teal-400" size={18} />;
      default: return <AlertCircle className="text-slate-500 dark:text-slate-400" size={18} />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
      case 'holiday': return 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'academic': return 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20';
      default: return 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25 shadow-inner">
          <Calendar size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Academic Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Select phase to view the schedule</p>
        </div>
      </div>

      {/* Phase Selector matching Gallery layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 bg-white/80 dark:bg-[#0a231b]/60 p-2 rounded-2xl border border-emerald-900/10 dark:border-white/5 shadow-sm backdrop-blur-sm">
        {PHASES.map((phase) => {
          const isSelected = selectedPhase === phase;
          return (
            <button
              key={phase}
              id={`calendar-phase-tab-${phase.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedPhase(phase)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/30 shadow-sm font-semibold'
                  : 'bg-transparent text-emerald-950/70 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] hover:text-emerald-950 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{phase}</span>
            </button>
          );
        })}
      </div>

      {selectedPhase === '1st Phase' ? (
        <>
          {/* Month Selector - All months shown at once in responsive grid without inner scrolling */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8 bg-white/80 dark:bg-[#0a231b]/60 p-3 rounded-2xl border border-emerald-900/10 dark:border-white/5 shadow-sm backdrop-blur-sm">
            {academicCalendar.map((month, idx) => {
              const isSelected = selectedCalendarIndex === idx;
              const isCurrent = month.monthIndex === new Date().getMonth() && month.year === new Date().getFullYear();
              return (
                <button
                  key={`${month.year}-${month.monthIndex}`}
                  onClick={() => setSelectedCalendarIndex(idx)}
                  className={`py-2 px-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/30 shadow-sm font-semibold'
                      : 'bg-emerald-50/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-emerald-100/70 dark:hover:bg-[#0e2f24] hover:text-emerald-950 dark:hover:text-white border border-emerald-900/5 dark:border-white/5'
                  }`}
                >
                  <span className="whitespace-nowrap">{month.monthName.substring(0, 3)} '{month.year.toString().substring(2)}</span>
                  {isCurrent && (
                    <span className={`text-[9px] font-bold uppercase leading-none mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      Now
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-white/90 dark:bg-[#0a231b]/70 border border-emerald-900/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300" key={`${currentMonth.year}-${currentMonth.monthIndex}`}>
            <div className="bg-emerald-100/70 dark:bg-[#082218] px-6 py-4 border-b border-emerald-900/10 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{currentMonth.monthName} {currentMonth.year} ({selectedPhase})</h2>
              {currentMonth.monthIndex === new Date().getMonth() && currentMonth.year === new Date().getFullYear() && (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-500/25">
                  Current Month
                </span>
              )}
            </div>
            
            <div className="p-6">
              {currentMonth.events.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <CalendarDays className="mx-auto text-emerald-700/30 dark:text-slate-600 mb-4" size={48} />
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">No major events scheduled</p>
                  <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Regular classes and hospital postings continue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMonth.events.map((event) => (
                    <div 
                      key={event.id}
                      className={`flex flex-col md:flex-row gap-4 p-5 rounded-xl border ${getEventBg(event.type)} transition-all`}
                    >
                      <div className="flex items-center md:items-start md:min-w-[160px] md:max-w-[220px]">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-emerald-900/10 dark:border-white/5 w-full md:w-auto text-center md:text-left shadow-xs">
                          {event.displayDate}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getEventIcon(event.type)}
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            {event.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm bg-white/80 dark:bg-[#0a231b]/60 py-4 px-6 rounded-xl border border-emerald-900/10 dark:border-white/5 shadow-sm">
            <p className="font-semibold">N.B: Schedule can be changed according to need.</p>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm border border-emerald-900/10 dark:border-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-300 shadow-sm">
          <CalendarDays className="mx-auto text-emerald-700/30 dark:text-slate-600 mb-6" size={64} />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">{selectedPhase} Calendar</h2>
          <p className="text-slate-600 dark:text-slate-400">The academic calendar for {selectedPhase} will be published soon.</p>
        </div>
      )}
    </div>
  );
}
