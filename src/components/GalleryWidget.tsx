import { Image, ArrowRight } from 'lucide-react';
import { galleryGroups } from '../data/gallery';

export default function GalleryWidget({ setActiveTab, setActiveAlbumId }: { setActiveTab: (t: string) => void, setActiveAlbumId: (id: string | null) => void }) {
  return (
    <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-8 rounded-[2rem] border border-emerald-900/10 dark:border-emerald-500/20 relative overflow-hidden mt-8 lg:mt-12 shadow-[0_4px_20px_rgba(4,40,24,0.04)] dark:shadow-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg border border-emerald-500/25">
              <Image size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gallery</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Moments and memories from our journey</p>
        </div>
        
        <button 
          onClick={() => {
            setActiveAlbumId(null);
            setActiveTab('gallery');
          }}
          className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-emerald-200 transition-colors bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-300/60 dark:border-emerald-500/25 w-fit"
        >
          View all photos <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
        {galleryGroups.slice(0, 4).map((group) => (
          <div 
            key={group.id} 
            className="snap-start shrink-0 w-[280px] h-[200px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-md"
            onClick={() => {
              setActiveAlbumId(group.id);
              setActiveTab('gallery');
            }}
          >
            <img 
              src={group.coverImage} 
              alt={group.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 right-4 text-white font-medium drop-shadow-md translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex items-end justify-between">
              <div>
                <div className="font-semibold text-sm leading-tight">{group.title}</div>
                <div className="text-xs text-emerald-300 mt-0.5 font-semibold">{group.images.length} Photos</div>
              </div>
              <span className="text-[10px] uppercase font-bold bg-white/15 backdrop-blur-md px-2 py-0.5 rounded text-emerald-100 border border-white/15">
                {group.phase}
              </span>
            </div>
          </div>
        ))}
        <div 
          onClick={() => {
            setActiveAlbumId(null);
            setActiveTab('gallery');
          }}
          className="snap-start shrink-0 w-[280px] h-[200px] rounded-2xl border-2 border-dashed border-emerald-900/20 dark:border-emerald-500/20 hover:border-emerald-500/50 flex flex-col items-center justify-center text-emerald-800/70 dark:text-emerald-400/60 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-emerald-100/30 dark:hover:bg-emerald-500/10 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-[#082218] group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 transition-colors border border-emerald-300/40 dark:border-emerald-500/20">
            <ArrowRight size={24} />
          </div>
          <span className="font-semibold text-sm">See all</span>
        </div>
      </div>
    </div>
  );
}
