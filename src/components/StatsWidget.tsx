import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Users, Eye, Image as ImageIcon, Bell, ArrowUpRight, Activity } from 'lucide-react';
import { resources, notices } from '../data';
import { galleryGroups } from '../data/gallery';

interface StatsData {
  totalLectures: number;
  totalBooks: number;
  totalGalleryPhotos: number;
  totalNotices: number;
  totalVisits: number | null;
  todayVisits: number | null;
  isLoadingVisitors: boolean;
}

export default function StatsWidget({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState<StatsData>(() => {
    // 1. Calculate static resources metrics directly from data models
    const totalLectures = resources.filter(r => r.type === 'lecture').length;
    const totalBooks = resources.filter(r => r.type === 'book').length;
    const totalGalleryPhotos = galleryGroups.reduce((acc, g) => acc + g.images.length, 0);
    const totalNotices = notices.length;

    return {
      totalLectures,
      totalBooks,
      totalGalleryPhotos,
      totalNotices,
      totalVisits: null,
      todayVisits: null,
      isLoadingVisitors: true,
    };
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchVisitorCounts() {
      // Get formatted current date (YYYY-MM-DD) for daily tracking
      const today = new Date().toISOString().split('T')[0];
      const sessionKey = 'smc23_session_counted_' + today;
      const hasCountedInSession = sessionStorage.getItem(sessionKey);

      // Primary Namespace for 23rd Batch EWMC Portal
      const namespace = 'ewmc-tejashwi23-portal';
      const totalKey = 'total-visits';
      const todayKey = `daily-${today}`;

      // Choose whether to hit (+1) or just get depending on session
      // If user is opening the app in a new session today, increment the counter.
      // Otherwise, only get the current value so refreshes in the same session don't falsely inflate numbers.
      const action = hasCountedInSession ? 'get' : 'hit';

      try {
        // Try Abacus Counter API with fallback to CountAPI
        const fetchCounter = async (key: string) => {
          try {
            const res = await fetch(`https://abacus.jasoncameron.dev/${action}/${namespace}/${key}`, {
              headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
              const data = await res.json();
              if (typeof data.value === 'number') return data.value;
            }
          } catch (e) {
            // fallback attempt with alternative public counter
          }

          // Fallback to CountAPI
          try {
            const fallbackAction = action === 'hit' ? 'hit' : 'get';
            const res = await fetch(`https://countapi.mileshilliard.com/api/v1/${fallbackAction}/${namespace}-${key}`);
            if (res.ok) {
              const data = await res.json();
              if (typeof data.value === 'number') return data.value;
            }
          } catch (e) {
            // silent fail
          }

          return null;
        };

        const [totalVal, todayVal] = await Promise.all([
          fetchCounter(totalKey),
          fetchCounter(todayKey),
        ]);

        if (isMounted) {
          if (!hasCountedInSession && (totalVal !== null || todayVal !== null)) {
            sessionStorage.setItem(sessionKey, 'true');
          }

          setStats(prev => ({
            ...prev,
            totalVisits: totalVal ?? 1,
            todayVisits: todayVal ?? 1,
            isLoadingVisitors: false,
          }));
        }
      } catch (err) {
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            totalVisits: prev.totalVisits ?? 1,
            todayVisits: prev.todayVisits ?? 1,
            isLoadingVisitors: false,
          }));
        }
      }
    }

    fetchVisitorCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="portal-live-stats" className="bg-white/70 dark:bg-[#0a231b]/50 backdrop-blur-md rounded-2xl border border-emerald-900/10 dark:border-emerald-500/15 p-2.5 sm:px-5 sm:py-2.5 shadow-sm max-w-5xl mx-auto w-full">
      {/* Container: 2-column grid on mobile (3 rows = 6 items total), flex centered on desktop */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-xs">
        
        {/* Title / Indicator badge (Centered) */}
        <div className="flex items-center justify-center gap-2 shrink-0 pb-1.5 md:pb-0 md:pr-4 border-b md:border-b-0 md:border-r border-emerald-900/10 dark:border-emerald-500/15 w-full md:w-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight text-xs sm:text-sm">
            Portal Stats
          </span>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300/40 dark:border-emerald-500/20 ml-1">
            <Activity size={10} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {/* 6 Stats Items: 2 columns borderless on phone (3 rows each = 6 total), flex items middle-aligned on PC */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-5 w-full md:w-auto">
          {/* 1. Lectures */}
          <button 
            type="button"
            onClick={() => setActiveTab('lectures')}
            className="flex items-center justify-start md:justify-center gap-1.5 group cursor-pointer hover:opacity-80 py-0.5 px-1 md:p-1 transition-all"
            title="View Lectures"
          >
            <div className="p-1.5 bg-emerald-100/80 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 rounded-lg shrink-0">
              <FileText size={14} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">{stats.totalLectures}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Lectures</span>
            </div>
          </button>

          {/* 2. Textbooks */}
          <button 
            type="button"
            onClick={() => setActiveTab('books')}
            className="flex items-center justify-start md:justify-center gap-1.5 group cursor-pointer hover:opacity-80 py-0.5 px-1 md:p-1 transition-all"
            title="View Textbooks"
          >
            <div className="p-1.5 bg-teal-100/80 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 rounded-lg shrink-0">
              <BookOpen size={14} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">{stats.totalBooks}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Books</span>
            </div>
          </button>

          {/* 3. Photos */}
          <button 
            type="button"
            onClick={() => setActiveTab('gallery')}
            className="flex items-center justify-start md:justify-center gap-1.5 group cursor-pointer hover:opacity-80 py-0.5 px-1 md:p-1 transition-all"
            title="View Gallery"
          >
            <div className="p-1.5 bg-amber-100/80 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-lg shrink-0">
              <ImageIcon size={14} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">{stats.totalGalleryPhotos}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Photos</span>
            </div>
          </button>

          {/* 4. Notices */}
          <button 
            type="button"
            onClick={() => setActiveTab('notices')}
            className="flex items-center justify-start md:justify-center gap-1.5 group cursor-pointer hover:opacity-80 py-0.5 px-1 md:p-1 transition-all"
            title="View Notices"
          >
            <div className="p-1.5 bg-rose-100/80 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 rounded-lg shrink-0">
              <Bell size={14} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">{stats.totalNotices}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Notices</span>
            </div>
          </button>

          {/* 5. Visits Today */}
          <div className="flex items-center justify-start md:justify-center gap-1.5 py-0.5 px-1 md:p-1">
            <div className="p-1.5 bg-sky-100/80 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 rounded-lg shrink-0">
              <Eye size={14} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">
                {stats.isLoadingVisitors ? '...' : (stats.todayVisits?.toLocaleString() ?? '--')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Today</span>
            </div>
          </div>

          {/* 6. Total Visits */}
          <div className="flex items-center justify-start md:justify-center gap-1.5 py-0.5 px-1 md:p-1">
            <div className="p-1.5 bg-indigo-100/80 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 rounded-lg shrink-0">
              <Users size={14} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">
                {stats.isLoadingVisitors ? '...' : (stats.totalVisits?.toLocaleString() ?? '--')}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">Total</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
