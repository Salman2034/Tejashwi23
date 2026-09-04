import { useState, useRef, useEffect } from 'react';
import { Stethoscope, BookOpen, FileText, Bell, MessageCircle, MessageSquare, CalendarDays, Image as ImageIcon, Vote, ChevronLeft, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationCenter from './NotificationCenter';

export default function Navbar({ activeTab, setActiveTab, setActiveAlbumId }: { activeTab: string, setActiveTab: (t: string) => void, setActiveAlbumId: (id: string | null) => void }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Stethoscope },
    { id: 'routine', label: 'Routine', icon: CalendarDays },
    { id: 'lectures', label: 'Lectures', icon: FileText },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'polls', label: 'Polls', icon: Vote },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
  ];

  const updateScrollIndicators = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollIndicators();

    el.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', updateScrollIndicators);

    const ro = new ResizeObserver(() => {
      updateScrollIndicators();
    });
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', updateScrollIndicators);
      ro.disconnect();
    };
  }, []);

  // Center active tab when switched
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      const leftPos = activeBtn.offsetLeft - (el.clientWidth / 2) + (activeBtn.clientWidth / 2);
      el.scrollTo({ left: Math.max(0, leftPos), behavior: 'smooth' });
    }
    const timer = setTimeout(updateScrollIndicators, 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const scrollByOffset = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleNavClick = (id: string) => {
    if (id === 'contact') {
      setActiveTab('contact');
      setTimeout(() => {
        document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (id === 'gallery') setActiveAlbumId(null);
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <>
      {/* Top Navbar (Desktop + Mobile Brand Bar) with Deep Green Glass Texture - Ultra-Compact Streamlined Layout */}
      <header className="bg-white/85 dark:bg-[#04130d]/80 backdrop-blur-xl text-slate-800 dark:text-slate-200 fixed top-0 left-0 right-0 w-full z-50 shadow-[0_2px_15px_rgba(4,40,24,0.06)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.06)] border-b border-emerald-900/10 dark:border-emerald-500/15 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-13">
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center gap-2 cursor-pointer group shrink-0" 
              onClick={() => handleNavClick('home')}
            >
              <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 p-1 rounded-lg group-hover:bg-emerald-500/25 group-hover:scale-105 transition-all shadow-xs ring-1 ring-emerald-500/25 shrink-0">
                <Stethoscope size={18} strokeWidth={2.5} />
              </div>
              <div className="shrink-0 leading-none">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm sm:text-base text-emerald-950 dark:text-white tracking-tight whitespace-nowrap">Tejashwi 23</h1>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">EWMC</span>
                </div>
                <p className="text-[9px] text-emerald-700 dark:text-emerald-400/80 font-medium tracking-wider uppercase whitespace-nowrap mt-0.5 sm:hidden">East West Medical College</p>
              </div>
            </div>

            {/* Desktop Navigation Links + Notification Bell + Theme Toggler */}
            <div className="hidden lg:flex items-center gap-1.5">
              <nav className="flex items-center bg-slate-100/60 dark:bg-black/20 p-1 rounded-xl border border-emerald-900/10 dark:border-emerald-500/15">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-600 text-white dark:bg-emerald-500/25 dark:text-emerald-300 shadow-xs border border-emerald-700 dark:border-emerald-500/40' 
                          : 'text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-white/60 dark:hover:bg-white/10'
                      }`}
                    >
                      <Icon size={13} className={isActive ? "text-white dark:text-emerald-400" : "text-emerald-700/80 dark:text-slate-400"} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="h-5 w-px bg-emerald-900/10 dark:bg-white/10 mx-0.5 shrink-0" />

              {/* Notification Bell Button */}
              <button
                type="button"
                onClick={() => setIsNotificationOpen(true)}
                title="Notifications"
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all border cursor-pointer bg-slate-100/80 dark:bg-black/20 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white border-emerald-900/10 dark:border-emerald-500/15 hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Bell size={15} />
              </button>

              <ThemeToggle compact={true} className="!w-8 !h-8 !rounded-lg" />
            </div>

            {/* Mobile & Tablet Header Active View Indicator + Notification Bell + Theme Toggle */}
            <div className="lg:hidden flex items-center gap-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-white/5 backdrop-blur-xl text-emerald-900 dark:text-emerald-400 border border-emerald-300/60 dark:border-emerald-500/30 capitalize">
                {navItems.find(i => i.id === activeTab)?.label || activeTab}
              </span>

              {/* Mobile Notification Bell */}
              <button
                type="button"
                onClick={() => setIsNotificationOpen(true)}
                title="Notifications"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all border cursor-pointer bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-emerald-900/10 dark:border-emerald-500/20 hover:bg-slate-200/60 dark:hover:bg-white/10"
              >
                <Bell size={14} />
              </button>

              <ThemeToggle compact={true} className="!w-7 !h-7 !rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Spacer matching compact height */}
      <div className="h-12 sm:h-13 w-full shrink-0" aria-hidden="true" />

      {/* Slide-over Notification Center Modal */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />

      {/* Mobile & Tablet Floating Bottom Glass Dock - Compact Ergonomic Layout with Scroll Hint & Arrows */}
      <nav 
        id="mobile-bottom-navbar"
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed z-50 left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-0.75rem)] pointer-events-auto"
        style={{
          bottom: 'max(0.5rem, env(safe-area-inset-bottom, 6px))',
        }}
      >
        <div className="relative flex items-center p-1 rounded-2xl bg-white/95 dark:bg-[#04130d]/90 backdrop-blur-xl backdrop-saturate-180 border border-emerald-900/15 dark:border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.28)] ring-1 ring-emerald-900/5 dark:ring-white/10 max-w-[95vw]">
          {/* Left Scroll Indicator Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollByOffset(-110)}
              aria-label="Scroll menu left"
              title="Scroll left"
              className="shrink-0 flex items-center justify-center w-5.5 h-7 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition-all mr-0.5 active:scale-90"
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>
          )}

          {/* Scrollable Items Container */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-0.5 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  data-tab-id={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-xl text-[9px] font-semibold transition-all shrink-0 min-w-[38px] ${
                    isActive
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500/25 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span className="text-[8.5px] leading-tight mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Indicator Arrow with subtle pulse hint */}
          {canScrollRight && (
            <button
              onClick={() => scrollByOffset(110)}
              aria-label="Scroll menu right"
              title="More tabs available - swipe or tap to scroll"
              className="shrink-0 flex items-center justify-center w-5.5 h-7 rounded-lg bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/30 transition-all ml-0.5 animate-pulse active:scale-90"
            >
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
