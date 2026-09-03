import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, FileText, CalendarDays, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { academicCalendar } from '../data/calendar';

export default function CalendarWidget({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const now = new Date();
  const nowSynthetic = now.getFullYear() * 10000 + now.getMonth() * 100 + now.getDate();
  
  // Flatten all events across all months to find the truly upcoming ones
  const allEvents = academicCalendar.flatMap(month => 
    month.events.map(event => ({
      ...event,
      monthIndex: month.monthIndex,
      year: month.year,
      syntheticDate: month.year * 10000 + month.monthIndex * 100 + event.date
    }))
  );

  // Filter for events happening today or in the future
  const upcomingEvents = allEvents
    .filter(e => e.syntheticDate >= nowSynthetic)
    .sort((a, b) => a.syntheticDate - b.syntheticDate)
    .slice(0, 3); // take top 3

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="text-rose-400" size={14} />;
      case 'holiday': return <CalendarDays className="text-emerald-400" size={14} />;
      case 'academic': return <BookOpen className="text-blue-400" size={14} />;
      default: return <AlertCircle className="text-slate-400" size={14} />;
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 lg:p-8 hover:bg-slate-800/60 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <CalendarIcon size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">Upcoming Events</h3>
            <p className="text-xs text-emerald-400 font-medium">Phase-1 Batch: EW-23</p>
          </div>
        </div>
        <button 
          onClick={() => setActiveTab('calendar')}
          className="text-sm font-medium text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          View Calendar <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(event => (
            <div key={event.id} className="flex flex-col gap-2 p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-emerald-500/20 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  {getEventIcon(event.type)}
                  <span className="uppercase tracking-wider">{event.type}</span>
                </div>
                <div className="text-[11px] font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {event.displayDate}
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-200 leading-tight">{event.title}</h4>
            </div>
          ))
        ) : (
          <div className="text-center py-6 px-4 bg-slate-950/40 rounded-xl border border-white/5">
            <p className="text-sm text-slate-400">No upcoming events found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
