import { useState, useEffect, ElementType } from 'react';
import { Stethoscope, BookOpen, FileText, Bell, MessageCircle, MessageSquare, CalendarDays, Image as ImageIcon, Vote, Activity } from 'lucide-react';

interface LoadingScreenProps {
  isInitialLoading: boolean;
  activeTab: string;
  isPageTransitioning: boolean;
}

const TAB_METADATA: Record<string, { label: string; icon: ElementType; subtitle: string }> = {
  home: { label: 'Home Hub', icon: Stethoscope, subtitle: 'Loading batch overview & quick access...' },
  routine: { label: 'Class Routine', icon: CalendarDays, subtitle: 'Loading weekly academic schedule...' },
  lectures: { label: 'Lecture Archive', icon: FileText, subtitle: 'Fetching slides, PDF notes & handouts...' },
  books: { label: 'Medical Textbooks', icon: BookOpen, subtitle: 'Loading clinical library & references...' },
  notices: { label: 'Notice Board', icon: Bell, subtitle: 'Checking batch announcements & alerts...' },
  calendar: { label: 'Academic Calendar', icon: CalendarDays, subtitle: 'Loading exam dates & terms...' },
  gallery: { label: 'Memories Gallery', icon: ImageIcon, subtitle: 'Loading photo collections & albums...' },
  chat: { label: 'Batch Lounge', icon: MessageSquare, subtitle: 'Connecting to live cadet discussion...' },
  polls: { label: 'Batch Polls', icon: Vote, subtitle: 'Synchronizing ballots & survey results...' },
  contact: { label: 'Directory', icon: MessageCircle, subtitle: 'Loading executive committee & contacts...' },
};

export default function LoadingScreen({ 
  isInitialLoading, 
  activeTab, 
  isPageTransitioning 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [statusMessage, setStatusMessage] = useState('Initializing Medical Portal...');
  const [initialFadeOut, setInitialFadeOut] = useState(false);
  const [shouldRenderInitial, setShouldRenderInitial] = useState(true);

  // Initial Full Screen Splash Progress Simulation
  useEffect(() => {
    if (!isInitialLoading) {
      setProgress(100);
      setStatusMessage('Portal Ready');
      const timer = setTimeout(() => {
        setInitialFadeOut(true);
        setTimeout(() => setShouldRenderInitial(false), 600);
      }, 300);
      return () => clearTimeout(timer);
    }

    const t1 = setTimeout(() => {
      setProgress(25);
      setStatusMessage('Initializing Medical Portal...');
    }, 600);

    const t2 = setTimeout(() => {
      setProgress(55);
      setStatusMessage('Loading Academic Archives & Notes...');
    }, 1600);

    const t3 = setTimeout(() => {
      setProgress(80);
      setStatusMessage('Connecting Firestore Cloud Sync...');
    }, 2800);

    const t4 = setTimeout(() => {
      setProgress(98);
      setStatusMessage('Preparing Tejashwi-23 Experience...');
    }, 3900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isInitialLoading]);

  const currentTabMeta = TAB_METADATA[activeTab] || { 
    label: activeTab, 
    icon: Stethoscope, 
    subtitle: 'Loading page content...' 
  };
  const TabIcon = currentTabMeta.icon;

  return (
    <>
      {/* 1. TOP VIEWPORT GLOWING PROGRESS BAR FOR PAGE SWITCHES */}
      <div 
        id="top-viewport-loader"
        className={`fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none transition-opacity duration-300 ${
          isPageTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full h-full bg-slate-900/10 dark:bg-black/20 backdrop-blur-xs relative overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-300 ease-out ${
              isPageTransitioning ? 'w-full animate-shimmer-sweep' : 'w-0'
            }`} 
          />
        </div>
      </div>

      {/* 2. SUBTLE ELEGANT GLASS PAGE TRANSITION INDICATOR */}
      {isPageTransitioning && !shouldRenderInitial && (
        <div 
          id="page-transition-pill"
          className="fixed bottom-20 lg:bottom-6 right-6 z-[90] pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-emerald-950/85 dark:bg-[#031c12]/90 backdrop-blur-xl text-white shadow-xl shadow-emerald-950/30 border border-emerald-500/30 ring-1 ring-emerald-400/20">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 animate-spin">
              <TabIcon size={13} />
            </div>
            <div className="flex flex-col pr-1">
              <span className="text-[11px] font-bold text-white leading-tight tracking-wide flex items-center gap-1.5">
                {currentTabMeta.label}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. INITIAL BRANDED SPLASH & OPENING LOADING SCREEN */}
      {shouldRenderInitial && (
        <div 
          id="initial-app-loader"
          className={`fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#f3f7f5] dark:bg-[#03130d] transition-all duration-700 ease-out px-4 ${
            initialFadeOut 
              ? 'opacity-0 scale-105 pointer-events-none blur-xs' 
              : 'opacity-100 scale-100 pointer-events-auto'
          }`}
        >
          {/* Ambient Deep Emerald Medical Halo */}
          <div className="absolute w-[500px] h-[500px] bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse-ring" />
          <div className="absolute w-[350px] h-[350px] bg-teal-500/10 dark:bg-teal-600/15 rounded-full blur-[90px] pointer-events-none -translate-y-8" />

          {/* Foreground Content Card */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
            
            {/* Logo Emblem Container with Radial Breathing Ring */}
            <div className="relative mb-6">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-400/20 to-emerald-600/30 blur-md animate-pulse" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-3 bg-white/95 dark:bg-[#072419]/90 backdrop-blur-2xl border border-emerald-500/30 shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-900/40 flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Tejashwi 23 Logo" 
                  className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback');
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="logo-fallback hidden w-full h-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Stethoscope size={48} className="animate-pulse" />
                </div>
              </div>

              {/* Heartbeat pulse badge */}
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-emerald-600 text-white shadow-md border-2 border-white dark:border-[#03130d] animate-bounce">
                <Activity size={14} />
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-1 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-1">
                <span>Batch 23 Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                TEJASHWI <span className="text-emerald-600 dark:text-emerald-400">23</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-emerald-200/70">
                East West Medical College & Hospital
              </p>
            </div>

            {/* ECG Wave Graphic Monitor */}
            <div className="w-full max-w-[260px] h-10 mb-4 px-2 flex items-center justify-center bg-white/40 dark:bg-black/20 rounded-xl border border-emerald-900/10 dark:border-emerald-500/20 backdrop-blur-xs overflow-hidden">
              <svg className="w-full h-8" viewBox="0 0 300 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 0 20 L 40 20 L 55 20 L 65 8 L 75 32 L 85 12 L 95 24 L 105 20 L 140 20 L 155 20 L 165 4 L 178 36 L 188 10 L 198 26 L 208 20 L 300 20" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-emerald-500 dark:text-emerald-400 animate-ecg"
                />
              </svg>
            </div>

            {/* Progress Bar and Dynamic Label */}
            <div className="w-full max-w-[260px] space-y-2">
              <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden p-0.5 border border-emerald-900/10 dark:border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-0.5">
                <span className="truncate">{statusMessage}</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 ml-2">{progress}%</span>
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="absolute bottom-6 text-center">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Care • Knowledge • Integrity
            </span>
          </div>
        </div>
      )}
    </>
  );
}
