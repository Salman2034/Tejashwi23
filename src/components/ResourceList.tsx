import { 
  Download, File, Search, Folder, ChevronRight, ArrowLeft, Layers, ExternalLink, 
  PlusCircle, FolderPlus, Edit3, Trash2, X, Check, Loader2, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { Resource, ResourceFolder, Phase, Term, Card, ResourceType } from '../types';
import { useState, useMemo, useEffect, FormEvent } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, doc, addDoc, setDoc, deleteDoc, getDocs, writeBatch, onSnapshot, query, orderBy, deleteField 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { resources as defaultResources } from '../data';

const ADMIN_EMAIL = 'cadetsalman2034@gmail.com';

function sanitizeForFirestore(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

interface ResourceListProps {
  title: string;
  description: string;
  resources: Resource[];
  showHierarchy?: boolean; // true for class lectures (Term -> Card -> Files)
  sectionType: 'lecture' | 'book';
}

const PHASES: Phase[] = ['1st Phase', '2nd Phase', '3rd Phase', '4th Phase'];

const TERMS_CONFIG: { term: Term; cards: Card[]; description: string }[] = [
  { term: '1st Term', cards: ['1st Card', '2nd Card'], description: 'Card 1 & Card 2 curriculum' },
  { term: '2nd Term', cards: ['3rd Card', '4th Card'], description: 'Card 3 & Card 4 curriculum' },
  { term: '3rd Term', cards: ['5th Card', '6th Card'], description: 'Card 5 & Card 6 curriculum' }
];

const ALL_TERMS: Term[] = ['1st Term', '2nd Term', '3rd Term'];
const ALL_CARDS: Card[] = ['1st Card', '2nd Card', '3rd Card', '4th Card', '5th Card', '6th Card'];

const DEFAULT_PHASE_SUBJECTS: Partial<Record<Phase, string[]>> = {
  '1st Phase': ['Anatomy', 'Physiology', 'Biochemistry'],
  '2nd Phase': ['Community Medicine', 'Forensic Medicine'],
  '3rd Phase': ['Pathology', 'Microbiology', 'Pharmacology'],
  '4th Phase': ['Medicine', 'Surgery', 'Gynae & Obs']
};

export default function ResourceList({ 
  title, 
  description, 
  resources, 
  showHierarchy = true,
  sectionType
}: ResourceListProps) {
  // Navigation & filter state
  const [search, setSearch] = useState('');
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Authentication & Admin state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const isCurrentUserAdmin = (currentUser?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Custom Folders from Firestore
  const [customFolders, setCustomFolders] = useState<ResourceFolder[]>([]);

  // Action feedback toast
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modal: Add / Edit Resource
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceModalMode, setResourceModalMode] = useState<'add' | 'edit'>('add');
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resFormTitle, setResFormTitle] = useState('');
  const [resFormDescription, setResFormDescription] = useState('');
  const [resFormFileUrl, setResFormFileUrl] = useState('');
  const [resFormFileSize, setResFormFileSize] = useState('');
  const [resFormDate, setResFormDate] = useState('');
  const [resFormType, setResFormType] = useState<ResourceType>(sectionType);
  const [resFormPhase, setResFormPhase] = useState<Phase>('1st Phase');
  const [resFormSubject, setResFormSubject] = useState('');
  const [resFormCustomSubject, setResFormCustomSubject] = useState('');
  const [resFormTerm, setResFormTerm] = useState<string>('');
  const [resFormCard, setResFormCard] = useState<string>('');
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);
  const [resFormError, setResFormError] = useState<string | null>(null);

  // Modal: Delete Resource
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [isDeletingResource, setIsDeletingResource] = useState(false);

  // Modal: Create Folder
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderPhase, setFolderPhase] = useState<Phase>('1st Phase');
  const [folderSectionScope, setFolderSectionScope] = useState<'all' | 'lecture' | 'book'>('all');
  const [isSubmittingFolder, setIsSubmittingFolder] = useState(false);
  const [folderFormError, setFolderFormError] = useState<string | null>(null);

  // Modal: Delete Folder
  const [folderToDelete, setFolderToDelete] = useState<{ phase: Phase; name: string; fileCount: number } | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  // Shared Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore resourceFolders collection
  useEffect(() => {
    try {
      const q = query(collection(db, 'resourceFolders'), orderBy('createdTimestamp', 'asc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: ResourceFolder[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ResourceFolder, 'id'>),
          }));
          setCustomFolders(fetched);
        },
        (err) => {
          console.warn('Firestore resourceFolders onSnapshot note:', err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('init resourceFolders listener error:', err);
    }
  }, []);

  // Auto-seed default resources into Firestore if collection is empty when Admin is active
  useEffect(() => {
    if (!isCurrentUserAdmin) return;
    const seedIfEmpty = async () => {
      try {
        const snap = await getDocs(collection(db, 'resources'));
        if (snap.empty) {
          const batch = writeBatch(db);
          defaultResources.forEach((res) => {
            const docRef = doc(db, 'resources', res.id);
            const sanitized = sanitizeForFirestore({
              ...res,
              createdTimestamp: Date.now(),
              createdBy: ADMIN_EMAIL,
            });
            batch.set(docRef, sanitized);
          });
          await batch.commit();
        }
      } catch (err) {
        console.warn('Resource seeding check warning:', err);
      }
    };
    seedIfEmpty();
  }, [isCurrentUserAdmin]);

  // Compute available subjects/folders under the active phase
  const availableSubjects = useMemo(() => {
    if (!activePhase) return [];
    const subjects = new Set<string>();

    // 1. Add default phase subjects unless marked deleted
    const defaults = DEFAULT_PHASE_SUBJECTS[activePhase] || [];
    defaults.forEach((sub) => {
      const isDeleted = customFolders.some(
        (f) => f.phase === activePhase && f.name.toLowerCase() === sub.toLowerCase() && f.isDeleted
      );
      if (!isDeleted) {
        subjects.add(sub);
      }
    });

    // 2. Add custom folders from Firestore for this phase & section
    customFolders.forEach((f) => {
      if (f.phase === activePhase && !f.isDeleted) {
        if (!f.section || f.section === 'all' || f.section === sectionType) {
          subjects.add(f.name);
        }
      }
    });

    // 3. Add any subjects from existing resources in this phase & section
    resources.forEach((r) => {
      if (r.phase === activePhase) {
        const isDeleted = customFolders.some(
          (f) => f.phase === activePhase && f.name.toLowerCase() === r.subject.toLowerCase() && f.isDeleted
        );
        if (!isDeleted) {
          subjects.add(r.subject);
        }
      }
    });

    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [resources, activePhase, customFolders, sectionType]);

  // Current cards available under the active term
  const currentTermConfig = useMemo(() => {
    if (!activeTerm) return null;
    return TERMS_CONFIG.find((t) => t.term === activeTerm);
  }, [activeTerm]);

  // Subject-level resources (like curriculum PDFs) that do not belong to any specific term
  const subjectLevelResources = useMemo(() => {
    if (!activePhase || !activeSubject) return [];
    return resources.filter(
      (r) => r.phase === activePhase && r.subject.toLowerCase() === activeSubject.toLowerCase() && !r.term
    );
  }, [resources, activePhase, activeSubject]);

  // Filtered resources based on search and breadcrumb level
  const filteredResources = useMemo(() => {
    if (search) {
      return resources.filter(
        (r) =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.subject.toLowerCase().includes(search.toLowerCase()) ||
          (r.term && r.term.toLowerCase().includes(search.toLowerCase())) ||
          (r.card && r.card.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (!showHierarchy) {
      if (activePhase && activeSubject) {
        return resources.filter(
          (r) => r.phase === activePhase && r.subject.toLowerCase() === activeSubject.toLowerCase()
        );
      }
      return [];
    }

    // With Hierarchy: Phase -> Subject -> Term -> Card -> Files
    if (activePhase && activeSubject && activeTerm && activeCard) {
      return resources.filter(
        (r) =>
          r.phase === activePhase &&
          r.subject.toLowerCase() === activeSubject.toLowerCase() &&
          r.term === activeTerm &&
          r.card === activeCard
      );
    }

    return [];
  }, [resources, search, showHierarchy, activePhase, activeSubject, activeTerm, activeCard]);

  // Reset breadcrumbs helpers
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

  // Open Add Resource Modal
  const handleOpenAddResource = (defaultFolder?: string) => {
    setResourceModalMode('add');
    setEditingResourceId(null);
    setResFormTitle('');
    setResFormDescription('');
    setResFormFileUrl('');
    setResFormFileSize('');
    setResFormDate(new Date().toISOString().split('T')[0]);
    setResFormType(sectionType);
    setResFormPhase(activePhase || '1st Phase');
    setResFormSubject(defaultFolder || activeSubject || (availableSubjects[0] || 'Anatomy'));
    setResFormCustomSubject('');
    setResFormTerm(activeTerm || '');
    setResFormCard(activeCard || '');
    setResFormError(null);
    setShowResourceModal(true);
  };

  // Open Edit Resource Modal
  const handleOpenEditResource = (res: Resource) => {
    setResourceModalMode('edit');
    setEditingResourceId(res.id);
    setResFormTitle(res.title);
    setResFormDescription(res.description || '');
    setResFormFileUrl(res.fileUrl);
    setResFormFileSize(res.fileSize || '');
    setResFormDate(res.date || new Date().toISOString().split('T')[0]);
    setResFormType(res.type);
    setResFormPhase(res.phase);
    setResFormSubject(res.subject);
    setResFormCustomSubject('');
    setResFormTerm(res.term || '');
    setResFormCard(res.card || '');
    setResFormError(null);
    setShowResourceModal(true);
  };

  // Submit Add / Edit Resource Form
  const handleSubmitResource = async (e: FormEvent) => {
    e.preventDefault();
    if (!isCurrentUserAdmin) return;

    const title = resFormTitle.trim();
    const fileUrl = resFormFileUrl.trim();
    const finalSubject = resFormSubject === '__custom__' ? resFormCustomSubject.trim() : resFormSubject.trim();

    if (!title) {
      setResFormError('Please enter a title for the resource.');
      return;
    }
    if (!fileUrl) {
      setResFormError('Please enter a valid file or drive link.');
      return;
    }
    if (!finalSubject) {
      setResFormError('Please select or specify a folder / subject.');
      return;
    }

    setIsSubmittingResource(true);
    setResFormError(null);

    try {
      // If user typed a custom folder name, create it in resourceFolders too
      if (resFormSubject === '__custom__' && finalSubject) {
        const exists = customFolders.some(
          (f) => f.phase === resFormPhase && f.name.toLowerCase() === finalSubject.toLowerCase() && !f.isDeleted
        );
        if (!exists) {
          await addDoc(collection(db, 'resourceFolders'), {
            name: finalSubject,
            phase: resFormPhase,
            section: resFormType,
            isDeleted: false,
            createdTimestamp: Date.now(),
            createdBy: currentUser?.email || ADMIN_EMAIL,
          });
        }
      }

      const payload: Record<string, any> = {
        title,
        description: resFormDescription.trim(),
        fileUrl,
        date: resFormDate || new Date().toISOString().split('T')[0],
        type: resFormType,
        phase: resFormPhase,
        subject: finalSubject,
        updatedTimestamp: Date.now(),
      };

      if (resFormFileSize.trim()) {
        payload.fileSize = resFormFileSize.trim();
      } else if (resourceModalMode === 'edit') {
        payload.fileSize = deleteField();
      }

      if (resFormType === 'lecture') {
        if (resFormTerm) {
          payload.term = resFormTerm;
        } else if (resourceModalMode === 'edit') {
          payload.term = deleteField();
        }

        if (resFormCard) {
          payload.card = resFormCard;
        } else if (resourceModalMode === 'edit') {
          payload.card = deleteField();
        }
      } else if (resourceModalMode === 'edit') {
        payload.term = deleteField();
        payload.card = deleteField();
      }

      if (resourceModalMode === 'add') {
        await addDoc(collection(db, 'resources'), {
          ...payload,
          createdTimestamp: Date.now(),
          createdBy: currentUser?.email || ADMIN_EMAIL,
        });
        setActionFeedback(`Resource "${title}" published successfully.`);
      } else if (resourceModalMode === 'edit' && editingResourceId) {
        await setDoc(doc(db, 'resources', editingResourceId), payload, { merge: true });
        setActionFeedback(`Resource "${title}" updated successfully.`);
      }

      setShowResourceModal(false);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: unknown) {
      console.error('Error saving resource:', err);
      setResFormError(err instanceof Error ? err.message : 'Failed to save resource.');
    } finally {
      setIsSubmittingResource(false);
    }
  };

  // Confirm Delete Resource
  const handleConfirmDeleteResource = async () => {
    if (!resourceToDelete || !isCurrentUserAdmin) return;
    setIsDeletingResource(true);

    try {
      await deleteDoc(doc(db, 'resources', resourceToDelete.id));
      setActionFeedback(`Resource "${resourceToDelete.title}" deleted.`);
      setResourceToDelete(null);
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (err: unknown) {
      console.error('Error deleting resource:', err);
      setActionFeedback(err instanceof Error ? err.message : 'Failed to delete resource.');
      setTimeout(() => setActionFeedback(null), 3500);
    } finally {
      setIsDeletingResource(false);
    }
  };

  // Create Folder Form Submit
  const handleCreateFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !isCurrentUserAdmin) return;

    const trimmed = newFolderName.trim();
    setIsSubmittingFolder(true);
    setFolderFormError(null);

    try {
      // Check if folder was previously tombstoned with isDeleted: true
      const existingTombstone = customFolders.find(
        (f) => f.phase === folderPhase && f.name.toLowerCase() === trimmed.toLowerCase() && f.isDeleted
      );

      if (existingTombstone) {
        await setDoc(
          doc(db, 'resourceFolders', existingTombstone.id),
          {
            isDeleted: false,
            name: trimmed,
            phase: folderPhase,
            section: folderSectionScope,
            updatedTimestamp: Date.now(),
          },
          { merge: true }
        );
      } else {
        await addDoc(collection(db, 'resourceFolders'), {
          name: trimmed,
          phase: folderPhase,
          section: folderSectionScope,
          isDeleted: false,
          createdTimestamp: Date.now(),
          createdBy: currentUser?.email || ADMIN_EMAIL,
        });
      }

      setActionFeedback(`Folder "${trimmed}" created successfully in ${folderPhase}.`);
      setShowFolderModal(false);
      setNewFolderName('');
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: unknown) {
      console.error('Error creating folder:', err);
      setFolderFormError(err instanceof Error ? err.message : 'Failed to create folder.');
    } finally {
      setIsSubmittingFolder(false);
    }
  };

  // Confirm Delete Folder
  const handleConfirmDeleteFolder = async () => {
    if (!folderToDelete || !isCurrentUserAdmin) return;
    setIsDeletingFolder(true);

    try {
      const { phase, name } = folderToDelete;

      // 1. Mark or update folder in resourceFolders
      const matchingDocs = customFolders.filter(
        (f) => f.phase === phase && f.name.toLowerCase() === name.toLowerCase()
      );

      if (matchingDocs.length > 0) {
        for (const f of matchingDocs) {
          await setDoc(doc(db, 'resourceFolders', f.id), { isDeleted: true }, { merge: true });
        }
      } else {
        // Record tombstone for default folder so it stays hidden
        const safeId = `del_${phase.replace(/\s+/g, '_')}_${name.replace(/\s+/g, '_')}`;
        await setDoc(doc(db, 'resourceFolders', safeId), {
          name,
          phase,
          isDeleted: true,
          createdTimestamp: Date.now(),
          createdBy: currentUser?.email || ADMIN_EMAIL,
        });
      }

      // 2. Delete all resources in this folder for this phase
      const resourcesToDelete = resources.filter(
        (r) => r.phase === phase && r.subject.toLowerCase() === name.toLowerCase()
      );

      if (resourcesToDelete.length > 0) {
        const batch = writeBatch(db);
        resourcesToDelete.forEach((r) => {
          batch.delete(doc(db, 'resources', r.id));
        });
        await batch.commit();
      }

      // If activeSubject was this folder, reset to subjects
      if (activeSubject && activeSubject.toLowerCase() === name.toLowerCase()) {
        resetToSubjects();
      }

      setActionFeedback(`Folder "${name}" and ${resourcesToDelete.length} resource(s) deleted.`);
      setFolderToDelete(null);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err: unknown) {
      console.error('Error deleting folder:', err);
      setActionFeedback(err instanceof Error ? err.message : 'Failed to delete folder.');
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsDeletingFolder(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-700 text-white shadow-xl border border-emerald-500/50 animate-in slide-in-from-top-4 duration-300">
          <Check size={20} className="text-emerald-200" />
          <span className="text-sm font-semibold">{actionFeedback}</span>
        </div>
      )}

      {/* Admin Status Banner (Only visible to admin Salman Sami) */}
      {isCurrentUserAdmin && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm font-medium">
            <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Admin Resource Mode • Logged in as <strong>Salman Sami ({ADMIN_EMAIL})</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddResource()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs transition-all"
            >
              <PlusCircle size={15} />
              <span>{sectionType === 'lecture' ? 'Add Lecture' : 'Add Book'}</span>
            </button>
            <button
              onClick={() => {
                setFolderPhase(activePhase || '1st Phase');
                setNewFolderName('');
                setFolderSectionScope(sectionType);
                setFolderFormError(null);
                setShowFolderModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold bg-white dark:bg-[#0a231b] hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-400/40 text-xs transition-all shadow-xs"
            >
              <FolderPlus size={15} />
              <span>New Folder</span>
            </button>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-600 text-white">
              Admin Active
            </span>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="relative w-full md:w-80">
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
          {isCurrentUserAdmin && (
            <button
              onClick={() => handleOpenAddResource()}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all text-sm shrink-0"
              title="Add New Resource"
            >
              <PlusCircle size={18} />
              <span>{sectionType === 'lecture' ? 'Add Lecture' : 'Add Book'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Breadcrumb Bar */}
      {!search && (
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-sm font-medium py-3 px-4 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-emerald-900/10 dark:border-white/5 shadow-xs">
          <button
            onClick={resetToPhases}
            className={`flex items-center gap-1.5 transition-colors ${
              !activePhase
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            <Folder size={16} /> All Phases
          </button>

          {activePhase && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <button
                onClick={resetToSubjects}
                className={`transition-colors ${
                  !activeSubject
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
              >
                {activePhase}
              </button>
            </>
          )}

          {activePhase && activeSubject && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <button
                onClick={showHierarchy ? resetToTerms : undefined}
                className={`transition-colors ${
                  !showHierarchy || !activeTerm
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
              >
                {activeSubject}
              </button>
            </>
          )}

          {showHierarchy && activePhase && activeSubject && activeTerm && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <button
                onClick={resetToCards}
                className={`transition-colors ${
                  !activeCard
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
              >
                {activeTerm}
              </button>
            </>
          )}

          {showHierarchy && activePhase && activeSubject && activeTerm && activeCard && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                {activeCard}
              </span>
            </>
          )}
        </nav>
      )}

      {/* SEARCH RESULTS VIEW */}
      {search && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 px-2 font-medium">
            <span>Found {filteredResources.length} result(s) for &quot;{search}&quot;</span>
            <button
              onClick={() => setSearch('')}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              Clear search
            </button>
          </div>
          {filteredResources.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] p-12 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-300">No resources found</p>
              <p className="text-slate-600 dark:text-slate-500 mt-2 font-light">
                Try searching for specific subjects like &apos;Biochemistry&apos;, &apos;Anatomy&apos;, or &apos;Card-01&apos;.
              </p>
            </div>
          ) : (
            <FileList 
              resources={filteredResources} 
              isCurrentUserAdmin={isCurrentUserAdmin}
              onEdit={handleOpenEditResource}
              onDelete={setResourceToDelete}
            />
          )}
        </div>
      )}

      {/* LEVEL 1: Phases Folders */}
      {!search && !activePhase && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {PHASES.map((phase) => {
            const count = resources.filter((r) => r.phase === phase).length;
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
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {phase}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
                    {count} {count === 1 ? 'file' : 'files'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* LEVEL 2: Subject Folders */}
      {!search && activePhase && !activeSubject && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex items-center justify-between px-2 flex-wrap gap-3">
            <button
              onClick={resetToPhases}
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back to Phases
            </button>

            {isCurrentUserAdmin && (
              <button
                onClick={() => {
                  setFolderPhase(activePhase);
                  setNewFolderName('');
                  setFolderSectionScope(sectionType);
                  setFolderFormError(null);
                  setShowFolderModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                <FolderPlus size={18} />
                <span>New Folder in {activePhase}</span>
              </button>
            )}
          </div>

          {availableSubjects.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-white/5">
                <Folder size={32} className="text-emerald-700/60 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-300">No folders in {activePhase}</p>
              <p className="text-slate-600 dark:text-slate-500 mt-2 font-light max-w-md">
                Folders and study resources for {activePhase} can be created right here.
              </p>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => {
                    setFolderPhase(activePhase);
                    setNewFolderName('');
                    setFolderSectionScope(sectionType);
                    setFolderFormError(null);
                    setShowFolderModal(true);
                  }}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-sm"
                >
                  <FolderPlus size={18} />
                  <span>Create First Folder</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableSubjects.map((subject) => {
                const count = resources.filter(
                  (r) => r.phase === activePhase && r.subject.toLowerCase() === subject.toLowerCase()
                ).length;
                return (
                  <div key={subject} className="relative group">
                    <button
                      onClick={() => setActiveSubject(subject)}
                      className="w-full bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-sm p-6 rounded-3xl border border-emerald-900/10 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-50/80 dark:hover:bg-[#0b281f]/70 shadow-sm hover:shadow-[0_4px_20px_rgba(5,150,105,0.15)] transition-all text-left flex flex-col items-start gap-5 hover:-translate-y-1"
                    >
                      <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all ring-1 ring-emerald-300/60 dark:ring-emerald-500/20 shadow-inner">
                        <Folder size={36} fill="currentColor" className="opacity-80" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {subject}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
                          {count} {count === 1 ? 'file' : 'files'}
                        </p>
                      </div>
                    </button>

                    {/* Admin Delete Folder Button */}
                    {isCurrentUserAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToDelete({ phase: activePhase, name: subject, fileCount: count });
                        }}
                        className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200/80 dark:border-white/10 transition-all shadow-sm z-10 opacity-75 hover:opacity-100"
                        title={`Delete folder "${subject}"`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LEVEL 3: Term Folders for Class Lectures */}
      {!search && activePhase && activeSubject && showHierarchy && !activeTerm && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="flex items-center justify-between px-2 flex-wrap gap-3">
            <button
              onClick={resetToSubjects}
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back to Subjects
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/25">
                {activeSubject}
              </span>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => handleOpenAddResource(activeSubject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                >
                  <PlusCircle size={14} />
                  <span>Add Lecture</span>
                </button>
              )}
            </div>
          </div>

          {/* Subject-level curriculum or syllabus resources */}
          {subjectLevelResources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2 text-slate-800 dark:text-slate-300 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>General & Curriculum Resources</span>
              </div>
              <FileList 
                resources={subjectLevelResources} 
                showPath={false} 
                isCurrentUserAdmin={isCurrentUserAdmin}
                onEdit={handleOpenEditResource}
                onDelete={setResourceToDelete}
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 px-2 mb-4 text-slate-800 dark:text-slate-300 font-bold text-sm">
              <Folder size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Term Folders</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {TERMS_CONFIG.map(({ term, cards, description: termDesc }) => {
                const termFileCount = resources.filter(
                  (r) =>
                    r.phase === activePhase &&
                    r.subject.toLowerCase() === activeSubject.toLowerCase() &&
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
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {term}
                        </h3>
                      </div>
                      <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1 font-semibold">
                        {cards.join(' & ')}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">{termDesc}</p>
                      <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-white/5 w-full flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                        <span>
                          {termFileCount} {termFileCount === 1 ? 'Lecture' : 'Lectures'}
                        </span>
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
          <div className="flex items-center justify-between mb-6 px-2 flex-wrap gap-3">
            <button
              onClick={resetToTerms}
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Back to Terms
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/25">
                {activeSubject} • {activeTerm}
              </span>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => handleOpenAddResource(activeSubject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                >
                  <PlusCircle size={14} />
                  <span>Add Lecture</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
            {currentTermConfig?.cards.map((card) => {
              const cardFileCount = resources.filter(
                (r) =>
                  r.phase === activePhase &&
                  r.subject.toLowerCase() === activeSubject.toLowerCase() &&
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
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      {card}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      {activeSubject} Curriculum
                    </p>
                    <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-white/5 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>
                        {cardFileCount} {cardFileCount === 1 ? 'Lecture' : 'Lectures'}
                      </span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 5: Lecture Files (Inside Card) or Plain Subject Files (Books) */}
      {!search && activePhase && activeSubject && (!showHierarchy || (showHierarchy && activeTerm && activeCard)) && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2 flex-wrap gap-3">
            <button
              onClick={showHierarchy ? resetToCards : resetToSubjects}
              className="flex items-center gap-2 text-emerald-800 dark:text-slate-400 hover:text-emerald-950 dark:hover:text-slate-200 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> {showHierarchy ? 'Back to Cards' : 'Back to Subjects'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/25">
                {activeSubject} {showHierarchy ? `• ${activeTerm} • ${activeCard}` : ''}
              </span>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => handleOpenAddResource(activeSubject)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
                >
                  <PlusCircle size={15} />
                  <span>{sectionType === 'lecture' ? 'Add Lecture Here' : 'Add Book Here'}</span>
                </button>
              )}
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#0a231b]/60 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-white/5">
                <File size={32} className="text-emerald-700/60 dark:text-slate-600" strokeWidth={1.5} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-300">No files uploaded yet</p>
              <p className="text-slate-600 dark:text-slate-500 mt-2 font-light max-w-md">
                {showHierarchy
                  ? `Lectures for ${activeSubject} • ${activeTerm} (${activeCard}) will be listed here.`
                  : `Textbooks for ${activeSubject} will be added here.`}
              </p>
              {isCurrentUserAdmin && (
                <button
                  onClick={() => handleOpenAddResource(activeSubject)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-sm"
                >
                  <PlusCircle size={18} />
                  <span>Upload First Resource</span>
                </button>
              )}
            </div>
          ) : (
            <FileList 
              resources={filteredResources} 
              showPath={false} 
              isCurrentUserAdmin={isCurrentUserAdmin}
              onEdit={handleOpenEditResource}
              onDelete={setResourceToDelete}
            />
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* MODAL 1: Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a231b] w-full max-w-lg rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden">
            <div className="p-6 border-b border-emerald-900/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <FolderPlus size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Folder</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add a subject or topic folder to {folderPhase}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFolderModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-6 space-y-5">
              {folderFormError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{folderFormError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Phase
                </label>
                <select
                  value={folderPhase}
                  onChange={(e) => setFolderPhase(e.target.value as Phase)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm font-medium"
                >
                  {PHASES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Folder / Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Forensic Medicine, Community Medicine, Histology..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Folder Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFolderSectionScope('all')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      folderSectionScope === 'all'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                    }`}
                  >
                    Both Sections
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderSectionScope('lecture')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      folderSectionScope === 'lecture'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                    }`}
                  >
                    Lectures Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFolderSectionScope('book')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      folderSectionScope === 'book'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                    }`}
                  >
                    Books Only
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFolder}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingFolder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Folder</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Folder Confirmation Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a231b] w-full max-w-md rounded-3xl shadow-2xl border border-rose-500/30 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <Trash2 size={30} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Delete &quot;{folderToDelete.name}&quot;?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete the folder <strong className="text-slate-900 dark:text-slate-200">&quot;{folderToDelete.name}&quot;</strong> from {folderToDelete.phase}?
                {folderToDelete.fileCount > 0 ? (
                  <span className="block mt-2 font-semibold text-rose-600 dark:text-rose-400">
                    Warning: This will also delete {folderToDelete.fileCount} associated resource(s) inside this folder from Firebase!
                  </span>
                ) : (
                  <span className="block mt-1 text-xs text-slate-500">
                    This folder currently contains no files.
                  </span>
                )}
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeletingFolder}
                  onClick={() => setFolderToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingFolder}
                  onClick={handleConfirmDeleteFolder}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isDeletingFolder ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Confirm Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a231b] w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-500/30 overflow-hidden my-8">
            <div className="p-6 border-b border-emerald-900/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {resourceModalMode === 'add' ? <PlusCircle size={22} /> : <Edit3 size={22} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {resourceModalMode === 'add'
                      ? resFormType === 'lecture'
                        ? 'Add New Lecture Material'
                        : 'Add New Medical Textbook'
                      : 'Edit Resource Details'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Firebase Cloud Storage & Telegram / Drive Link sync
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResourceModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitResource} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {resFormError && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{resFormError}</span>
                </div>
              )}

              {/* Resource Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResFormType('lecture')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    resFormType === 'lecture'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                  }`}
                >
                  Class Lecture
                </button>
                <button
                  type="button"
                  onClick={() => setResFormType('book')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    resFormType === 'book'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent'
                  }`}
                >
                  Medical Textbook
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Item 09 - Enzyme Kinetics & Regulation, or Guyton Physiology 14th Ed"
                  value={resFormTitle}
                  onChange={(e) => setResFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Topic Outline
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of lecture contents, key chapters, or instructor notes..."
                  value={resFormDescription}
                  onChange={(e) => setResFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm resize-none"
                />
              </div>

              {/* Link / URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  File URL / Link * (Telegram, Google Drive, OneDrive, Web PDF)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://t.me/... or https://drive.google.com/... or https://..."
                  value={resFormFileUrl}
                  onChange={(e) => setResFormFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm font-mono"
                />
              </div>

              {/* Phase & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Phase *
                  </label>
                  <select
                    value={resFormPhase}
                    onChange={(e) => {
                      const newPhase = e.target.value as Phase;
                      setResFormPhase(newPhase);
                      // Update default subject options
                      const subDefaults = DEFAULT_PHASE_SUBJECTS[newPhase] || [];
                      if (subDefaults.length > 0) {
                        setResFormSubject(subDefaults[0]);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm font-medium"
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Folder / Subject *
                  </label>
                  <select
                    value={resFormSubject}
                    onChange={(e) => setResFormSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm font-medium"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="__custom__">+ Type New Folder Name...</option>
                  </select>
                </div>
              </div>

              {/* Custom Subject text field if selected */}
              {resFormSubject === '__custom__' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    New Folder Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pathology, Microbiology..."
                    value={resFormCustomSubject}
                    onChange={(e) => setResFormCustomSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
              )}

              {/* If Lecture: Term and Card dropdowns */}
              {resFormType === 'lecture' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Term (Optional)
                    </label>
                    <select
                      value={resFormTerm}
                      onChange={(e) => setResFormTerm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-xs"
                    >
                      <option value="">None (Subject / Curriculum level)</option>
                      {ALL_TERMS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Card (Optional)
                    </label>
                    <select
                      value={resFormCard}
                      onChange={(e) => setResFormCard(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-xs"
                    >
                      <option value="">None</option>
                      {ALL_CARDS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Date & File Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={resFormDate}
                    onChange={(e) => setResFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    File Size (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 4.2 MB or PDF"
                    value={resFormFileSize}
                    onChange={(e) => setResFormFileSize(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResource}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmittingResource ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{resourceModalMode === 'add' ? 'Publish Resource' : 'Save Changes'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Resource Confirmation Modal */}
      {resourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a231b] w-full max-w-md rounded-3xl shadow-2xl border border-rose-500/30 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
                <Trash2 size={30} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Delete Resource?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-200">&quot;{resourceToDelete.title}&quot;</strong> from Firebase?
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isDeletingResource}
                  onClick={() => setResourceToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingResource}
                  onClick={handleConfirmDeleteResource}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
                >
                  {isDeletingResource ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Resource</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to render the list of files with admin action controls
function FileList({ 
  resources, 
  showPath = true,
  isCurrentUserAdmin = false,
  onEdit,
  onDelete
}: { 
  resources: Resource[]; 
  showPath?: boolean;
  isCurrentUserAdmin?: boolean;
  onEdit?: (res: Resource) => void;
  onDelete?: (res: Resource) => void;
}) {
  return (
    <div className="bg-white/90 dark:bg-[#0a231b]/70 backdrop-blur-md shadow-lg border border-emerald-900/10 dark:border-white/5 rounded-[2rem] overflow-hidden">
      <ul className="divide-y divide-emerald-900/10 dark:divide-white/5">
        {resources.map((resource) => (
          <li
            key={resource.id}
            className="p-5 md:p-6 hover:bg-emerald-50/60 dark:hover:bg-slate-800/40 transition-colors flex items-start gap-4 md:gap-6 group"
          >
            <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl shrink-0 mt-1 border border-emerald-300/60 dark:border-emerald-500/20 group-hover:scale-105 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all shadow-inner">
              <File size={28} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-200 truncate mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {resource.title}
              </h4>
              {resource.description && (
                <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-light">
                  {resource.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                {showPath ? (
                  <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/20 text-xs font-semibold">
                    <Folder size={12} /> {resource.phase} / {resource.subject}{' '}
                    {resource.term ? ` / ${resource.term}` : ''} {resource.card ? ` / ${resource.card}` : ''}
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
                  {new Date(resource.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {resource.fileSize && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                    {resource.fileSize}
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Admin Edit/Delete + Open/Download */}
            <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-1">
              {isCurrentUserAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit?.(resource)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-white/10 transition-all shadow-xs"
                    title="Edit Resource"
                  >
                    <Edit3 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(resource)}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-white/10 transition-all shadow-xs"
                    title="Delete Resource"
                  >
                    <Trash2 size={17} />
                  </button>
                </>
              )}

              <a
                href={resource.fileUrl}
                target={resource.fileUrl.startsWith('http') ? '_blank' : undefined}
                rel={resource.fileUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center p-3.5 md:px-5 md:py-2.5 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold hover:text-emerald-950 dark:hover:text-emerald-200 bg-emerald-100/80 hover:bg-emerald-200/80 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 focus:outline-none transition-all border border-emerald-300/70 dark:border-emerald-500/30 gap-2 shadow-xs"
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
