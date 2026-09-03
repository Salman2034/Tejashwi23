import { Download, File, Search, Folder, ChevronRight, ArrowLeft } from 'lucide-react';
import { Resource, Phase } from '../types';
import { useState, useMemo } from 'react';

interface ResourceListProps {
  title: string;
  description: string;
  resources: Resource[];
}

const PHASES: Phase[] = ['1st Phase', '2nd Phase', '3rd Phase', '4th Phase'];

export default function ResourceList({ title, description, resources }: ResourceListProps) {
  const [search, setSearch] = useState('');
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const availableSubjects = useMemo(() => {
    if (!activePhase) return [];
    const subjects = new Set<string>();
    resources.forEach(r => {
      if (r.phase === activePhase) {
        subjects.add(r.subject);
      }
    });
    return Array.from(subjects).sort();
  }, [resources, activePhase]);

  const filteredResources = useMemo(() => {
    if (search) {
      return resources.filter(r => 
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.subject.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activePhase && activeSubject) {
      return resources.filter(r => r.phase === activePhase && r.subject === activeSubject);
    }
    return [];
  }, [resources, search, activePhase, activeSubject]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 mb-3 tracking-tight">{title}</h2>
          <p className="text-lg text-slate-400 leading-relaxed font-light">{description}</p>
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search resources globally..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-xl leading-5 bg-slate-900/50 backdrop-blur-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-slate-200 shadow-inner"
          />
        </div>
      </div>

      {!search && (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm overflow-x-auto whitespace-nowrap">
          <button 
            onClick={() => { setActivePhase(null); setActiveSubject(null); }} 
            className={`hover:text-emerald-400 transition-colors flex items-center gap-2 ${!activePhase ? 'text-emerald-300' : ''}`}
          >
            <Folder size={16} className={!activePhase ? 'fill-emerald-400/20' : ''} /> All Phases
          </button>
          {activePhase && (
            <>
              <ChevronRight size={16} className="text-slate-600 shrink-0" />
              <button 
                onClick={() => setActiveSubject(null)} 
                className={`hover:text-emerald-400 transition-colors flex items-center gap-2 ${!activeSubject ? 'text-emerald-300' : ''}`}
              >
                <Folder size={16} className={!activeSubject ? 'fill-emerald-400/20' : ''} /> {activePhase}
              </button>
            </>
          )}
          {activeSubject && (
            <>
              <ChevronRight size={16} className="text-slate-600 shrink-0" />
              <span className="text-emerald-300 flex items-center gap-2">
                <Folder size={16} className="fill-emerald-400/20" /> {activeSubject}
              </span>
            </>
          )}
        </div>
      )}

      {/* VIEW: Search Results */}
      {search && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-300">Search Results</h3>
          {filteredResources.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-md shadow-2xl border border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Search size={32} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-medium text-slate-300">No matches found</p>
              <p className="text-slate-500 mt-2 font-light">Try adjusting your search terms.</p>
            </div>
          ) : (
            <FileList resources={filteredResources} />
          )}
        </div>
      )}

      {/* VIEW: Phases Folders */}
      {!search && !activePhase && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {PHASES.map((phase) => {
            const count = resources.filter(r => r.phase === phase).length;
            return (
              <button 
                key={phase} 
                onClick={() => setActivePhase(phase)} 
                className="group bg-slate-900/40 backdrop-blur-sm p-6 rounded-3xl border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
              >
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all ring-1 ring-emerald-500/20 shadow-inner">
                  <Folder size={36} fill="currentColor" className="opacity-80" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">{phase}</h3>
                  <p className="text-sm text-slate-500 mt-1">{count} {count === 1 ? 'file' : 'files'}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* VIEW: Subject Folders */}
      {!search && activePhase && !activeSubject && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => setActivePhase(null)} 
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors px-2"
          >
            <ArrowLeft size={18} /> Back to Phases
          </button>
          
          {availableSubjects.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-md shadow-2xl border border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Folder size={32} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-medium text-slate-300">Folder is empty</p>
              <p className="text-slate-500 mt-2 font-light">No subjects found in {activePhase}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableSubjects.map((subject) => {
                const count = resources.filter(r => r.phase === activePhase && r.subject === subject).length;
                return (
                  <button 
                    key={subject} 
                    onClick={() => setActiveSubject(subject)} 
                    className="group bg-slate-900/40 backdrop-blur-sm p-6 rounded-3xl border border-white/5 hover:border-teal-500/30 hover:bg-slate-800/60 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
                  >
                    <div className="p-4 bg-teal-500/10 text-teal-400 rounded-2xl group-hover:scale-110 group-hover:bg-teal-500/20 transition-all ring-1 ring-teal-500/20 shadow-inner">
                      <Folder size={36} fill="currentColor" className="opacity-80" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-200 group-hover:text-teal-300 transition-colors">{subject}</h3>
                      <p className="text-sm text-slate-500 mt-1">{count} {count === 1 ? 'file' : 'files'}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Files in Subject */}
      {!search && activePhase && activeSubject && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 px-2">
            <button 
              onClick={() => setActiveSubject(null)} 
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Subjects
            </button>
          </div>
          
          {filteredResources.length === 0 ? (
            <div className="bg-slate-900/40 backdrop-blur-md shadow-2xl border border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <File size={32} className="text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-medium text-slate-300">No files found</p>
              <p className="text-slate-500 mt-2 font-light">This folder is currently empty.</p>
            </div>
          ) : (
            <FileList resources={filteredResources} showPath={false} />
          )}
        </div>
      )}
    </div>
  );
}

// Helper component to render the list of files to avoid duplication
function FileList({ resources, showPath = true }: { resources: Resource[], showPath?: boolean }) {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md shadow-2xl border border-white/5 rounded-[2rem] overflow-hidden">
      <ul className="divide-y divide-white/5">
        {resources.map((resource) => (
          <li key={resource.id} className="p-5 md:p-6 hover:bg-slate-800/40 transition-colors flex items-start gap-4 md:gap-6 group">
            <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl shrink-0 mt-1 border border-emerald-500/20 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all shadow-inner">
              <File size={28} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-slate-200 truncate mb-1 group-hover:text-emerald-300 transition-colors">{resource.title}</h4>
              <p className="text-base text-slate-400 line-clamp-2 leading-relaxed font-light">{resource.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-slate-500">
                {showPath && (
                  <span className="flex items-center gap-1.5 text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Folder size={12} /> {resource.phase} / {resource.subject}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                  {new Date(resource.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
                {resource.fileSize && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                    {resource.fileSize}
                  </span>
                )}
              </div>
            </div>
            <a
              href={resource.fileUrl}
              className="inline-flex items-center justify-center p-3.5 md:px-5 md:py-2.5 rounded-xl text-emerald-400 font-semibold hover:text-emerald-300 bg-emerald-500/5 hover:bg-emerald-500/10 focus:outline-none transition-all border border-emerald-500/20 hover:border-emerald-500/40 shrink-0 mt-2 md:mt-1 gap-2 shadow-sm"
              title="Download PDF"
            >
              <Download size={20} />
              <span className="hidden md:inline">Download</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
