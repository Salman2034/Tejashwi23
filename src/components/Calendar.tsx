import { useState, useEffect } from 'react';
import { Calendar, CalendarDays, BookOpen, AlertCircle, FileText } from 'lucide-react';
import { academicCalendar } from '../data/calendar';

export default function CalendarPage() {
  const [selectedPhase, setSelectedPhase] = useState('1st');
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
  
  const phases = ['1st', '2nd', '3rd', '4th'];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="text-rose-400" size={18} />;
      case 'holiday': return <CalendarDays className="text-emerald-400" size={18} />;
      case 'academic': return <BookOpen className="text-blue-400" size={18} />;
      default: return <AlertCircle className="text-slate-400" size={18} />;
    }
  };

  const getEventBg = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-rose-500/10 border-rose-500/20';
      case 'holiday': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'academic': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-slate-800/50 border-white/5';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <Calendar className="text-emerald-400" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Academic Calendar</h1>
          <p className="text-slate-400 mt-1">Select phase to view the schedule</p>
        </div>
      </div>

      {/* Phase Selector */}
      <div className="flex flex-wrap gap-2 mb-6 bg-slate-900/40 p-2 rounded-2xl border border-white/5">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setSelectedPhase(phase)}
            className={`flex-1 min-w-[80px] py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
              selectedPhase === phase
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            {phase} Phase
          </button>
        ))}
      </div>

      {selectedPhase === '1st' ? (
        <>
          {/* Month Selector */}
          <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/40 p-2 rounded-2xl border border-white/5 max-h-[160px] overflow-y-auto custom-scrollbar">
            {academicCalendar.map((month, idx) => (
              <button
                key={`${month.year}-${month.monthIndex}`}
                onClick={() => setSelectedCalendarIndex(idx)}
                className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 ${
                  selectedCalendarIndex === idx
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                {month.monthName.substring(0, 3)} '{month.year.toString().substring(2)}
              </button>
            ))}
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300" key={`${currentMonth.year}-${currentMonth.monthIndex}`}>
            <div className="bg-slate-800/80 px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">{currentMonth.monthName} {currentMonth.year} (1st Phase)</h2>
              {currentMonth.monthIndex === new Date().getMonth() && currentMonth.year === new Date().getFullYear() && (
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  Current Month
                </span>
              )}
            </div>
            
            <div className="p-6">
              {currentMonth.events.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CalendarDays className="mx-auto text-slate-600 mb-4 opacity-50" size={48} />
                  <p className="text-lg font-medium">No major events scheduled</p>
                  <p className="text-sm mt-1">Regular classes and hospital postings continue.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentMonth.events.map((event) => (
                    <div 
                      key={event.id}
                      className={`flex flex-col md:flex-row gap-4 p-5 rounded-xl border ${getEventBg(event.type)} transition-all hover:bg-opacity-80`}
                    >
                      <div className="flex items-center md:items-start md:min-w-[160px] md:max-w-[220px]">
                        <span className="text-sm font-semibold text-slate-200 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-white/5 w-full md:w-auto text-center md:text-left">
                          {event.displayDate}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getEventIcon(event.type)}
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {event.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-slate-400 mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-slate-500 text-sm bg-slate-900/50 py-4 px-6 rounded-xl border border-white/5">
            <p className="font-medium">N.B: Schedule can be changed according to need.</p>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-slate-900/60 backdrop-blur-sm border border-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
          <CalendarDays className="mx-auto text-slate-600 mb-6 opacity-50" size={64} />
          <h2 className="text-2xl font-bold text-slate-200 mb-2">{selectedPhase} Phase Calendar</h2>
          <p className="text-slate-400">The academic calendar for the {selectedPhase} phase will be published soon.</p>
        </div>
      )}
    </div>
  );
}
