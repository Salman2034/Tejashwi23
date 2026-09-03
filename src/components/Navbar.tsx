import { Stethoscope, BookOpen, FileText, Bell, Menu, X, MessageCircle, CalendarDays } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Stethoscope },
    { id: 'routine', label: 'Routine', icon: CalendarDays },
    { id: 'lectures', label: 'Lectures', icon: FileText },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'contact', label: 'Contact', icon: MessageCircle },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'contact') {
      setActiveTab('contact');
      setTimeout(() => {
        document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setActiveTab(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-xl text-slate-200 sticky top-0 z-50 shadow-2xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('home')}
          >
            <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-full group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20">
              <Stethoscope size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight text-white tracking-wide">Tejashwi 23</h1>
              <p className="text-xs text-emerald-400/80 font-medium tracking-wider uppercase">East West Medical College</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-emerald-500/10 text-emerald-400 shadow-inner border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Icon size={16} className={activeTab === item.id ? "text-emerald-400" : "text-slate-500"} />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl shadow-inner border-t border-white/5">
          <div className="px-3 pt-3 pb-4 space-y-1 sm:px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { handleNavClick(item.id); setIsOpen(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                    activeTab === item.id 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} className={activeTab === item.id ? "text-emerald-400" : "text-slate-500"} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
