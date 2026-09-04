import { useState, useEffect, type FormEvent } from 'react';
import { 
  Bell, AlertCircle, Calendar, PlusCircle, Edit3, Trash2, 
  X, Check, Loader2, ShieldCheck 
} from 'lucide-react';
import { 
  collection, doc, addDoc, setDoc, deleteDoc, getDocs 
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Notice } from '../types';
import { notices as defaultNotices } from '../data';
import { useNotifications } from '../context/NotificationContext';

const ADMIN_EMAIL = 'cadetsalman2034@gmail.com';

export default function Notices({ notices }: { notices: Notice[] }) {
  const { markNoticesAsRead } = useNotifications();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const isCurrentUserAdmin = (currentUser?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Admin Modal States
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formIsImportant, setFormIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Confirmation State
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // User notification feedback toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Mark all notices as read when visiting Notices page
  useEffect(() => {
    markNoticesAsRead();
  }, [markNoticesAsRead]);

  // Listen to Auth State globally (no login button rendered here per user instructions)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Ensure default notices exist as real Firestore documents when Admin accesses the system
  useEffect(() => {
    if (!isCurrentUserAdmin) return;

    const seedIfEmpty = async () => {
      try {
        const snap = await getDocs(collection(db, 'notices'));
        if (snap.empty) {
          for (let i = 0; i < defaultNotices.length; i++) {
            const n = defaultNotices[i];
            await setDoc(doc(db, 'notices', n.id), {
              title: n.title,
              content: n.content,
              date: n.date,
              isImportant: n.isImportant,
              createdTimestamp: Date.now() - (defaultNotices.length - i) * 60000,
              createdBy: ADMIN_EMAIL,
            });
          }
        }
      } catch (err) {
        console.warn('Notice seeding note:', err);
      }
    };

    seedIfEmpty();
  }, [isCurrentUserAdmin]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingNoticeId(null);
    setFormTitle('');
    setFormContent('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormIsImportant(false);
    setFormError(null);
    setShowNoticeModal(true);
  };

  const handleOpenEditModal = (notice: Notice) => {
    setModalMode('edit');
    setEditingNoticeId(notice.id);
    setFormTitle(notice.title);
    setFormContent(notice.content);
    setFormDate(notice.date || new Date().toISOString().split('T')[0]);
    setFormIsImportant(notice.isImportant || false);
    setFormError(null);
    setShowNoticeModal(true);
  };

  const handleSubmitNotice = async (e: FormEvent) => {
    e.preventDefault();
    if (!isCurrentUserAdmin) return;

    const title = formTitle.trim();
    const content = formContent.trim();
    if (!title) {
      setFormError('Please enter a notice title.');
      return;
    }
    if (!content) {
      setFormError('Please enter notice content.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (modalMode === 'add') {
        await addDoc(collection(db, 'notices'), {
          title,
          content,
          date: formDate,
          isImportant: formIsImportant,
          createdTimestamp: Date.now(),
          createdBy: currentUser?.email || ADMIN_EMAIL,
        });
        setActionNotice('Notice published successfully to Firebase.');
      } else if (modalMode === 'edit' && editingNoticeId) {
        await setDoc(
          doc(db, 'notices', editingNoticeId),
          {
            title,
            content,
            date: formDate,
            isImportant: formIsImportant,
            updatedTimestamp: Date.now(),
          },
          { merge: true }
        );
        setActionNotice('Notice updated successfully in Firebase.');
      }

      setShowNoticeModal(false);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: unknown) {
      console.error('Error saving notice:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save notice to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete || !isCurrentUserAdmin) return;
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, 'notices', noticeToDelete.id));
      setActionNotice('Notice deleted permanently from Firebase.');
      setNoticeToDelete(null);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: unknown) {
      console.error('Error deleting notice:', err);
      setActionNotice(err instanceof Error ? err.message : 'Failed to delete notice from database.');
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatNoticeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch {
      // ignore
    }
    return dateStr;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Toast Feedback */}
      {actionNotice && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className="bg-emerald-700 text-white dark:bg-emerald-600 px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-400/40 text-xs sm:text-sm font-semibold flex items-center gap-2">
            <Check size={16} />
            <span>{actionNotice}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
            Notices & Announcements
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
            Stay up to date with the latest news, exam schedules, and important information from the 23rd batch.
          </p>
        </div>

        {/* Admin Publish Button (Only visible if Admin is logged in from Chat or Polls) */}
        {isCurrentUserAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-md transition-all cursor-pointer active:scale-95 shrink-0 self-start md:self-auto"
          >
            <PlusCircle size={17} />
            <span>Add Notice</span>
          </button>
        )}
      </div>

      {/* Admin Mode Badge (discreetly shows active admin capabilities when logged in) */}
      {isCurrentUserAdmin && (
        <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-300 leading-tight">
                Admin Notice Management
              </p>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80 font-mono">
                Logged in as Salman Sami ({currentUser?.email})
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            Admin Active
          </span>
        </div>
      )}

      {/* Notice Cards List */}
      <div className="space-y-5">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className={`rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-5 md:gap-6 transition-all backdrop-blur-md group ${
              notice.isImportant 
                ? 'bg-red-50/80 dark:bg-red-950/20 border border-red-500/20 relative overflow-hidden shadow-xs' 
                : 'bg-white/80 dark:bg-[#0a231b]/60 border border-emerald-900/10 dark:border-white/5 hover:bg-emerald-50/70 dark:hover:bg-[#0c2c22]/70 shadow-xs hover:shadow-md'
            }`}
          >
            {notice.isImportant && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            )}
            
            <div className="shrink-0 hidden md:block">
              {notice.isImportant ? (
                <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-4 rounded-2xl border border-red-500/20 shadow-inner group-hover:scale-105 transition-transform">
                  <AlertCircle size={32} strokeWidth={1.5} />
                </div>
              ) : (
                <div className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform">
                  <Bell size={32} strokeWidth={1.5} />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                  {notice.isImportant && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 tracking-wide uppercase border border-red-300 dark:border-red-500/20 shadow-inner">
                      Important
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-200 leading-tight group-hover:text-emerald-800 dark:group-hover:text-white transition-colors">
                    {notice.title}
                  </h3>
                </div>

                {/* Admin Notice Actions (Edit & Delete) */}
                {isCurrentUserAdmin && (
                  <div className="flex items-center gap-1 shrink-0 bg-slate-100/80 dark:bg-black/30 p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
                    <button
                      onClick={() => handleOpenEditModal(notice)}
                      title="Edit this notice"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-500/15 transition-all cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => setNoticeToDelete(notice)}
                      title="Permanently delete notice"
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-500/15 transition-all cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-base sm:text-lg font-light">
                {notice.content}
              </p>
              
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-emerald-900/10 dark:border-white/5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                <Calendar size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{formatNoticeDate(notice.date)}</span>
              </div>
            </div>
          </div>
        ))}
        
        {notices.length === 0 && (
          <div className="text-center p-16 bg-white/80 dark:bg-[#0a231b]/60 rounded-[2rem] border border-emerald-900/10 dark:border-white/5 backdrop-blur-md flex flex-col items-center justify-center shadow-xs">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-emerald-200 dark:border-white/5">
              <Bell size={32} className="text-emerald-700/60 dark:text-slate-600" strokeWidth={1.5} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-300 mb-1">No notices at this time</p>
            <p className="text-slate-500 dark:text-slate-400 font-light">Check back later for updates and announcements.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Notice Modal */}
      {showNoticeModal && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#051c14] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {modalMode === 'add' ? <PlusCircle size={22} /> : <Edit3 size={22} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {modalMode === 'add' ? 'Publish New Notice' : 'Edit Notice'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Syncs in realtime to all batchmates via Firebase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitNotice} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., 2nd Term Examination Schedule Released"
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#0a231b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#0a231b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#0a231b] border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#0d2e23] transition-colors">
                    <input
                      type="checkbox"
                      checked={formIsImportant}
                      onChange={(e) => setFormIsImportant(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mark as Important Notice
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Notice Content / Details *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Provide detailed instructions, timings, room numbers, or guidelines..."
                  className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-[#0a231b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>{modalMode === 'add' ? 'Publish Notice' : 'Update Notice'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Notice Confirmation Modal */}
      {noticeToDelete && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#051c14] border border-rose-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Delete Notice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin Action • Irreversible Cloud Deletion
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-100">"{noticeToDelete.title}"</strong>? It will immediately disappear from the website and the notice ticker for all students.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setNoticeToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
