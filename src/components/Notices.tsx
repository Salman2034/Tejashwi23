import { Bell, AlertCircle, Calendar } from 'lucide-react';
import { Notice } from '../types';

export default function Notices({ notices }: { notices: Notice[] }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-3 tracking-tight">Notices & Announcements</h2>
        <p className="text-lg text-slate-400 leading-relaxed font-light">Stay up to date with the latest news, exam schedules, and important information from the 23rd batch.</p>
      </div>

      <div className="space-y-5">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-6 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-md group ${
              notice.isImportant 
                ? 'bg-red-950/20 border border-red-500/20 relative overflow-hidden' 
                : 'bg-slate-900/40 border border-white/5 hover:bg-slate-900/60'
            }`}
          >
            {notice.isImportant && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]"></div>
            )}
            
            <div className="shrink-0 hidden md:block">
              {notice.isImportant ? (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl border border-red-500/20 shadow-inner group-hover:scale-105 transition-transform">
                  <AlertCircle size={32} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl border border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform">
                  <Bell size={32} strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {notice.isImportant && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 tracking-wide uppercase border border-red-500/20 shadow-inner">
                    Important
                  </span>
                )}
                <h3 className="text-2xl font-bold text-slate-200 leading-tight group-hover:text-white transition-colors">{notice.title}</h3>
              </div>
              
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-lg font-light">{notice.content}</p>
              
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/5 text-sm font-medium text-slate-500">
                <Calendar size={16} className="text-slate-600" />
                {new Date(notice.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        ))}
        
        {notices.length === 0 && (
          <div className="text-center p-16 bg-slate-900/40 rounded-[2rem] border border-white/5 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <Bell size={32} className="text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-medium text-slate-300 mb-1">No notices at this time</p>
            <p className="text-slate-500 font-light">Check back later for updates and announcements.</p>
          </div>
        )}
      </div>
    </div>
  );
}
