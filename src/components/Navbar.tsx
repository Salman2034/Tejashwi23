import { Stethoscope, BookOpen, FileText, Bell, MessageCircle, MessageSquare, CalendarDays, Image as ImageIcon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ activeTab, setActiveTab, setActiveAlbumId }: { activeTab: string, setActiveTab: (t: string) => void, setActiveAlbumId: (id: string | null) => void }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Stethoscope },
    { id: 'routine', label: 'Routine', icon: CalendarDays },
    { id: 'lectures', label: 'Lectures', icon: FileText },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
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
      {/* Top Navbar (Desktop + Mobile Brand Bar) with Deep Green Glass Texture */}
      <header className="bg-white/80 dark:bg-[#04130d]/75 backdrop-blur-2xl backdrop-saturate-180 text-slate-800 dark:text-slate-200 fixed top-0 left-0 right-0 w-full z-50 shadow-[0_4px_25px_rgba(4,40,24,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.08)] border-b border-emerald-900/10 dark:border-emerald-500/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0" 
              onClick={() => handleNavClick('home')}
            >
              <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 p-2 rounded-full group-hover:bg-emerald-500/25 group-hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30 backdrop-blur-md shrink-0">
                <Stethoscope size={24} strokeWidth={2.5} />
              </div>
              <div className="shrink-0">
                <h1 className="font-bold text-lg sm:text-xl leading-tight text-emerald-950 dark:text-white tracking-wide whitespace-nowrap">Tejashwi 23</h1>
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400/80 font-medium tracking-wider uppercase whitespace-nowrap">East West Medical College</p>
              </div>
            </div>

            {/* Desktop Navigation Links + Theme Toggler */}
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
                        ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/40 shadow-[0_2px_12px_rgba(5,150,105,0.25)] dark:shadow-[0_0_15px_rgba(16,185,129,0.25),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md' 
                        : 'text-emerald-950/75 dark:text-slate-300 hover:bg-emerald-100/60 dark:hover:bg-white/10 hover:text-emerald-950 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-white dark:text-emerald-400" : "text-emerald-700 dark:text-slate-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="h-6 w-px bg-emerald-900/10 dark:bg-white/10 mx-1.5 shrink-0" />
              <ThemeToggle />
            </div>

            {/* Mobile & Tablet Header Active View Indicator + Theme Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-white/5 backdrop-blur-xl text-emerald-900 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-500/30 shadow-[0_2px_8px_rgba(5,150,105,0.1)] dark:shadow-[0_0_12px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] capitalize">
                {navItems.find(i => i.id === activeTab)?.label || activeTab}
              </span>
              <ThemeToggle compact={true} />
            </div>
          </div>
        </div>
      </header>

      {/* Spacer to prevent page content from being obscured by the fixed top navbar */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />

      {/* Mobile & Tablet Floating Bottom Glass Dock */}
      <nav 
        id="mobile-bottom-navbar"
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed z-50 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-1.25rem)] pointer-events-auto"
        style={{
          bottom: 'max(0.75rem, env(safe-area-inset-bottom, 10px))',
        }}
      >
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 p-1.5 md:p-2 rounded-full bg-white/85 dark:bg-[#061d15]/60 backdrop-blur-2xl backdrop-saturate-200 border border-emerald-900/15 dark:border-white/20 shadow-[0_16px_40px_rgba(4,30,20,0.18)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.35)] ring-1 ring-emerald-900/5 dark:ring-white/10">
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
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500/25 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-400/40 shadow-[0_2px_12px_rgba(5,150,105,0.35)] dark:shadow-[0_0_16px_rgba(16,185,129,0.45),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md' 
                    : 'text-emerald-950/70 dark:text-slate-300 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-100/60 dark:hover:bg-white/15'
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={`transition-transform duration-200 ${isActive ? 'scale-110 text-white dark:text-emerald-300' : 'text-emerald-800/80 dark:text-slate-400'}`} 
                />
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white dark:bg-emerald-400 shadow-[0_0_6px_rgba(255,255,255,0.8)] dark:shadow-[0_0_6px_rgba(52,211,153,1)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
