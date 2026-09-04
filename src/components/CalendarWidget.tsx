import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, FileText, CalendarDays, BookOpen, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { academicCalendar, EventType } from '../data/calendar';

export default function CalendarWidget({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const now = new Date();
  const nowSynthetic = now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();
  
  // Flatten all events across all months to find upcoming ones
  const allEvents = academicCalendar.flatMap(month => 
    month.events.map(event => ({
      ...event,
      monthName: month.monthName,
      monthIndex: month.monthIndex,
      year: month.year,
      syntheticDate: month.year * 10000 + month.monthIndex * 100 + event.date
    }))
  );

  // Filter for events happening today or in the future
  const upcomingEvents = allEvents
    .filter(e => e.syntheticDate >= nowSynthetic)
    .sort((a, b) => a.syntheticDate - b.syntheticDate)
    .slice(0, 4); // Take up to 4 events

  // Fallback to latest events if no upcoming events
  const displayEvents = upcomingEvents.length > 0 ? upcomingEvents : allEvents.slice(0, 4);

  const getEventBadge = (type: EventType) => {
    switch (type) {
      case 'exam':
        return {
          icon: <FileText size={14} className="text-rose-400" />,
          label: 'Exam',
          style: 'bg-rose-500/10 text-rose-300 border-rose-500/20'
        };
      case 'holiday':
        return {
          icon: <CalendarDays size={14} className="text-emerald-400" />,
          label: 'Holiday',
          style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        };
      case 'academic':
        return {
          icon: <BookOpen size={14} className="text-blue-400" />,
          label: 'Academic',
          style: 'bg-blue-500/10 text-blue-300 border-blue-500/20'
        };
      default:
        return {
          icon: <AlertCircle size={14} className="text-amber-400" />,
          label: 'Event',
          style: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        };
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 sm:p-8 hover:border-emerald-500/20 transition-all duration-300 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shadow-inner">
            <CalendarIcon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-xl tracking-tight">Academic Timeline</h3>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Phase-1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Upcoming examinations, term deadlines & scheduled leaves</p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('calendar')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all group"
        >
          <span>Full Schedule</span>
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grid of upcoming events - responsive from 1 column up to 4 on widescreen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {displayEvents.map((event) => {
          const badge = getEventBadge(event.type);
          return (
            <div 
              key={event.id}
              onClick={() => setActiveTab('calendar')}
              className="group cursor-pointer flex flex-col justify-between p-5 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60 hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${badge.style}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {event.monthName} {event.year}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                  {event.title}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 text-slate-300 font-medium truncate max-w-[200px]">
                  <Clock size={12} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{event.displayDate}</span>
                </span>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
