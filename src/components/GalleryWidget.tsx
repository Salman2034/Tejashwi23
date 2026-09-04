import { Image, ArrowRight } from 'lucide-react';
import { galleryGroups } from '../data/gallery';

export default function GalleryWidget({ setActiveTab, setActiveAlbumId }: { setActiveTab: (t: string) => void, setActiveAlbumId: (id: string | null) => void }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm p-8 rounded-[2rem] border border-white/5 relative overflow-hidden mt-8 lg:mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-500/10 text-teal-400 p-2 rounded-lg border border-teal-500/20">
              <Image size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Gallery</h2>
          </div>
          <p className="text-slate-400 text-sm">Moments from our journey</p>
        </div>
        
        <button 
          onClick={() => {
            setActiveAlbumId(null);
            setActiveTab('gallery');
          }}
          className="flex items-center gap-2 text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/10 hover:bg-teal-500/20 px-4 py-2 rounded-xl border border-teal-500/20 w-fit"
        >
          View all photos <ArrowRight size={16} />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
        {galleryGroups.slice(0, 4).map((group) => (
          <div 
            key={group.id} 
            className="snap-start shrink-0 w-[280px] h-[200px] rounded-2xl overflow-hidden relative group cursor-pointer"
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
                <div>{group.title}</div>
                <div className="text-xs text-teal-300 mt-0.5 font-semibold">{group.images.length} Photos</div>
              </div>
              <span className="text-[10px] uppercase font-bold bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-slate-300 border border-white/10">
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
          className="snap-start shrink-0 w-[280px] h-[200px] rounded-2xl border-2 border-dashed border-slate-700 hover:border-teal-500/50 flex flex-col items-center justify-center text-slate-500 hover:text-teal-400 hover:bg-teal-500/5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-800 group-hover:bg-teal-500/20 rounded-full flex items-center justify-center mb-3 transition-colors">
            <ArrowRight size={24} />
          </div>
          <span className="font-medium">See all</span>
        </div>
      </div>
    </div>
  );
}
