import { Download, File, Search, Folder, ChevronRight, ArrowLeft, Layers, ExternalLink } from 'lucide-react';
import { Resource, Phase, Term, Card } from '../types';
import { useState, useMemo } from 'react';

interface ResourceListProps {
  title: string;
  description: string;
  resources: Resource[];
  showHierarchy?: boolean; // true for class lectures (Term -> Card -> Files)
}

const PHASES: Phase[] = ['1st Phase', '2nd Phase', '3rd Phase', '4th Phase'];

const TERMS_CONFIG: { term: Term; cards: Card[]; description: string }[] = [
  { term: '1st Term', cards: ['1st Card', '2nd Card'], description: 'Card 1 & Card 2 curriculum' },
  { term: '2nd Term', cards: ['3rd Card', '4th Card'], description: 'Card 3 & Card 4 curriculum' },
  { term: '3rd Term', cards: ['5th Card', '6th Card'], description: 'Card 5 & Card 6 curriculum' }
];

const DEFAULT_PHASE_SUBJECTS: Partial<Record<Phase, string[]>> = {
  '1st Phase': ['Anatomy', 'Physiology', 'Biochemistry']
};

export default function ResourceList({ title, description, resources, showHierarchy = true }: ResourceListProps) {
  const [search, setSearch] = useState('');
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const availableSubjects = useMemo(() => {
    if (!activePhase) return [];
    const subjects = new Set<string>(DEFAULT_PHASE_SUBJECTS[activePhase] || []);
    resources.forEach(r => {
      if (r.phase === activePhase) {
        subjects.add(r.subject);
      }
    });
    return Array.from(subjects);
  }, [resources, activePhase]);

  // Current cards available under the active term
  const currentTermConfig = useMemo(() => {
    if (!activeTerm) return null;
    return TERMS_CONFIG.find(t => t.term === activeTerm);
  }, [activeTerm]);

  // Subject-level resources (like curriculum PDFs) that do not belong to any specific term
  const subjectLevelResources = useMemo(() => {
    if (!activePhase || !activeSubject) return [];
    return resources.filter(r => 
      r.phase === activePhase && 
      r.subject === activeSubject && 
      !r.term
    );
  }, [resources, activePhase, activeSubject]);

  const filteredResources = useMemo(() => {
    if (search) {
      return resources.filter(r => 
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.subject.toLowerCase().includes(search.toLowerCase()) ||
        (r.term && r.term.toLowerCase().includes(search.toLowerCase())) ||
        (r.card && r.card.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (!showHierarchy) {
      if (activePhase && activeSubject) {
        return resources.filter(r => r.phase === activePhase && r.subject === activeSubject);
      }
      return [];
    }

    // With Hierarchy: Phase -> Subject -> Term -> Card -> Files
    if (activePhase && activeSubject && activeTerm && activeCard) {
      return resources.filter(r => 
        r.phase === activePhase && 
        r.subject === activeSubject && 
        r.term === activeTerm && 
        r.card === activeCard
      );
    }

    return [];
  }, [resources, search, showHierarchy, activePhase, activeSubject, activeTerm, activeCard]);

  const resetToPhases = () => {
    setActivePhase(null);
    setActiveSubject(null);
    setActiveTerm(null);
    setActiveCard(null);
  };

  const resetToSubjects = () => {
    setActiveSubject(null);
    setActiveTerm(null);
    setActiveCard(null);
  };

  const resetToTerms = () => {
    setActiveTerm(null);
    setActiveCard(null);
  };

  const resetToCards = () => {
    setActiveCard(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3 tracking-tight">{title}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">{description}</p>
        </div>
        <div className="relative w-full md:w-80 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search lectures, topics, or terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 border border-emerald-900/15 dark:border-white/10 rounded-xl leading-5 bg-white/90 dark:bg-slate-900/50 backdrop-blur-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-slate-900 dark:text-slate-200 shadow-sm"
          />
        </div>
      </div>

      {/* Interactive Breadcrumb Bar */}
      {!search && (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-[#0a231b]/60 p-4 rounded-2xl border border-emerald-900/10 dark:border-white/5 backdrop-blur-sm overflow-x-auto whitespace-nowrap shadow-sm">
          <button 
            onClick={resetToPhases} 
            className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 ${!activePhase ? 'text-emerald-800 dark:text-emerald-300 font-bold' : ''}`}
          >
            <Folder size={16} className={!activePhase ? 'fill-emerald-400/20 text-emerald-600' : ''} /> All Phases
          </button>
          
          {activePhase && (
            <>
              <ChevronRight size={16} className="text-emerald-800/40 dark:text-slate-600 shrink-0" />
              <button 
                onClick={resetToSubjects} 
                className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 ${!activeSubject ? 'text-emerald-800 dark:text-emerald-300 font-bold' : ''}`}
              >
                <Folder size={16} className={!activeSubject ? 'fill-emerald-400/20 text-emerald-600' : ''} /> {activePhase}
              </button>
            </>
          )}

          {activeSubject && (
            <>
              <ChevronRight size={16} className="text-emerald-800/40 dark:text-slate-600 shrink-0" />
              <button 
                onClick={resetToTerms} 
                className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 ${!activeTerm && showHierarchy ? 'text-emerald-800 dark:text-emerald-300 font-bold' : !showHierarchy ? 'text-emerald-800 dark:text-emerald-300 font-bold' : ''}`}
              >
                <Folder size={16} className={!activeTerm ? 'fill-emerald-400/20 text-emerald-600' : ''} /> {activeSubject}
              </button>
            </>
          )}

          {showHierarchy && activeTerm && (
            <>
              <ChevronRight size={16} className="text-emerald-800/40 dark:text-slate-600 shrink-0" />
              <button 
                onClick={resetToCards} 
                className={`hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2 ${!activeCard ? 'text-emerald-800 dark:text-emerald-300 font-bold' : ''}`}
              >
                <Folder size={16} className={!activeCard ? 'fill-emerald-400/20 text-emerald-600' : ''} /> {activeTerm}
              </button>
            </>
          )}

          {showHierarchy && activeCard && (
            <>
              <ChevronRight size={16} className="text-emerald-800/40 dark:text-slate-600 shrink-0" />
              <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                <Folder size={16} className="fill-emerald-400/20 text-emerald-600" /> {activeCard}
              </span>
            </>
          )}
        </div>
      )}

      {/* VIEW: Search Results */}
      {search && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-300">Search Results</h3>
          {filteredResources.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-white/5">
                <Search size={32} className="text-emerald-700/60 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-300">No matches found</p>
              <p className="text-slate-600 dark:text-slate-500 mt-2 font-light">Try adjusting your search terms.</p>
            </div>
          ) : (
            <FileList resources={filteredResources} />
          )}
        </div>
      )}

      {/* LEVEL 1: Phases Folders */}
      {!search && !activePhase && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {PHASES.map((phase) => {
            const count = resources.filter(r => r.phase === phase).length;
            return (
              <button 
                key={phase} 
                onClick={() => setActivePhase(phase)} 
                className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-6 rounded-3xl border border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50/80 dark:hover:bg-[#0b281f]/70 shadow-sm hover:shadow-[0_4px_20px_rgba(5,150,105,0.15)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
              >
                <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all ring-1 ring-emerald-300/60 dark:ring-emerald-500/20 shadow-inner">
                  <Folder size={36} fill="currentColor" className="opacity-80" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{phase}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">{count} {count === 1 ? 'file' : 'files'}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Subject Folders */}
      {!search && activePhase && !activeSubject && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={resetToPhases} 
            className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 mb-6 transition-colors px-2 font-medium"
          >
            <ArrowLeft size={18} /> Back to Phases
          </button>
          
          {availableSubjects.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-white/5">
                <Folder size={32} className="text-emerald-700/60 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-300">Phase folder is empty</p>
              <p className="text-slate-600 dark:text-slate-500 mt-2 font-light">Subject curriculum, folders, and resources for {activePhase} will be added in upcoming academic sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableSubjects.map((subject) => {
                const count = resources.filter(r => r.phase === activePhase && r.subject === subject).length;
                return (
                  <button 
                    key={subject} 
                    onClick={() => setActiveSubject(subject)} 
                    className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-6 rounded-3xl border border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50/80 dark:hover:bg-[#0b281f]/70 shadow-sm hover:shadow-[0_4px_20px_rgba(5,150,105,0.15)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
                  >
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all ring-1 ring-emerald-300/60 dark:ring-emerald-500/20 shadow-inner">
                      <Folder size={36} fill="currentColor" className="opacity-80" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{subject}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">{count} {count === 1 ? 'file' : 'files'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LEVEL 3: Term Folders for Class Lectures */}
      {!search && activePhase && activeSubject && showHierarchy && !activeTerm && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={resetToSubjects} 
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back to Subjects
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/25">
              {activeSubject}
            </span>
          </div>

          {/* Subject-level curriculum or syllabus resources */}
          {subjectLevelResources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2 text-slate-800 dark:text-slate-300 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>General & Curriculum Resources</span>
              </div>
              <FileList resources={subjectLevelResources} showPath={false} />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 px-2 mb-4 text-slate-800 dark:text-slate-300 font-bold text-sm">
              <Folder size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Term Folders</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TERMS_CONFIG.map(({ term, cards, description: termDesc }) => {
                const termFileCount = resources.filter(r => 
                  r.phase === activePhase && 
                  r.subject === activeSubject && 
                  r.term === term
                ).length;

                return (
                  <button
                    key={term}
                    onClick={() => setActiveTerm(term)}
                    className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-6 rounded-3xl border border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50/80 dark:hover:bg-[#0b281f]/70 shadow-sm hover:shadow-[0_4px_20px_rgba(5,150,105,0.15)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
                  >
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all ring-1 ring-emerald-300/60 dark:ring-emerald-500/20 shadow-inner">
                      <Folder size={36} fill="currentColor" className="opacity-80" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{term}</h3>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1 font-semibold">{cards.join(' & ')}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{termDesc}</p>
                      <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-white/5 w-full flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>{termFileCount} {termFileCount === 1 ? 'Lecture' : 'Lectures'}</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 4: Card Folders */}
      {!search && activePhase && activeSubject && showHierarchy && activeTerm && !activeCard && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 px-2">
            <button 
              onClick={resetToTerms} 
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back to Terms
            </button>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/25">
              {activeSubject} • {activeTerm}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {currentTermConfig?.cards.map((card) => {
              const cardFileCount = resources.filter(r => 
                r.phase === activePhase && 
                r.subject === activeSubject && 
                r.term === activeTerm && 
                r.card === card
              ).length;

              return (
                <button
                  key={card}
                  onClick={() => setActiveCard(card)}
                  className="group bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-6 rounded-3xl border border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50/80 dark:hover:bg-[#0b281f]/70 shadow-sm hover:shadow-[0_4px_20px_rgba(5,150,105,0.15)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
                >
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all ring-1 ring-emerald-300/60 dark:ring-emerald-500/20 shadow-inner">
                    <Layers size={36} className="opacity-90" strokeWidth={1.5} />
                  </div>
                  <div className="w-full">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{card}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{activeSubject} Curriculum</p>
                    <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-white/5 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>{cardFileCount} {cardFileCount === 1 ? 'Lecture' : 'Lectures'}</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 5: Lecture Files (Inside Card) or Plain Subject Files */}
      {!search && activePhase && activeSubject && (
        (!showHierarchy) || (showHierarchy && activeTerm && activeCard)
      ) && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 px-2">
            <button 
              onClick={showHierarchy ? resetToCards : resetToSubjects} 
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> {showHierarchy ? 'Back to Cards' : 'Back to Subjects'}
            </button>
            {showHierarchy && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/25">
                {activeSubject} • {activeTerm} • {activeCard}
              </span>
            )}
          </div>
          
          {filteredResources.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-white/5">
                <File size={32} className="text-emerald-700/60 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-300">No files uploaded yet</p>
              <p className="text-slate-600 dark:text-slate-500 mt-2 font-light">
                {showHierarchy 
                  ? `Lectures for ${activeSubject} • ${activeTerm} (${activeCard}) will be uploaded here.`
                  : `Textbooks for ${activeSubject} will be added here.`
                }
              </p>
            </div>
          ) : (
            <FileList resources={filteredResources} showPath={false} />
          )}
        </div>
      )}
    </div>
  );
}

// Helper component to render the list of files
function FileList({ resources, showPath = true }: { resources: Resource[], showPath?: boolean }) {
  return (
    <div className="bg-white/90 dark:bg-[#0a231b]/70 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] overflow-hidden">
      <ul className="divide-y divide-emerald-900/10 dark:divide-white/5">
        {resources.map((resource) => (
          <li key={resource.id} className="p-5 md:p-6 hover:bg-emerald-50/60 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-4 md:gap-6 group">
            <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl shrink-0 mt-1 border border-emerald-300/60 dark:border-emerald-500/20 group-hover:scale-105 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all shadow-inner">
              <File size={28} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-200 truncate mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">{resource.title}</h4>
              <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-light">{resource.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                {showPath ? (
                  <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
                    <Folder size={12} /> {resource.phase} / {resource.subject} {resource.term ? ` / ${resource.term}` : ''} {resource.card ? ` / ${resource.card}` : ''}
                  </span>
                ) : (
                  resource.card && (
                    <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
                      {resource.card}
                    </span>
                  )
                )}
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {new Date(resource.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                </span>
                {resource.fileSize && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                    {resource.fileSize}
                  </span>
                )}
              </div>
            </div>
            <a
              href={resource.fileUrl}
              target={resource.fileUrl.startsWith('http') ? '_blank' : undefined}
              rel={resource.fileUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center p-3.5 md:px-5 md:py-2.5 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold hover:text-emerald-950 dark:hover:text-emerald-200 bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 focus:outline-none transition-all border border-emerald-300/70 dark:border-emerald-500/30 shrink-0 mt-2 md:mt-1 gap-2 shadow-xs"
              title={resource.fileUrl.startsWith('http') ? 'Open resource link' : 'Download file'}
            >
              {resource.fileUrl.startsWith('http') ? (
                <>
                  <ExternalLink size={18} />
                  <span className="hidden md:inline">Open</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span className="hidden md:inline">Download</span>
                </>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
