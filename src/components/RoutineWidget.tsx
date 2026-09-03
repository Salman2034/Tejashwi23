import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, CalendarDays } from 'lucide-react';
import { weeklyRoutine } from '../data/routine';

export default function RoutineWidget({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Bangladesh time logic
    const updateRoutineTime = () => {
      const now = new Date();
      // Get current hour and minute in Dhaka timezone
      const dhakaTimeOptions = { timeZone: 'Asia/Dhaka', hour: 'numeric', minute: 'numeric', hour12: false } as const;
      const parts = new Intl.DateTimeFormat('en-US', dhakaTimeOptions).formatToParts(now);
      
      let hour = 0;
      let minute = 0;
      for (const part of parts) {
        if (part.type === 'hour') hour = parseInt(part.value, 10);
        if (part.type === 'minute') minute = parseInt(part.value, 10);
      }
      
      // We want to calculate the "target calendar day" in Dhaka time.
      // So we get the actual Date object corresponding to Dhaka time.
      const dhakaDateOptions = { timeZone: 'Asia/Dhaka', year: 'numeric', month: 'numeric', day: 'numeric' } as const;
      const dateParts = new Intl.DateTimeFormat('en-US', dhakaDateOptions).formatToParts(now);
      let year = 2024, month = 1, day = 1;
      for (const part of dateParts) {
        if (part.type === 'year') year = parseInt(part.value, 10);
        if (part.type === 'month') month = parseInt(part.value, 10);
        if (part.type === 'day') day = parseInt(part.value, 10);
      }
      const dhakaDate = new Date(year, month - 1, day);
      
      let targetDayOfWeek = dhakaDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      const timeFloat = hour + minute / 60;
      
      // If time is >= 14:30 (2:30 PM), we show tomorrow's routine
      if (timeFloat >= 14.5) {
        targetDayOfWeek = (targetDayOfWeek + 1) % 7;
      }
      // If time is < 4:00 AM, we are technically already on the "next" calendar day compared to yesterday, 
      // but the prompt says: "from 4am to 2.30pm show today's routine". 
      // If the current time is 3:00 AM on Tuesday, the prompt implies this is part of the "2.30pm to 4am next day" 
      // period originating from Monday. 
      // Actually, if it's 3AM Tuesday, the calendar day is Tuesday. But the prompt says "from 2.30pm to 4am next day" 
      // it should show next day's routine (i.e. Tuesday's). 
      // So from 00:00 to 04:00, targetDayOfWeek remains the current calendar day (Tuesday), which is correct!
      // From 04:00 to 14:30, it ALSO shows today's routine (Tuesday). So targetDayOfWeek remains the current calendar day.
      // Thus, ONLY if timeFloat >= 14.5 do we add 1 day.

      // Map getDay() to our weeklyRoutine index.
      // weeklyRoutine: 0=Sat, 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri
      // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
      const mappedDayIndex = targetDayOfWeek === 6 ? 0 : targetDayOfWeek + 1;
      setCurrentDayIndex(mappedDayIndex);

      const targetRoutine = weeklyRoutine[mappedDayIndex];

      // Determine period
      // If target day is tomorrow, default to first period
      if (timeFloat >= 14.5 || timeFloat < 4 || targetRoutine.isHoliday) {
        setCurrentPeriodIndex(0);
      } else {
        // Find the current period based on time
        if (timeFloat < 10) setCurrentPeriodIndex(0);
        else if (timeFloat >= 10 && timeFloat < 11) setCurrentPeriodIndex(1);
        else if (timeFloat >= 11 && timeFloat < 12) setCurrentPeriodIndex(2);
        else if (timeFloat >= 12 && timeFloat < 12.5) setCurrentPeriodIndex(3);
        else setCurrentPeriodIndex(4);
      }
    };

    updateRoutineTime();
    const interval = setInterval(updateRoutineTime, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  if (!isClient) return null;

  const currentDay = weeklyRoutine[currentDayIndex];
  
  const handlePrev = () => {
    if (!currentDay.isHoliday && currentPeriodIndex > 0) {
      setCurrentPeriodIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (!currentDay.isHoliday && currentPeriodIndex < currentDay.periods.length - 1) {
      setCurrentPeriodIndex(prev => prev + 1);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -z-10"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-emerald-400" size={20} />
          <h3 className="font-bold text-slate-100">{currentDay.day}'s Routine</h3>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-slate-800 rounded-md text-slate-300">
          {currentDay.isHoliday ? 'Holiday' : `Period ${currentPeriodIndex + 1} of ${currentDay.periods.length}`}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center min-h-[140px]">
        {currentDay.isHoliday ? (
          <div className="text-center text-emerald-400/80 font-medium tracking-widest text-sm">
            W E E K L Y <br /> H O L I D A Y
          </div>
        ) : (
          <div className="w-full relative px-8">
            <button 
              onClick={handlePrev}
              disabled={currentPeriodIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-full text-slate-300 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center space-y-2">
              {currentDay.periods[currentPeriodIndex] && (() => {
                const p = currentDay.periods[currentPeriodIndex];
                return (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-2 bg-emerald-500/10 px-2 py-0.5 rounded">
                      <Clock size={12} /> {p.time}
                    </div>
                    
                    {p.type === 'break' && (
                      <div className="text-slate-300 font-bold tracking-widest uppercase">
                        {p.title}
                      </div>
                    )}
                    
                    {p.type === 'lecture' && (
                      <>
                        <h4 className="text-lg font-bold text-slate-100 leading-tight">{p.title}</h4>
                        <div className="text-sm text-slate-400 mt-1">{p.teacher}</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
                          <MapPin size={12} /> {p.location}
                        </div>
                      </>
                    )}
                    
                    {p.type === 'tutorial' && (
                      <>
                        <h4 className="text-base font-bold text-blue-400 leading-tight mb-2">Tutorial / Practical</h4>
                        <div className="text-xs text-slate-300 grid grid-cols-2 gap-x-2 gap-y-1 text-left max-w-[200px] mx-auto">
                          {p.batches?.map(b => (
                            <div key={b.batch} className="flex gap-1 truncate" title={b.details}>
                              <span className="font-bold text-slate-400">{b.batch}:</span>
                              <span className="truncate">{b.details}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            <button 
              onClick={handleNext}
              disabled={currentPeriodIndex === currentDay.periods.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 rounded-full text-slate-300 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={() => setActiveTab('routine')}
        className="mt-4 w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-sm font-medium text-slate-200 rounded-lg transition-colors border border-white/5"
      >
        See full routine
      </button>
    </div>
  );
}
