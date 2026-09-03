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

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);

  const lectures = resources.filter(r => r.type === 'lecture');
  const books = resources.filter(r => r.type === 'book');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 text-slate-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setActiveAlbumId={setActiveAlbumId} />
      <NoticeTicker notices={notices} setActiveTab={setActiveTab} />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 md:pt-6 md:pb-12">
        {(activeTab === 'home' || activeTab === 'contact') && <Home setActiveTab={setActiveTab} setActiveAlbumId={setActiveAlbumId} />}
        {activeTab === 'routine' && <Routine />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'gallery' && <GalleryPage activeAlbumId={activeAlbumId} setActiveAlbumId={setActiveAlbumId} />}
        {activeTab === 'lectures' && (
          <ResourceList
            title="Class Lectures"
            description="Download PDF slides, handwritten notes, and presentations from our classes."
            resources={lectures}
          />
        )}
        {activeTab === 'books' && (
          <ResourceList
            title="Medical Textbooks"
            description="Digital copies of reference books and study materials for the current academic year."
            resources={books}
          />
        )}
        {activeTab === 'notices' && (
          <Notices notices={notices} />
        )}
      </main>

      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm flex flex-col items-center justify-center gap-3">
          <p className="font-medium text-slate-300 text-base">
            © {new Date().getFullYear()} Tejashwi 23 - East West Medical College.
          </p>
          <p className="flex items-center gap-1.5 justify-center text-slate-500">
            Made with <Heart size={16} className="text-red-500/80 fill-red-500/80 animate-pulse" /> for the batch.
          </p>
          <p className="text-slate-500 mt-[-4px]">
            by Salman Sami, Roll 01
          </p>
        </div>
      </footer>
    </div>
  );
}
