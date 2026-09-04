import { useState } from 'react';
import Navbar from './components/Navbar';
import NoticeTicker from './components/NoticeTicker';
import Home from './components/Home';
import ResourceList from './components/ResourceList';
import Notices from './components/Notices';
import Routine from './components/Routine';
import CalendarPage from './components/Calendar';
import GalleryPage from './components/GalleryPage';
import { resources, notices } from './data';
import { Heart } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);

  const lectures = resources.filter(r => r.type === 'lecture');
  const books = resources.filter(r => r.type === 'book');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#f3f7f5] dark:bg-[#04130d] text-slate-800 dark:text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-950 dark:selection:text-emerald-200 transition-colors duration-300 relative overflow-x-clip">
        {/* Ambient deep green background aura */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10 -translate-y-1/2" />
        <div className="fixed bottom-1/4 right-0 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-700/10 rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/3" />

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setActiveAlbumId={setActiveAlbumId} />
        <NoticeTicker notices={notices} setActiveTab={setActiveTab} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-6 lg:pb-12">
          {(activeTab === 'home' || activeTab === 'contact') && <Home setActiveTab={setActiveTab} setActiveAlbumId={setActiveAlbumId} />}
          {activeTab === 'routine' && <Routine />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'gallery' && <GalleryPage activeAlbumId={activeAlbumId} setActiveAlbumId={setActiveAlbumId} />}
          {activeTab === 'lectures' && (
            <ResourceList
              title="Class Lectures"
              description="Download PDF slides, handwritten notes, and presentations from our classes."
              resources={lectures}
              showHierarchy={true}
            />
          )}
          {activeTab === 'books' && (
            <ResourceList
              title="Medical Textbooks"
              description="Digital copies of reference books and study materials for the current academic year."
              resources={books}
              showHierarchy={false}
            />
          )}
          {activeTab === 'notices' && (
            <Notices notices={notices} />
          )}
        </main>

        <footer className="relative bg-[#03110b] text-emerald-200/70 pt-10 pb-28 lg:py-10 border-t border-emerald-500/20 mt-auto shadow-2xl transition-colors overflow-hidden">
          {/* College building image background */}
          <img 
            src="/Ewmch-bg.png" 
            alt="East West Medical College" 
            className="absolute inset-0 w-full h-full object-cover object-bottom opacity-25 dark:opacity-30 pointer-events-none select-none -z-10" 
          />
          {/* Subtle gradient overlay to guarantee contrast and deep emerald aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020b07]/95 via-[#03110b]/85 to-[#041910]/80 pointer-events-none -z-10" />

          <div className="relative max-w-7xl mx-auto px-4 text-center text-sm flex flex-col items-center justify-center gap-3 z-10">
            <p className="font-semibold text-emerald-100 text-base drop-shadow-sm">
              © {new Date().getFullYear()} Tejashwi 23 - East West Medical College.
            </p>
            <p className="flex items-center gap-1.5 justify-center text-emerald-300/90 font-medium">
              Made with <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse" /> for the batch.
            </p>
            <p className="text-emerald-400/70 mt-[-2px] text-xs font-mono tracking-wider">
              by Salman Sami, Roll 01
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
