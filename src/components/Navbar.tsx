import { Stethoscope, BookOpen, FileText, Bell, MessageCircle, CalendarDays, Image as ImageIcon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, setActiveAlbumId }: { activeTab: string, setActiveTab: (t: string) => void, setActiveAlbumId: (id: string | null) => void }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Stethoscope },
    { id: 'routine', label: 'Routine', icon: CalendarDays },
    { id: 'lectures', label: 'Lectures', icon: FileText },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'contact') {
      setActiveTab('contact');
      setTimeout(() => {
        document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (id === 'gallery') setActiveAlbumId(null);
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Navbar (Desktop + Mobile Brand Bar) with Universal Glass Texture */}
      <header className="bg-slate-950/40 backdrop-blur-2xl backdrop-saturate-180 text-slate-200 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.08)] border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0" 
              onClick={() => handleNavClick('home')}
            >
              <div className="bg-emerald-500/15 text-emerald-400 p-2 rounded-full group-hover:bg-emerald-500/25 group-hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30 backdrop-blur-md shrink-0">
                <Stethoscope size={24} strokeWidth={2.5} />
              </div>
              <div className="shrink-0">
                <h1 className="font-bold text-lg sm:text-xl leading-tight text-white tracking-wide whitespace-nowrap">Tejashwi 23</h1>
                <p className="text-[10px] sm:text-xs text-emerald-400/80 font-medium tracking-wider uppercase whitespace-nowrap">East West Medical College</p>
              </div>
            </div>

            {/* Desktop Navigation Links (shown only on large desktop screens where all 8 items fit comfortably) */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-xl text-xs xl:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                      isActive 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md' 
                        : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-emerald-400" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile & Tablet Header Active View Indicator */}
            <div className="lg:hidden flex items-center">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 backdrop-blur-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] capitalize">
                {navItems.find(i => i.id === activeTab)?.label || activeTab}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Floating Bottom Glass Dock - compact, rounded pill dock */}
      <nav 
        id="mobile-bottom-navbar"
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed z-50 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-1.25rem)] pointer-events-auto"
        style={{
          bottom: 'max(0.75rem, env(safe-area-inset-bottom, 10px))',
        }}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 md:p-2 rounded-full bg-slate-900/40 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.35)] ring-1 ring-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                aria-label={item.label}
                title={item.label}
                className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full transition-all duration-200 active:scale-90 ${
                  isActive 
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-[0_0_16px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md' 
                    : 'text-slate-300 hover:text-white hover:bg-white/15'
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110 text-emerald-300' : 'text-slate-400'}`} 
                />
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
