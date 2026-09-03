import { BookOpen, FileText, Bell, HeartPulse, ArrowRight, MessageCircle } from 'lucide-react';

export default function Home({ setActiveTab }: { setActiveTab: (t: string) => void }) {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-slate-900/50 text-white rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 backdrop-blur-md">
        <img 
          src="/Ewmch-bg.png" 
          alt="EWMC Building Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-lighten pointer-events-none -z-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-slate-950/90 -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 -z-10 pointer-events-none"></div>
        
        <div className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none -z-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="medical-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 v40 M10 30 h40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="30" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medical-pattern)" />
          </svg>
        </div>
        
        <div className="relative px-6 py-10 sm:px-12 sm:py-16 md:flex md:items-center md:justify-between text-center md:text-left z-10">
          <div className="md:w-2/3 md:pr-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-semibold mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md">
              <HeartPulse size={16} className="text-emerald-400 animate-pulse" /> 23rd Batch EWMC
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 whitespace-nowrap drop-shadow-sm">Tejashwi 23</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed font-light">
              The official digital hub for the 23rd batch of East West Medical College. Access lecture notes, textbooks, and important batch notices all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => setActiveTab('lectures')} 
                className="px-6 py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <FileText size={20} className="text-slate-900" />
                View Lectures
              </button>
              <button 
                onClick={() => setActiveTab('notices')} 
                className="px-6 py-3.5 bg-slate-800/80 backdrop-blur-md border border-white/10 text-white font-semibold rounded-xl hover:bg-slate-700/80 hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
              >
                <Bell size={20} className="text-slate-300" />
                Notices
              </button>
            </div>
          </div>
          <div className="hidden md:flex md:w-1/3 justify-center mt-8 md:mt-0 opacity-80">
            <HeartPulse size={220} className="text-emerald-500/20 drop-shadow-[0_0_50px_rgba(16,185,129,0.2)]" strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div 
          onClick={() => setActiveTab('lectures')} 
          className="group bg-slate-900/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:bg-slate-800/60 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 shadow-inner">
            <FileText size={26} />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">Class Lectures</h3>
          <p className="text-slate-400 mb-8 leading-relaxed flex-grow font-light">Download PDF slides, handwritten notes, and presentations from recent classes.</p>
          <span className="text-emerald-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">Browse resources <ArrowRight size={18} /></span>
        </div>

        <div 
          onClick={() => setActiveTab('books')} 
          className="group bg-slate-900/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:bg-slate-800/60 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 shadow-inner">
            <BookOpen size={26} />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">Textbooks</h3>
          <p className="text-slate-400 mb-8 leading-relaxed flex-grow font-light">Access a curated digital collection of reference medical textbooks for your academic year.</p>
          <span className="text-emerald-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">Open library <ArrowRight size={18} /></span>
        </div>

        <div 
          onClick={() => setActiveTab('notices')} 
          className="group bg-slate-900/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 hover:bg-slate-800/60 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 shadow-inner">
            <Bell size={26} />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">Notices</h3>
          <p className="text-slate-400 mb-8 leading-relaxed flex-grow font-light">Stay updated with the latest batch announcements, exam schedules, and important alerts.</p>
          <span className="text-emerald-400 font-medium flex items-center gap-2 group-hover:gap-3 transition-all">View updates <ArrowRight size={18} /></span>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="mt-12 lg:mt-16 bg-slate-900/40 backdrop-blur-sm p-8 md:p-12 rounded-[2rem] border border-white/5 text-center flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-700 delay-300">
        <div className="w-16 h-16 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mb-6 ring-1 ring-teal-500/20 shadow-inner">
          <MessageCircle size={32} />
        </div>
        <h3 className="text-3xl font-bold text-slate-100 mb-4 tracking-tight">Need Help or Have Questions?</h3>
        <p className="text-lg text-slate-400 mb-8 max-w-2xl font-light leading-relaxed">
          Reach out directly if you need specific resources, have questions about the curriculum, or need to discuss any batch-related matters.
        </p>
        <a 
          href="https://wa.me/8801678052561" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          <MessageCircle size={24} />
          Message on WhatsApp
        </a>
      </section>
    </div>
  );
}
