import { Image as ImageIcon, ArrowLeft, X, ZoomIn, Folder } from 'lucide-react';
import { galleryGroups, GalleryImage } from '../data/gallery';
import { Phase } from '../types';
import { useState } from 'react';

const PHASES: Phase[] = ['1st Phase', '2nd Phase', '3rd Phase', '4th Phase'];

export default function GalleryPage({ activeAlbumId, setActiveAlbumId }: { activeAlbumId: string | null, setActiveAlbumId: (id: string | null) => void }) {
  const [selectedPhase, setSelectedPhase] = useState<Phase>('1st Phase');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const activeGroup = galleryGroups.find(g => g.id === activeAlbumId);
  const filteredGroups = galleryGroups.filter(g => g.phase === selectedPhase);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-full max-h-full">
            <img 
              src={lightboxImage.src} 
              alt={lightboxImage.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {lightboxImage.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-center rounded-b-lg">
                <p className="text-white text-lg font-medium">{lightboxImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25 shadow-inner">
          <ImageIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{activeGroup ? activeGroup.title : 'Gallery'}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{activeGroup ? `${activeGroup.phase} • ${activeGroup.description}` : 'Memories, events, and moments of 23rd Batch'}</p>
        </div>
      </div>

      {/* Phase Selector Tabs (only shown when browsing albums) */}
      {!activeGroup && (
        <div className="flex flex-wrap gap-2 mb-8 bg-white/80 dark:bg-[#0a231b]/60 p-2 rounded-2xl border border-emerald-900/10 dark:border-white/5 backdrop-blur-sm shadow-sm">
          {PHASES.map((phase) => {
            const count = galleryGroups.filter(g => g.phase === phase).length;
            const isSelected = selectedPhase === phase;
            return (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-700 dark:border-emerald-500/30 shadow-sm'
                    : 'bg-transparent text-emerald-950/70 dark:text-slate-400 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] hover:text-emerald-950 dark:hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{phase}</span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-emerald-700/50 text-white dark:bg-emerald-500/30 dark:text-emerald-200' : 'bg-emerald-100 dark:bg-slate-800 text-emerald-900 dark:text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeGroup ? (
        <>
          <button 
            onClick={() => setActiveAlbumId(null)}
            className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors mb-6 font-semibold text-sm bg-white/80 dark:bg-[#0a231b]/60 hover:bg-emerald-100/60 dark:hover:bg-[#0e2f24] w-fit px-4 py-2 rounded-xl border border-emerald-900/10 dark:border-white/5 shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Albums
          </button>
          
          {activeGroup.images.length === 0 ? (
            <div className="text-center py-16 bg-white/80 dark:bg-[#0a231b]/60 rounded-2xl border border-emerald-900/10 dark:border-white/5 shadow-sm">
              <p className="text-slate-700 dark:text-slate-300 font-medium">Photos for this album will appear once uploaded.</p>
              <p className="text-slate-500 text-xs mt-1">Upload images to public/gallery/ to view them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGroup.images.map((img) => (
                <div 
                  key={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-950/20 border border-emerald-900/10 dark:border-white/5 shadow-lg cursor-pointer"
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl">
                      <ZoomIn size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md border border-emerald-900/10 dark:border-white/5 rounded-2xl p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 dark:border-white/5 text-emerald-700 dark:text-slate-400">
            <Folder size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200">No Albums Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-md">
            Albums and photos for {selectedPhase} will be added as we progress through academic sessions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div 
              key={group.id}
              onClick={() => setActiveAlbumId(group.id)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-950/20 border border-emerald-900/10 dark:border-white/5 shadow-lg cursor-pointer"
            >
              <img 
                src={group.coverImage} 
                alt={group.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-xl leading-tight">{group.title}</h3>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    {group.images.length} Photos
                  </span>
                </div>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{group.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
