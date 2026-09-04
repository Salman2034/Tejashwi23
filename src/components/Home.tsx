import { BookOpen, FileText, Bell, HeartPulse, ArrowRight, MessageCircle } from 'lucide-react';
import RoutineWidget from './RoutineWidget';
import CalendarWidget from './CalendarWidget';
import GalleryWidget from './GalleryWidget';
import StatsWidget from './StatsWidget';

export default function Home({ setActiveTab, setActiveAlbumId }: { setActiveTab: (t: string) => void, setActiveAlbumId: (id: string | null) => void }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-[#061d15] text-white rounded-[2rem] overflow-hidden shadow-2xl border border-emerald-500/30 backdrop-blur-md">
        <img 
          src="/Ewmch-bg.png" 
          alt="EWMC Building Background" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-85 md:opacity-90 pointer-events-none -z-20"
        />
        {/* Transparent tint so text has clear contrast while keeping the college building clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03140e]/85 via-[#03140e]/60 to-[#03140e]/45 -z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#03140e]/90 via-transparent to-transparent -z-10"></div>
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[90px] translate-x-1/3 -translate-y-1/3 -z-10 pointer-events-none"></div>
        
        <div className="relative px-6 py-10 sm:px-12 sm:py-16 md:flex md:items-center md:justify-between text-center md:text-left z-10">
          <div className="md:w-7/12 lg:w-2/3 md:pr-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md">
              <HeartPulse size={16} className="text-emerald-400 animate-pulse" /> 23rd Batch EWMC
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 whitespace-nowrap drop-shadow-sm">Tejashwi 23</span>
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/80 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
              The official digital hub for the 23rd batch of East West Medical College. Access class routines, lecture notes, textbooks, and batch notices all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setActiveTab('lectures')} 
                className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={20} className="text-slate-900" />
                View Lectures
              </button>
              <button 
                onClick={() => setActiveTab('notices')} 
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <Bell size={20} className="text-emerald-300" />
                Notices
              </button>
            </div>
          </div>
          <div className="hidden md:block md:w-5/12 lg:w-1/3 mt-8 md:mt-0">
            <RoutineWidget setActiveTab={setActiveTab} />
          </div>
        </div>
      </section>

      {/* Routine Widget for Mobile (Hidden on Desktop) */}
      <div className="md:hidden">
        <RoutineWidget setActiveTab={setActiveTab} />
      </div>

      {/* Live Academic & Visitor Statistics */}
      <StatsWidget setActiveTab={setActiveTab} />

      {/* Quick Access Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div 
          onClick={() => setActiveTab('lectures')} 
          className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-emerald-900/10 dark:border-emerald-500/20 hover:bg-white dark:hover:bg-[#0e2f24]/80 hover:border-emerald-500/40 shadow-[0_4px_20px_rgba(4,40,24,0.04)] hover:shadow-[0_12px_30px_rgba(4,40,24,0.08)] dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 shadow-inner">
            <FileText size={26} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Class Lectures</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed flex-grow font-light">Download PDF slides, handwritten notes, and presentations.</p>
          <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">Browse resources <ArrowRight size={18} /></span>
        </div>

        <div 
          onClick={() => setActiveTab('books')} 
          className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-emerald-900/10 dark:border-emerald-500/20 hover:bg-white dark:hover:bg-[#0e2f24]/80 hover:border-emerald-500/40 shadow-[0_4px_20px_rgba(4,40,24,0.04)] hover:shadow-[0_12px_30px_rgba(4,40,24,0.08)] dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 shadow-inner">
            <BookOpen size={26} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Textbooks</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed flex-grow font-light">Access a curated digital collection of reference medical textbooks.</p>
          <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">Open library <ArrowRight size={18} /></span>
        </div>

        <div 
          onClick={() => setActiveTab('notices')} 
          className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-emerald-900/10 dark:border-emerald-500/20 hover:bg-white dark:hover:bg-[#0e2f24]/80 hover:border-emerald-500/40 shadow-[0_4px_20px_rgba(4,40,24,0.04)] hover:shadow-[0_12px_30px_rgba(4,40,24,0.08)] dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer flex flex-col h-full hover:-translate-y-1"
        >
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 shadow-inner">
            <Bell size={26} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">Notices</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 leading-relaxed flex-grow font-light">Stay updated with the latest batch announcements and alerts.</p>
          <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">View updates <ArrowRight size={18} /></span>
        </div>
      </section>

      {/* Calendar Widget Section */}
      <section className="mt-8 lg:mt-12">
        <CalendarWidget setActiveTab={setActiveTab} />
      </section>

      {/* Gallery Widget Section */}
      <GalleryWidget setActiveTab={setActiveTab} setActiveAlbumId={setActiveAlbumId} />

      {/* Contact Section */}
      <section id="contact-section" className="mt-12 lg:mt-16 scroll-mt-24 bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-8 md:p-12 rounded-[2rem] border border-emerald-900/10 dark:border-emerald-500/20 text-center flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(4,40,24,0.04)] dark:shadow-none animate-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="w-16 h-16 bg-teal-500/10 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-6 ring-1 ring-teal-500/25 shadow-inner">
          <MessageCircle size={32} />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Need Help or Have Questions?</h3>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl font-light leading-relaxed">
          Reach out directly if you need specific resources, have questions about the curriculum, or need to discuss any batch-related matters.
        </p>
        <a 
          href="https://wa.me/8801678052561" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-[0_4px_16px_rgba(5,150,105,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          <MessageCircle size={24} />
          Message on WhatsApp
        </a>
      </section>
    </div>
  );
}
