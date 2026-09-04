import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './components/Navbar';
import NoticeTicker from './components/NoticeTicker';
import Home from './components/Home';
import ResourceList from './components/ResourceList';
import Notices from './components/Notices';
import Routine from './components/Routine';
import CalendarPage from './components/Calendar';
import GalleryPage from './components/GalleryPage';
import ChatPage from './components/ChatPage';
import PollingPage from './components/PollingPage';
import LoadingScreen from './components/LoadingScreen';
import { resources as defaultResources, notices as defaultNotices } from './data';
import { galleryGroups as defaultGalleryGroups } from './data/gallery';
import { Notice, Resource, GalleryGroup } from './types';
import { Heart } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationToast from './components/NotificationToast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import DailyReminderModal from './components/DailyReminderModal';

export default function App() {
  const [activeTab, setActiveTabState] = useState('home');
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [chatActiveChannel, setChatActiveChannel] = useState<'batch' | 'academic' | 'casual'>('batch');
  const [noticesList, setNoticesList] = useState<Notice[]>(defaultNotices);
  const [resourcesList, setResourcesList] = useState<Resource[]>(defaultResources);
  const [galleryList, setGalleryList] = useState<GalleryGroup[]>(defaultGalleryGroups);

  // Loading States: Initial full-screen splash + tab transition loader
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const pageTransitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth Tab Switcher with micro-loading transition
  const setActiveTab = useCallback((newTab: string) => {
    if (newTab === activeTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (pageTransitionTimeoutRef.current) {
      clearTimeout(pageTransitionTimeoutRef.current);
    }

    setIsPageTransitioning(true);
    setActiveTabState(newTab);
    window.scrollTo({ top: 0, behavior: 'instant' });

    pageTransitionTimeoutRef.current = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 320);
  }, [activeTab]);

  // Complete initial loading after app mounts (Extended to 4.5s for a rich, premium loading experience)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Synchronize notices real-time with Firebase Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'notices'), orderBy('createdTimestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: Notice[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Notice, 'id'>),
            }));
            setNoticesList(fetched);
          } else {
            setNoticesList(defaultNotices);
          }
        },
        (err) => {
          console.warn('Firestore notices onSnapshot note:', err);
          setNoticesList(defaultNotices);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error initiating notices listener:', e);
    }
  }, []);

  // Synchronize gallery groups real-time with Firebase Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'galleryGroups'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: GalleryGroup[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<GalleryGroup, 'id'>),
            }));
            setGalleryList(fetched);
          } else {
            setGalleryList(defaultGalleryGroups);
          }
        },
        (err) => {
          console.warn('Firestore galleryGroups onSnapshot note:', err);
          setGalleryList(defaultGalleryGroups);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error initiating gallery listener:', e);
    }
  }, []);

  // Synchronize resources (lectures and textbooks) real-time with Firebase Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'resources'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: Resource[] = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...(docSnap.data() as Omit<Resource, 'id'>),
            }));
            setResourcesList(fetched);
          } else {
            setResourcesList(defaultResources);
          }
        },
        (err) => {
          console.warn('Firestore resources onSnapshot note:', err);
          setResourcesList(defaultResources);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error initiating resources listener:', e);
    }
  }, []);

  const lectures = resourcesList.filter(r => r.type === 'lecture');
  const books = resourcesList.filter(r => r.type === 'book');

  return (
    <ThemeProvider>
      <NotificationProvider
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chatActiveChannel={chatActiveChannel}
        setChatActiveChannel={setChatActiveChannel}
      >
        <div className="min-h-screen bg-[#f3f7f5] dark:bg-[#04130d] text-slate-800 dark:text-slate-200 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-950 dark:selection:text-emerald-200 transition-colors duration-300 relative overflow-x-clip">
          {/* Branded Launch & Page Transition Loading Screen */}
          <LoadingScreen 
            isInitialLoading={isInitialLoading} 
            activeTab={activeTab} 
            isPageTransitioning={isPageTransitioning} 
          />

          {/* Ambient deep green background aura */}
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10 -translate-y-1/2" />
          <div className="fixed bottom-1/4 right-0 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-700/10 rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/3" />

          {/* Toast Notification Alert Overlay */}
          <NotificationToast />

          {/* Native PWA Offline Indicator */}
          <OfflineIndicator />

          {/* Floating Native App Install Button */}
          <PWAInstallButton variant="floating" />

          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} setActiveAlbumId={setActiveAlbumId} />
          <NoticeTicker notices={noticesList} setActiveTab={setActiveTab} />

          {/* Random Quran & Hadith Daily Reminder Modal */}
          <DailyReminderModal isAppReady={!isInitialLoading} />

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-6 lg:pb-12">
          {(activeTab === 'home' || activeTab === 'contact') && (
            <Home 
              setActiveTab={setActiveTab} 
              setActiveAlbumId={setActiveAlbumId} 
              galleryGroups={galleryList} 
              resourcesList={resourcesList}
              noticesList={noticesList}
            />
          )}
          {activeTab === 'routine' && <Routine />}
          {activeTab === 'calendar' && <CalendarPage />}
          {activeTab === 'gallery' && (
            <GalleryPage 
              activeAlbumId={activeAlbumId} 
              setActiveAlbumId={setActiveAlbumId} 
              galleryGroupsList={galleryList}
            />
          )}
          {activeTab === 'lectures' && (
            <ResourceList
              title="Class Lectures"
              description="Download PDF slides, handwritten notes, and presentations from our classes."
              resources={lectures}
              showHierarchy={true}
              sectionType="lecture"
            />
          )}
          {activeTab === 'books' && (
            <ResourceList
              title="Medical Textbooks"
              description="Digital copies of reference books and study materials for the current academic year."
              resources={books}
              showHierarchy={false}
              sectionType="book"
            />
          )}
          {activeTab === 'notices' && (
            <Notices notices={noticesList} />
          )}
          {activeTab === 'chat' && <ChatPage />}
          {activeTab === 'polls' && <PollingPage />}
        </main>

        <footer className="relative bg-[#020d07] text-white min-h-[220px] sm:min-h-[200px] flex items-center justify-center pt-10 pb-28 lg:py-12 border-t border-emerald-500/30 mt-auto shadow-2xl overflow-hidden">
          {/* College building image background - clear and visible */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-85 transition-opacity pointer-events-none"
            style={{ backgroundImage: 'url(/Ewmch-bg.png)' }}
          />
          {/* Subtle gradient vignette to keep text easily readable while leaving the building clearly recognizable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#010905]/95 via-[#021009]/60 to-[#021009]/75 pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-sm flex flex-col items-center justify-center gap-3">
            <p className="font-bold text-white text-base md:text-lg tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              © {new Date().getFullYear()} Tejashwi 23 - East West Medical College.
            </p>
            <p className="flex items-center gap-1.5 justify-center text-emerald-100 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Made with <Heart size={16} className="text-rose-500 fill-rose-500 animate-pulse drop-shadow-sm inline" /> for the batch.
            </p>
            <p className="text-emerald-300 font-mono text-xs tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              by Salman Sami, Roll 01
            </p>
          </div>
        </footer>
      </div>
    </NotificationProvider>
  </ThemeProvider>
);
}
