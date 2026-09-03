import { Image as ImageIcon, ArrowLeft, X, ZoomIn } from 'lucide-react';
import { galleryGroups, GalleryImage } from '../data/gallery';
import { useState } from 'react';

export default function GalleryPage({ activeAlbumId, setActiveAlbumId }: { activeAlbumId: string | null, setActiveAlbumId: (id: string | null) => void }) {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const activeGroup = galleryGroups.find(g => g.id === activeAlbumId);

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
        <div className="bg-teal-500/10 text-teal-400 p-2.5 rounded-xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          <ImageIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{activeGroup ? activeGroup.title : 'Gallery'}</h1>
          <p className="text-slate-400 mt-1">{activeGroup ? activeGroup.description : 'Memories, events, and moments of 23rd Batch'}</p>
        </div>
      </div>

      {activeGroup ? (
        <>
          <button 
            onClick={() => setActiveAlbumId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors mb-6 font-medium text-sm bg-slate-900/50 hover:bg-teal-500/10 w-fit px-4 py-2 rounded-xl border border-white/5 hover:border-teal-500/20"
          >
            <ArrowLeft size={16} /> Back to Albums
          </button>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGroup.images.map((img) => (
              <div 
                key={img.id}
                onClick={() => setLightboxImage(img)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-white/5 shadow-lg cursor-pointer"
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
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryGroups.map((group) => (
            <div 
              key={group.id}
              onClick={() => setActiveAlbumId(group.id)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-white/5 shadow-lg cursor-pointer"
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
                  <span className="text-xs font-bold bg-teal-500/20 text-teal-300 px-2.5 py-1 rounded-md border border-teal-500/30">
                    {group.images.length} Photos
                  </span>
                </div>
                <p className="text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">{group.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!activeGroup && (
        <div className="mt-12 text-center text-slate-500 text-sm bg-slate-900/50 py-6 px-6 rounded-xl border border-white/5">
          <p>More albums and photos will be added soon.</p>
        </div>
      )}
    </div>
  );
}
