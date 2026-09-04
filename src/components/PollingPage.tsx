import { useState, useEffect, type FormEvent } from 'react';
import { 
  Vote, PlusCircle, Trash2, Clock, CheckCircle2, 
  AlertCircle, ShieldAlert, Wifi, WifiOff, X,
  Lock, Loader2, Sparkles, UserCheck, Flame
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, getDoc, getDocs,
  deleteDoc, writeBatch
} from 'firebase/firestore';
import { 
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser 
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Poll, PollVote } from '../types';

const ADMIN_EMAIL = 'cadetsalman2034@gmail.com';

export default function PollingPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votesByPoll, setVotesByPoll] = useState<Record<string, Record<string, PollVote>>>({});
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<{ fullName?: string; rollNumber?: string; role?: string } | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Voting states
  const [submittingVotePollId, setSubmittingVotePollId] = useState<string | null>(null);
  const [selectedOptionByPoll, setSelectedOptionByPoll] = useState<Record<string, string>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Admin Poll Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isTimed, setIsTimed] = useState(false);
  const [timerDurationHours, setTimerDurationHours] = useState('24');
  const [customTimerMinutes, setCustomTimerMinutes] = useState('');
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Admin Actions State
  const [processingPollId, setProcessingPollId] = useState<string | null>(null);
  const [pollToDelete, setPollToDelete] = useState<Poll | null>(null);

  // Clock tick for realtime countdown on timed polls
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const isAdmin = (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

          if (userDoc.exists()) {
            const data = userDoc.data() as { fullName?: string; rollNumber?: string; role?: string };
            setUserProfile({
              fullName: data.fullName || user.displayName || 'Cadet',
              rollNumber: data.rollNumber || (isAdmin ? '01' : ''),
              role: isAdmin ? 'admin' : 'student',
            });
          } else {
            const name = user.displayName || (isAdmin ? 'Salman Sami' : 'Cadet');
            const defaultRoll = isAdmin ? '01' : '';
            const role = isAdmin ? 'admin' : 'student';

            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              fullName: name,
              email: user.email,
              rollNumber: defaultRoll,
              role,
              createdAt: Date.now(),
            });

            setUserProfile({ fullName: name, rollNumber: defaultRoll, role });
          }
        } catch (err) {
          console.error('Error fetching user for polls:', err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Polls collection
  useEffect(() => {
    try {
      const q = query(collection(db, 'polls'), orderBy('createdTimestamp', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setIsFirebaseConnected(true);
          const pollsList: Poll[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              question: data.question || '',
              description: data.description || '',
              options: data.options || [],
              createdTimestamp: data.createdTimestamp || Date.now(),
              expiresTimestamp: data.expiresTimestamp,
              status: data.status || 'active',
              createdBy: data.createdBy || '',
              isTimed: !!data.isTimed,
            };
          });
          setPolls(pollsList);
          setLoading(false);
        },
        (err) => {
          console.error('Polls snapshot error:', err);
          setIsFirebaseConnected(false);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.error('Firestore polls listener init error:', e);
      setIsFirebaseConnected(false);
      setLoading(false);
    }
  }, []);

  // Listen to votes for all polls
  useEffect(() => {
    if (polls.length === 0) return;

    const unsubs: (() => void)[] = [];

    polls.forEach((poll) => {
      const votesColRef = collection(db, 'polls', poll.id, 'votes');
      const unsub = onSnapshot(
        votesColRef,
        (snapshot) => {
          const pollVotesMap: Record<string, PollVote> = {};
          snapshot.docs.forEach((docSnap) => {
            const v = docSnap.data() as PollVote;
            pollVotesMap[docSnap.id] = v;
          });

          setVotesByPoll((prev) => ({
            ...prev,
            [poll.id]: pollVotesMap,
          }));
        },
        (error) => {
          console.warn(`Votes listener note for ${poll.id}:`, error);
        }
      );
      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [polls]);

  // Google Login
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const isCurrentUserAdmin = (currentUser?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Cast Vote Handler (Ensures 1 user = 1 vote via auth.uid keyed document)
  const handleCastVote = async (poll: Poll, optionId: string) => {
    if (!currentUser) {
      setAuthError('Please sign in with Google to cast your vote.');
      return;
    }

    // Check if poll is closed or timed out
    const isExpired = poll.expiresTimestamp && now >= poll.expiresTimestamp;
    if (poll.status === 'closed' || isExpired) {
      setActionNotice('This poll is closed. Votes can no longer be recorded.');
      setTimeout(() => setActionNotice(null), 3500);
      return;
    }

    setSubmittingVotePollId(poll.id);

    try {
      const voteData: PollVote = {
        pollId: poll.id,
        uid: currentUser.uid,
        voterName: userProfile?.fullName || currentUser.displayName || 'Cadet',
        voterEmail: currentUser.email || '',
        voterRoll: userProfile?.rollNumber || '',
        optionId,
        timestamp: Date.now(),
      };

      // Document ID is currentUser.uid, ensuring one vote per authenticated person
      await setDoc(doc(db, 'polls', poll.id, 'votes', currentUser.uid), voteData);

      setActionNotice('Your vote has been cast and recorded successfully!');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error casting vote:', err);
      setActionNotice('Failed to cast vote. Please try again.');
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setSubmittingVotePollId(null);
    }
  };

  // Add Option Input in Modal
  const handleAddOptionField = () => {
    if (pollOptions.length < 8) {
      setPollOptions([...pollOptions, '']);
    }
  };

  // Remove Option Input in Modal
  const handleRemoveOptionField = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Create New Poll (Admin Only)
  const handleCreatePoll = async (e: FormEvent) => {
    e.preventDefault();
    if (!isCurrentUserAdmin || isCreatingPoll) return;

    const trimmedQuestion = pollQuestion.trim();
    if (!trimmedQuestion) {
      setCreateError('Poll question is required.');
      return;
    }

    const validOptions = pollOptions.map((o) => o.trim()).filter((o) => o.length > 0);
    if (validOptions.length < 2) {
      setCreateError('Please provide at least 2 distinct options.');
      return;
    }

    setIsCreatingPoll(true);
    setCreateError(null);

    try {
      let expiresTimestamp: number | undefined = undefined;
      if (isTimed) {
        let durationMs = 0;
        if (customTimerMinutes && parseInt(customTimerMinutes, 10) > 0) {
          durationMs = parseInt(customTimerMinutes, 10) * 60 * 1000;
        } else {
          durationMs = parseFloat(timerDurationHours) * 60 * 60 * 1000;
        }
        expiresTimestamp = Date.now() + durationMs;
      }

      const formattedOptions = validOptions.map((text, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        text,
      }));

      const newPollData = {
        question: trimmedQuestion,
        description: pollDescription.trim(),
        options: formattedOptions,
        createdTimestamp: Date.now(),
        expiresTimestamp: expiresTimestamp || null,
        status: 'active',
        createdBy: currentUser?.email || ADMIN_EMAIL,
        isTimed,
      };

      await addDoc(collection(db, 'polls'), newPollData);

      setShowCreateModal(false);
      setPollQuestion('');
      setPollDescription('');
      setPollOptions(['', '']);
      setIsTimed(false);
      setTimerDurationHours('24');
      setCustomTimerMinutes('');
      setActionNotice('New poll published to the batch successfully!');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err) {
      console.error('Error creating poll:', err);
      setCreateError('Failed to create poll. Please verify database connection.');
    } finally {
      setIsCreatingPoll(false);
    }
  };

  // Admin Close Poll
  const handleToggleClosePoll = async (poll: Poll) => {
    if (!isCurrentUserAdmin || processingPollId) return;
    setProcessingPollId(poll.id);

    try {
      const newStatus = poll.status === 'active' ? 'closed' : 'active';
      await setDoc(doc(db, 'polls', poll.id), { status: newStatus }, { merge: true });
      setActionNotice(`Poll ${newStatus === 'closed' ? 'closed' : 'reopened'} successfully.`);
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error updating poll status:', err);
      setActionNotice('Failed to update poll status.');
      setTimeout(() => setActionNotice(null), 3000);
    } finally {
      setProcessingPollId(null);
    }
  };

  // Admin Delete Poll
  const handleConfirmDeletePoll = async (pollId: string) => {
    if (!isCurrentUserAdmin || processingPollId) return;

    setProcessingPollId(pollId);
    try {
      // 1. Try deleting votes subcollection first if present
      try {
        const votesSnap = await getDocs(collection(db, 'polls', pollId, 'votes'));
        if (!votesSnap.empty) {
          const batch = writeBatch(db);
          votesSnap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (subErr) {
        console.warn('Note deleting subcollection votes:', subErr);
      }

      // 2. Delete poll document
      await deleteDoc(doc(db, 'polls', pollId));
      
      // Immediately reflect deletion in local UI state
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      setPollToDelete(null);
      setActionNotice('Poll deleted permanently from database.');
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err) {
      console.error('Error deleting poll:', err);
      setActionNotice('Failed to delete poll from database.');
      setTimeout(() => setActionNotice(null), 3500);
    } finally {
      setProcessingPollId(null);
    }
  };

  // Calculate format time remaining
  const formatTimeRemaining = (expiresTimestamp: number) => {
    const diff = expiresTimestamp - now;
    if (diff <= 0) return 'Time Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return `${days}d ${remHours}h left`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s left`;
    }

    return `${minutes}m ${seconds}s left`;
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25">
              <Vote size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Batch Polling & Voting
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isFirebaseConnected
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {isFirebaseConnected ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
                  {isFirebaseConnected ? 'Cloud Live' : 'Connecting...'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Tejashwi 23 - Authentic, One-Student-One-Vote Decision Making
              </p>
            </div>
          </div>
        </div>

        {/* User Account / Create Poll Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/25 shadow-xs text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Avatar"
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {userProfile?.fullName || currentUser.displayName || 'Cadet'}
                </span>
                {isCurrentUserAdmin ? (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm">
                    <ShieldAlert size={10} /> Admin
                  </span>
                ) : userProfile?.rollNumber ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                    (Roll {userProfile.rollNumber})
                  </span>
                ) : null}
              </div>
              <button
                onClick={() => signOut(auth)}
                className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-500 transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmittingAuth}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#082218] border border-emerald-900/20 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isSubmittingAuth ? 'Signing in...' : 'Sign in to Vote'}</span>
            </button>
          )}

          {/* Admin Create Poll Button */}
          {isCurrentUserAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Create New Poll</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-emerald-950 dark:border dark:border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sign-in Callout if guest */}
      {!currentUser && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Lock size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">
              Sign in with Google to cast your vote and make your voice count. Each student can cast exactly one vote per poll.
            </span>
          </div>
          <button
            onClick={handleGoogleSignIn}
            disabled={isSubmittingAuth}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
          >
            Sign in with Google
          </button>
        </div>
      )}

      {/* Poll Creation Modal (Admin Only) */}
      {showCreateModal && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#051c14] border border-emerald-900/20 dark:border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                <PlusCircle size={20} />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Create Batch Poll
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Poll Question / Topic *
                </label>
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g., Which topic should we review in the next study session?"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#03130d] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Context / Description (Optional)
                </label>
                <textarea
                  value={pollDescription}
                  onChange={(e) => setPollDescription(e.target.value)}
                  placeholder="Additional instructions or notes for batchmates..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#03130d] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Voting Options (Minimum 2)
                </label>
                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 text-xs font-mono font-bold text-slate-400">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const copy = [...pollOptions];
                          copy[idx] = e.target.value;
                          setPollOptions(copy);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        required
                        className="flex-1 px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#03130d] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionField(idx)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pollOptions.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddOptionField}
                    className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <PlusCircle size={14} /> Add Another Option
                  </button>
                )}
              </div>

              {/* Timed Poll Setting */}
              <div className="pt-2 border-t border-emerald-900/10 dark:border-emerald-500/15">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Automatic Timer
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTimed}
                      onChange={(e) => setIsTimed(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {isTimed && (
                  <div className="p-3 bg-emerald-50/50 dark:bg-[#03140e] rounded-xl border border-emerald-500/20 space-y-2 animate-in fade-in">
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Poll will automatically close to new votes once the time limit expires.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Standard Duration
                        </label>
                        <select
                          value={timerDurationHours}
                          onChange={(e) => {
                            setTimerDurationHours(e.target.value);
                            setCustomTimerMinutes('');
                          }}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#051c14] border border-emerald-900/15 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="1">1 Hour</option>
                          <option value="3">3 Hours</option>
                          <option value="6">6 Hours</option>
                          <option value="12">12 Hours</option>
                          <option value="24">24 Hours (1 Day)</option>
                          <option value="48">48 Hours (2 Days)</option>
                          <option value="72">72 Hours (3 Days)</option>
                          <option value="168">7 Days</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Or Custom Minutes
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 30"
                          value={customTimerMinutes}
                          onChange={(e) => setCustomTimerMinutes(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#051c14] border border-emerald-900/15 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPoll}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isCreatingPoll ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Poll</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {pollToDelete && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#051c14] border border-rose-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Delete Poll
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin Action • Irreversible Cloud Deletion
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-100">"{pollToDelete.question}"</strong>? All cast votes will also be permanently deleted from the database.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={processingPollId === pollToDelete.id}
                onClick={() => setPollToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingPollId === pollToDelete.id}
                onClick={() => handleConfirmDeletePoll(pollToDelete.id)}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {processingPollId === pollToDelete.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting from Database...</span>
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

      {/* Polls List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
          <Loader2 size={32} className="animate-spin text-emerald-600 dark:text-emerald-400 mb-3" />
          <p className="text-sm font-semibold">Loading batch polls...</p>
        </div>
      ) : polls.length === 0 ? (
        <div className="p-12 text-center bg-white/70 dark:bg-[#061e16]/60 rounded-3xl border border-emerald-900/10 dark:border-emerald-500/20 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <Vote size={28} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            No active polls right now
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {isCurrentUserAdmin 
              ? 'Click "Create New Poll" above to ask a question to the batch.' 
              : 'Polls will appear here when posted by the Admin. Check back soon!'}
          </p>
          {isCurrentUserAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle size={15} /> Create First Poll
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const votesMap = votesByPoll[poll.id] || {};
            const totalVotes = Object.keys(votesMap).length;
            const myVote = currentUser ? votesMap[currentUser.uid] : undefined;
            const hasVoted = !!myVote;

            const isExpired = !!(poll.expiresTimestamp && now >= poll.expiresTimestamp);
            const isPollClosed = poll.status === 'closed' || isExpired;

            // Vote counts per option
            const countsByOption: Record<string, number> = {};
            poll.options.forEach((opt) => {
              countsByOption[opt.id] = 0;
            });
            Object.values(votesMap).forEach((voteItem) => {
              const v = voteItem as PollVote;
              if (v?.optionId && countsByOption[v.optionId] !== undefined) {
                countsByOption[v.optionId] += 1;
              }
            });

            const selectedOption = selectedOptionByPoll[poll.id] || myVote?.optionId || '';

            return (
              <div
                key={poll.id}
                className="bg-white/90 dark:bg-[#061e16]/80 backdrop-blur-md rounded-3xl border border-emerald-900/10 dark:border-emerald-500/20 shadow-md p-5 sm:p-7 transition-all"
              >
                {/* Poll Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        isPollClosed
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isPollClosed ? 'Closed Poll' : 'Active Poll'}
                      </span>

                      {poll.isTimed && poll.expiresTimestamp && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                          isExpired
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          <Clock size={11} />
                          {isExpired ? 'Time Expired' : formatTimeRemaining(poll.expiresTimestamp)}
                        </span>
                      )}

                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} recorded
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {poll.question}
                    </h2>

                    {poll.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {poll.description}
                      </p>
                    )}
                  </div>

                  {/* Admin Controls on Poll */}
                  {isCurrentUserAdmin && (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => handleToggleClosePoll(poll)}
                        disabled={processingPollId === poll.id}
                        title={poll.status === 'active' ? 'Close poll to new votes' : 'Re-open poll'}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-[#092b1f] hover:bg-slate-200 dark:hover:bg-[#0d3b2b] text-slate-700 dark:text-slate-300 border border-emerald-900/10 dark:border-emerald-500/20 transition-all flex items-center gap-1"
                      >
                        {processingPollId === poll.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : poll.status === 'active' ? (
                          'Close Poll'
                        ) : (
                          'Reopen'
                        )}
                      </button>

                      <button
                        onClick={() => setPollToDelete(poll)}
                        disabled={processingPollId === poll.id}
                        title="Permanently delete poll from database"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Voting Options & Results */}
                <div className="space-y-2.5 my-4">
                  {poll.options.map((option) => {
                    const count = countsByOption[option.id] || 0;
                    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isMyChoice = myVote?.optionId === option.id;
                    const isSelectedInUI = selectedOption === option.id;

                    return (
                      <div
                        key={option.id}
                        onClick={() => {
                          if (!isPollClosed && currentUser) {
                            setSelectedOptionByPoll((prev) => ({ ...prev, [poll.id]: option.id }));
                          }
                        }}
                        className={`relative overflow-hidden rounded-2xl p-3.5 border transition-all cursor-pointer ${
                          isMyChoice
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500/40'
                            : isSelectedInUI && !isPollClosed
                            ? 'border-emerald-400 bg-slate-50 dark:bg-[#092b1f]'
                            : 'border-slate-200 dark:border-emerald-500/20 bg-slate-50/50 dark:bg-[#03140e]/60 hover:border-emerald-300 dark:hover:border-emerald-500/40'
                        } ${isPollClosed ? 'cursor-default' : ''}`}
                      >
                        {/* Progress Bar Background */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 pointer-events-none ${
                            isMyChoice
                              ? 'bg-emerald-500/20 dark:bg-emerald-500/25'
                              : 'bg-emerald-400/10 dark:bg-emerald-600/15'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                              isMyChoice
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : isSelectedInUI && !isPollClosed
                                ? 'border-emerald-500 bg-emerald-500/20'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}>
                              {isMyChoice && <CheckCircle2 size={12} />}
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                              {option.text}
                            </span>
                            {isMyChoice && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/15 px-2 py-0.5 rounded-md">
                                Your Vote
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span>{percentage}%</span>
                            <span className="text-[11px] text-slate-400 font-normal">({count})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action to Submit or Status */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-emerald-900/10 dark:border-emerald-500/15 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {hasVoted ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> You voted in this poll
                      </span>
                    ) : isPollClosed ? (
                      <span className="text-slate-400">Voting has ended for this poll.</span>
                    ) : (
                      <span>Select an option above to cast or change your vote.</span>
                    )}
                  </div>

                  {!isPollClosed && currentUser && selectedOption && selectedOption !== myVote?.optionId && (
                    <button
                      onClick={() => handleCastVote(poll, selectedOption)}
                      disabled={submittingVotePollId === poll.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 self-end sm:self-auto"
                    >
                      {submittingVotePollId === poll.id ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Casting Vote...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={13} />
                          <span>{hasVoted ? 'Change Vote' : 'Confirm Vote'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Poll Confirmation Modal */}
      {pollToDelete && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#051c14] border border-rose-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/25">
              <Trash2 size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Delete Poll?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-200">&quot;{pollToDelete.question}&quot;</strong> and all of its cast votes? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPollToDelete(null)}
                disabled={processingPollId === pollToDelete.id}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDeletePoll(pollToDelete.id)}
                disabled={processingPollId === pollToDelete.id}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all flex items-center gap-2"
              >
                {processingPollId === pollToDelete.id ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Poll</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
