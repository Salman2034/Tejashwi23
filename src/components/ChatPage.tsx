import { useState, useEffect, useRef, type FormEvent } from 'react';
import { 
  Send, MessageSquare, Hash, LogOut, 
  Wifi, WifiOff, Lock, AlertCircle, ShieldCheck, User, ShieldAlert,
  Edit2, Check, X, Trash2, Loader2, UserX
} from 'lucide-react';
import { 
  collection, query, orderBy, limit, onSnapshot, addDoc, doc, setDoc, getDoc, getDocs, where,
  deleteDoc, writeBatch
} from 'firebase/firestore';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { ChatMessage, INITIAL_CHAT_MESSAGES } from '../data/chat';
import { useNotifications } from '../context/NotificationContext';

const ADMIN_EMAIL = 'cadetsalman2034@gmail.com';

const CHANNELS = [
  { id: 'batch', name: 'General Batch', description: 'Announcements, batch discussions & daily chats' },
  { id: 'academic', name: 'Academic & Q/A', description: 'Lectures, items, cards, practicals & exam queries' },
  { id: 'casual', name: 'Casual & Lounge', description: 'Informal discussions & college life' },
] as const;

export default function ChatPage() {
  const { 
    chatActiveChannel: activeChannel, 
    setChatActiveChannel: setActiveChannel,
    markMessagesAsRead,
    notifications
  } = useNotifications();

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const isCurrentUserAdmin = (currentUser?.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const [userProfile, setUserProfile] = useState<{ fullName?: string; rollNumber?: string; role?: string } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // First-time Roll Prompt
  const [promptRoll, setPromptRoll] = useState('');
  const [isSavingRoll, setIsSavingRoll] = useState(false);
  const [showRollPrompt, setShowRollPrompt] = useState(false);
  const [rollPromptError, setRollPromptError] = useState<string | null>(null);

  // Profile Edit Modal / State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRoll, setEditRoll] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Admin Clear Chat Modal & States
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [clearScope, setClearScope] = useState<'channel' | 'all'>('channel');
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [adminActionNotice, setAdminActionNotice] = useState<string | null>(null);

  // Ban / Unban States
  const [isBanned, setIsBanned] = useState<boolean>(false);
  const [bannedUsersList, setBannedUsersList] = useState<{uid: string, email?: string, name?: string, bannedByName?: string, bannedAt: number, reason?: string}[]>([]);
  const [showBanManagementModal, setShowBanManagementModal] = useState(false);
  const [showBanConfirmModal, setShowBanConfirmModal] = useState(false);
  const [userToBan, setUserToBan] = useState<{uid: string, email: string, name: string} | null>(null);
  const [banReason, setBanReason] = useState<string>('');
  const [isBanningUser, setIsBanningUser] = useState<boolean>(false);

  // Chat message input
  const [inputText, setInputText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRenderRef = useRef(true);
  const prevMessagesCountRef = useRef(0);

  // Check if roll is already taken by another student
  const checkRollAvailability = async (roll: string, currentUid: string): Promise<boolean> => {
    const formattedRoll = roll.trim();
    if (!formattedRoll) return true;

    try {
      const q = query(
        collection(db, 'users'),
        where('rollNumber', '==', formattedRoll)
      );
      const snapshot = await getDocs(q);
      const existsOther = snapshot.docs.some(d => d.id !== currentUid);
      return !existsOther;
    } catch (e) {
      console.warn('Roll check query note:', e);
      return true;
    }
  };

  // Monitor Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const isAdmin = (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

          if (userDoc.exists()) {
            const data = userDoc.data() as { fullName?: string; rollNumber?: string; role?: string };
            const effectiveRole = isAdmin ? 'admin' : 'student';
            const profileData = {
              fullName: data.fullName || user.displayName || 'Cadet',
              rollNumber: data.rollNumber || (isAdmin ? '01' : ''),
              role: effectiveRole,
            };
            setUserProfile(profileData);

            if (isAdmin && data.role !== 'admin') {
              await setDoc(doc(db, 'users', user.uid), { role: 'admin' }, { merge: true });
            }

            if (!data.rollNumber && !isAdmin) {
              setShowRollPrompt(true);
            } else {
              setShowRollPrompt(false);
            }
          } else {
            const defaultRoll = isAdmin ? '01' : '';
            const role = isAdmin ? 'admin' : 'student';
            const name = user.displayName || (isAdmin ? 'Salman Sami' : 'Cadet');

            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              fullName: name,
              email: user.email,
              rollNumber: defaultRoll,
              role,
              createdAt: Date.now(),
            });

            setUserProfile({ fullName: name, rollNumber: defaultRoll, role });
            if (!defaultRoll && !isAdmin) {
              setShowRollPrompt(true);
            } else {
              setShowRollPrompt(false);
            }
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setUserProfile(null);
        setShowRollPrompt(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Monitor if the current logged-in user is banned in real-time
  useEffect(() => {
    if (!currentUser) {
      setIsBanned(false);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'bannedUsers', currentUser.uid), (docSnap) => {
      setIsBanned(docSnap.exists());
    }, (error) => {
      console.warn('Banned check subscription note:', error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Subscribes to full banned list for Admins only
  useEffect(() => {
    if (!isCurrentUserAdmin) {
      setBannedUsersList([]);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, 'bannedUsers'), (snapshot) => {
      const list = snapshot.docs.map(d => ({
        uid: d.id,
        ...d.data()
      })) as any[];
      setBannedUsersList(list);
    }, (error) => {
      console.warn('Banned list subscription note:', error);
    });
    return () => unsubscribe();
  }, [isCurrentUserAdmin]);

  // Real-time listener for Firestore collection across all users/devices
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'chatMessages'),
        orderBy('timestamp', 'asc'),
        limit(300)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const firestoreMsgs: ChatMessage[] = snapshot.docs.map((d) => {
              const data = d.data();
              const isAdmin = (data.senderEmail || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
              return {
                id: d.id,
                senderUid: data.senderUid || '',
                senderName: data.senderName || 'Cadet',
                senderEmail: data.senderEmail,
                rollNumber: data.rollNumber || undefined,
                role: isAdmin ? 'admin' : (data.role === 'admin' ? 'admin' : 'student'),
                text: data.text || '',
                timestamp: data.timestamp || Date.now(),
                channel: data.channel || 'batch',
              };
            });
            setMessages(firestoreMsgs);
          } else {
            setMessages([]);
          }
        },
        (error) => {
          console.warn('Firestore snapshot listener note:', error);
          setIsFirebaseConnected(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Firebase connection error:', err);
      setIsFirebaseConnected(false);
    }
  }, []);

  // Keep scroll focused at the top of the page when opening Chat, and scroll only inside the messages box
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    markMessagesAsRead(activeChannel);
  }, [activeChannel, markMessagesAsRead]);

  // Scroll to bottom strictly INSIDE the chat container, never moving the entire window/page
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    if (isFirstRenderRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      isFirstRenderRef.current = false;
      prevMessagesCountRef.current = messages.length;
      return;
    }

    // When channel changes or new message is received, smoothly scroll inside the container only
    if (messages.length !== prevMessagesCountRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      prevMessagesCountRef.current = messages.length;
    }
  }, [messages, activeChannel]);

  // Exclusive Google One-Click Sign-In
  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmittingAuth(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      
      // If user intentionally closed or cancelled the popup, do not show a harsh error
      if (
        firebaseError?.code === 'auth/popup-closed-by-user' ||
        firebaseError?.code === 'auth/cancelled-popup-request'
      ) {
        // User voluntarily dismissed popup
        setAuthError(null);
      } else if (firebaseError?.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (firebaseError?.code === 'auth/unauthorized-domain') {
        setAuthError('This domain is pending authorization in Firebase Console (Authentication > Settings > Authorized domains).');
      } else if (firebaseError?.code === 'auth/network-request-failed') {
        setAuthError('Network error. Please check your internet connection and try again.');
      } else {
        console.warn('Google sign-in notification:', err);
        setAuthError(firebaseError?.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // First-time Roll Number Submission
  const handleSaveRoll = async (e: FormEvent) => {
    e.preventDefault();
    setRollPromptError(null);
    if (!currentUser || !promptRoll.trim() || isSavingRoll) return;

    const trimmedRoll = promptRoll.trim();
    setIsSavingRoll(true);

    try {
      const isAvailable = await checkRollAvailability(trimmedRoll, currentUser.uid);
      if (!isAvailable) {
        setRollPromptError(`Roll ${trimmedRoll} has already been registered by another student.`);
        setIsSavingRoll(false);
        return;
      }

      const isAdmin = (currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        fullName: userProfile?.fullName || currentUser.displayName || 'Cadet',
        email: currentUser.email,
        rollNumber: trimmedRoll,
        role: isAdmin ? 'admin' : 'student',
        updatedAt: Date.now(),
      }, { merge: true });

      setUserProfile(prev => ({ 
        fullName: prev?.fullName || currentUser.displayName || 'Cadet',
        rollNumber: trimmedRoll, 
        role: isAdmin ? 'admin' : 'student' 
      }));
      setShowRollPrompt(false);
      setPromptRoll('');
    } catch (err) {
      console.error('Error saving roll:', err);
      setRollPromptError('Could not save roll number. Please try again.');
    } finally {
      setIsSavingRoll(false);
    }
  };

  // Open profile editor
  const handleOpenEditProfile = () => {
    setProfileError(null);
    setProfileSuccess(null);
    setEditName(userProfile?.fullName || currentUser?.displayName || '');
    setEditRoll(userProfile?.rollNumber || '');
    setIsEditingProfile(true);
  };

  // Save Name & Roll to Firebase
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSavingProfile) return;

    const newName = editName.trim();
    const newRoll = editRoll.trim();

    if (!newName) {
      setProfileError('Name cannot be empty.');
      return;
    }

    const isAdmin = (currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

    setIsSavingProfile(true);
    setProfileError(null);

    try {
      if (newRoll && (!userProfile?.rollNumber || userProfile.rollNumber !== newRoll)) {
        const isAvailable = await checkRollAvailability(newRoll, currentUser.uid);
        if (!isAvailable) {
          setProfileError(`Roll ${newRoll} is already in use by another student. Please choose your correct roll.`);
          setIsSavingProfile(false);
          return;
        }
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        fullName: newName,
        rollNumber: newRoll,
        role: isAdmin ? 'admin' : 'student',
        updatedAt: Date.now(),
      }, { merge: true });

      setUserProfile(prev => ({
        fullName: newName,
        rollNumber: newRoll,
        role: isAdmin ? 'admin' : (prev?.role || 'student'),
      }));

      setProfileSuccess('Profile updated successfully in Firebase!');
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess(null);
      }, 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !currentUser || isBanned) return;

    const senderName = userProfile?.fullName || currentUser.displayName || currentUser.email?.split('@')[0] || 'EWMC Cadet';
    const senderEmail = currentUser.email || '';
    const senderUid = currentUser.uid;
    const roll = userProfile?.rollNumber || '';
    const isAdmin = senderEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const textToSend = inputText.trim();

    const newMsgData = {
      senderUid,
      senderName,
      senderEmail,
      rollNumber: roll,
      role: (isAdmin ? 'admin' : 'student') as 'admin' | 'student',
      text: textToSend,
      timestamp: Date.now(),
      channel: activeChannel,
    };

    setIsSending(true);
    setInputText('');

    try {
      await addDoc(collection(db, 'chatMessages'), newMsgData);
    } catch (err) {
      console.error('Error sending message:', err);
      setAuthError('Failed to deliver message. Please check connection.');
    } finally {
      setIsSending(false);
    }
  };

  // Admin Single Message Delete
  const handleDeleteMessage = async (messageId: string) => {
    if (!isCurrentUserAdmin || deletingMessageId) return;
    setDeletingMessageId(messageId);
    try {
      await deleteDoc(doc(db, 'chatMessages', messageId));
      setAdminActionNotice('Message deleted from database.');
      setTimeout(() => setAdminActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to delete message:', err);
      setAdminActionNotice('Could not delete message. Check permissions.');
      setTimeout(() => setAdminActionNotice(null), 4000);
    } finally {
      setDeletingMessageId(null);
    }
  };

  // Admin Clear Entire Channel or Whole Database Chat
  const handleClearChatConfirmed = async () => {
    if (!isCurrentUserAdmin || isClearingChat) return;
    setIsClearingChat(true);

    try {
      let q;
      if (clearScope === 'channel') {
        q = query(
          collection(db, 'chatMessages'),
          where('channel', '==', activeChannel)
        );
      } else {
        q = query(collection(db, 'chatMessages'));
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setAdminActionNotice('No messages found to delete.');
        setIsClearingChat(false);
        setShowClearConfirmModal(false);
        setTimeout(() => setAdminActionNotice(null), 3000);
        return;
      }

      // Firestore batches up to 500 writes
      const docsToDelete = snapshot.docs;
      const chunkSize = 400;
      for (let i = 0; i < docsToDelete.length; i += chunkSize) {
        const chunk = docsToDelete.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }

      const clearedLabel = clearScope === 'channel' 
        ? `#${CHANNELS.find(c => c.id === activeChannel)?.name}` 
        : 'All Channels';

      setAdminActionNotice(`Successfully cleared chat history for ${clearedLabel} from database.`);
      setShowClearConfirmModal(false);
      setTimeout(() => setAdminActionNotice(null), 4000);
    } catch (err) {
      console.error('Error clearing chat from database:', err);
      setAdminActionNotice('Failed to clear chat from database.');
      setTimeout(() => setAdminActionNotice(null), 4000);
    } finally {
      setIsClearingChat(false);
    }
  };

  const handleBanUserClick = (uid: string, email: string, name: string) => {
    setUserToBan({ uid, email, name });
    setBanReason('');
    setShowBanConfirmModal(true);
  };

  const handleConfirmBan = async () => {
    if (!userToBan || !isCurrentUserAdmin || isBanningUser) return;
    setIsBanningUser(true);
    try {
      await setDoc(doc(db, 'bannedUsers', userToBan.uid), {
        uid: userToBan.uid,
        email: userToBan.email || '',
        name: userToBan.name,
        bannedByName: userProfile?.fullName || currentUser?.displayName || 'Admin',
        bannedAt: Date.now(),
        reason: banReason.trim() || 'No reason provided'
      });
      setAdminActionNotice(`User ${userToBan.name} has been banned.`);
      setShowBanConfirmModal(false);
      setUserToBan(null);
      setTimeout(() => setAdminActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to ban user:', err);
      setAdminActionNotice('Failed to ban user. Check permissions.');
      setTimeout(() => setAdminActionNotice(null), 4000);
    } finally {
      setIsBanningUser(false);
    }
  };

  const handleUnbanUser = async (uid: string, name: string) => {
    if (!isCurrentUserAdmin) return;
    try {
      await deleteDoc(doc(db, 'bannedUsers', uid));
      setAdminActionNotice(`User ${name} has been unbanned.`);
      setTimeout(() => setAdminActionNotice(null), 3000);
    } catch (err) {
      console.error('Failed to unban user:', err);
      setAdminActionNotice('Failed to unban user.');
      setTimeout(() => setAdminActionNotice(null), 4000);
    }
  };


  const currentChannelMessages = messages.filter((m) => (m.channel || 'batch') === activeChannel);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/25">
              <MessageSquare size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Batch Live Chat
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
                Tejashwi 23 - East West Medical College Batch Discussion
              </p>
            </div>
          </div>
        </div>

        {/* User Account Pill with Click to Edit */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEditProfile}
              title="Click to edit your name and roll number"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0a231b] hover:bg-emerald-50/60 dark:hover:bg-[#0e2c22] border border-emerald-900/15 dark:border-emerald-500/25 shadow-sm text-xs transition-all group cursor-pointer text-left"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={userProfile?.fullName || 'Avatar'}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/30 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {userProfile?.fullName || currentUser.displayName || 'Cadet'}
                </span>
                {isCurrentUserAdmin ? (
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                    <ShieldAlert size={11} /> Admin
                  </span>
                ) : userProfile?.rollNumber ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    (Roll {userProfile.rollNumber})
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 underline font-semibold">
                    Set Roll
                  </span>
                )}
                <Edit2 size={12} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ml-1 transition-colors" />
              </div>
            </button>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-xl bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shadow-sm"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Admin Action Notification */}
      {adminActionNotice && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-900 text-white dark:bg-emerald-950 dark:border dark:border-emerald-500/30 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400 shrink-0" />
            <span>{adminActionNotice}</span>
          </div>
          <button onClick={() => setAdminActionNotice(null)} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Admin Clear Chat Confirmation Modal */}
      {showClearConfirmModal && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#051c14] border border-rose-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Delete Chat from Database
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin Action • Irreversible Cloud Deletion
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Select what you want to delete from the Firestore database:
            </p>

            <div className="space-y-2 mb-5">
              <button
                type="button"
                onClick={() => setClearScope('channel')}
                className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between ${
                  clearScope === 'channel'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#06241a]'
                }`}
              >
                <div>
                  <div className="font-bold">Only #{CHANNELS.find(c => c.id === activeChannel)?.name} Channel</div>
                  <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                    Deletes only messages currently posted in this specific channel.
                  </div>
                </div>
                {clearScope === 'channel' && <Check size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setClearScope('all')}
                className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-semibold border transition-all flex items-center justify-between ${
                  clearScope === 'all'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                    : 'border-slate-200 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#06241a]'
                }`}
              >
                <div>
                  <div className="font-bold">Entire Batch Chat Database (All Channels)</div>
                  <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                    Permanently purges all messages across General Batch, Academic, and Casual lounges.
                  </div>
                </div>
                {clearScope === 'all' && <Check size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isClearingChat}
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingChat}
                onClick={handleClearChatConfirmed}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {isClearingChat ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Purging Cloud Data...</span>
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

      {/* Edit Profile Modal */}
      {isEditingProfile && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#051c14] border border-emerald-900/20 dark:border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                <Edit2 size={18} />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Edit Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Update your display name and roll number. Changes are saved to Firebase and reflected in the chat.
            </p>

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check size={16} className="shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#03130d] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Roll Number
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Unique to each student
                  </span>
                </div>
                <input
                  type="text"
                  value={editRoll}
                  onChange={(e) => setEditRoll(e.target.value)}
                  placeholder="e.g. 23"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#03130d] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Duplicate roll numbers are prevented to prevent impersonation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* First-time Roll Prompt Banner if roll is missing */}
      {currentUser && showRollPrompt && !isCurrentUserAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <User size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Set your EWMC Roll Number so batchmates can recognize you (saved once and never asked again):
              </span>
              {rollPromptError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                  {rollPromptError}
                </p>
              )}
            </div>
          </div>
          <form onSubmit={handleSaveRoll} className="flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="e.g. 23"
              value={promptRoll}
              onChange={(e) => setPromptRoll(e.target.value)}
              required
              className="w-24 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#04130d] border border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <button
              type="submit"
              disabled={isSavingRoll}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Save Roll
            </button>
          </form>
        </div>
      )}

      {/* Login Banner for Google authentication only */}
      {!isAuthLoading && !currentUser && (
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/40 dark:from-[#06241a] dark:via-[#041a12] dark:to-[#03130d] border border-emerald-300/60 dark:border-emerald-500/30 shadow-lg animate-in fade-in">
          <div className="max-w-md mx-auto text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/25">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1.5">
              Sign In to Join Batch Chat
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Sign in securely with your Google account to send verified messages, prevent impersonation, and connect with Tejashwi 23 batchmates.
            </p>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmittingAuth}
              className="w-full py-3.5 px-4 bg-white dark:bg-[#03140e] hover:bg-slate-50 dark:hover:bg-[#051c14] border border-slate-300 dark:border-emerald-500/30 text-slate-800 dark:text-slate-200 font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 hover:shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isSubmittingAuth ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white/90 dark:bg-[#061d15]/80 backdrop-blur-md rounded-[2rem] border border-emerald-900/10 dark:border-emerald-500/20 shadow-xl overflow-hidden min-h-[560px]">
        {/* Sidebar Channels */}
        <div className="p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-emerald-900/10 dark:border-emerald-500/15 bg-slate-50/70 dark:bg-[#03130d]/50 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 px-2">
              Discussion Channels
            </div>
            <div className="space-y-1.5">
              {CHANNELS.map((ch) => {
                const isActive = activeChannel === ch.id;
                const count = messages.filter((m) => (m.channel || 'batch') === ch.id).length;
                const unreadForChannel = notifications.filter(
                  (n) => n.type === 'message' && !n.read && n.channelId === ch.id
                ).length;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer relative ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative">
                        <Hash size={18} className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
                        {unreadForChannel > 0 && !isActive && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-white dark:ring-[#03130d] animate-pulse" />
                        )}
                      </div>
                      <span className="font-semibold text-sm truncate">{ch.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadForChannel > 0 && !isActive && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white">
                          {unreadForChannel}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-900/10 dark:border-emerald-500/15 px-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
              <ShieldCheck size={14} /> Verified Identity
            </div>
            Signed-in with Google to ensure authentic batch discussions.
          </div>
        </div>

        {/* Message Feed & Input */}
        <div className="lg:col-span-3 flex flex-col h-[560px] sm:h-[620px]">
          {/* Active Channel Header */}
          <div className="p-4 px-6 border-b border-emerald-900/10 dark:border-emerald-500/15 bg-emerald-50/40 dark:bg-[#04160f]/60 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                  {CHANNELS.find((c) => c.id === activeChannel)?.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {CHANNELS.find((c) => c.id === activeChannel)?.description}
              </p>
            </div>

            {/* Admin Delete / Clear Chat Controls */}
            {isCurrentUserAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBanManagementModal(true)}
                  title="Manage banned users"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/25 text-xs font-bold transition-all shadow-xs"
                >
                  <UserX size={14} />
                  <span className="hidden sm:inline">Banned Users</span>
                  {bannedUsersList.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-extrabold">
                      {bannedUsersList.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(true)}
                  title="Clear chat messages from database"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/25 text-xs font-bold transition-all shadow-xs"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>
              </div>
            )}
          </div>

          {/* Messages Container */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {currentChannelMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-3">
                  <MessageSquare size={24} />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No messages yet in this channel.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Be the first to post an update or question!</p>
              </div>
            ) : (
              currentChannelMessages.map((msg) => {
                const isMe = currentUser ? msg.senderUid === currentUser.uid : false;
                const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isMsgAdmin = msg.role === 'admin' || (msg.senderEmail || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

                return (
                  <div key={msg.id} className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {msg.senderName}
                        {msg.rollNumber && !isMsgAdmin && (
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-normal">
                            (Roll {msg.rollNumber})
                          </span>
                        )}
                      </span>
                      {isMsgAdmin && (
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                          <ShieldAlert size={10} /> Admin
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{formattedTime}</span>

                      {/* Admin Message Delete & Ban Triggers */}
                      {isCurrentUserAdmin && (
                        <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={deletingMessageId === msg.id}
                            type="button"
                            title="Delete message from database"
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/15 bg-slate-100/80 dark:bg-[#08291e] lg:bg-transparent border border-slate-200/50 dark:border-emerald-800/20 lg:border-none transition-all cursor-pointer active:scale-95"
                          >
                            {deletingMessageId === msg.id ? (
                              <Loader2 size={13} className="animate-spin text-rose-500" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                          
                          {!isMsgAdmin && (
                            <button
                              onClick={() => handleBanUserClick(msg.senderUid, msg.senderEmail || '', msg.senderName)}
                              type="button"
                              title={`Ban ${msg.senderName} from chat`}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-500 hover:bg-amber-500/15 bg-slate-100/80 dark:bg-[#08291e] lg:bg-transparent border border-slate-200/50 dark:border-emerald-800/20 lg:border-none transition-all cursor-pointer active:scale-95"
                            >
                              <UserX size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-[#07241a] text-slate-800 dark:text-slate-100 border border-emerald-900/10 dark:border-emerald-500/20 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Message Input Field */}
          {currentUser ? (
            isBanned ? (
              <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-500/15 bg-rose-50 dark:bg-rose-950/10 text-center flex flex-col items-center justify-center gap-1 animate-in fade-in">
                <ShieldAlert size={20} className="text-rose-600 dark:text-rose-400" />
                <p className="text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">
                  Your chat access has been restricted by an administrator.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  You are currently banned from posting new messages in this batch portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-emerald-900/10 dark:border-emerald-500/15 bg-white/70 dark:bg-[#04160f]/90">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message #${CHANNELS.find((c) => c.id === activeChannel)?.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-[#061e15] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="p-4 border-t border-emerald-900/10 dark:border-emerald-500/15 bg-emerald-50/30 dark:bg-[#04160f]/70 text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Please sign in with your Google account above to send messages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Ban User Confirmation Modal */}
      {showBanConfirmModal && isCurrentUserAdmin && userToBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in animate-duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#051c14] border border-amber-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 animate-duration-150">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <UserX size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Ban Chat Participant
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Admin Action • Chat Restriction
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-5">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to ban <strong className="text-slate-900 dark:text-slate-100">{userToBan.name}</strong> from the chat? This will immediately prevent them from sending messages in any channel.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Ban
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spamming, inappropriate language, off-topic"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#03130d] border border-emerald-900/15 dark:border-emerald-500/25 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isBanningUser}
                onClick={() => {
                  setShowBanConfirmModal(false);
                  setUserToBan(null);
                }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0a231b] rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBanningUser}
                onClick={handleConfirmBan}
                className="px-5 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {isBanningUser ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Banning User...</span>
                  </>
                ) : (
                  <>
                    <UserX size={14} />
                    <span>Confirm Ban</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Banned Users Management Modal */}
      {showBanManagementModal && isCurrentUserAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in animate-duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#051c14] border border-emerald-900/20 dark:border-emerald-500/30 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 animate-duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
                <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/25">
                  <UserX size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">
                    Banned Chat Users
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage restricted accounts ({bannedUsersList.length})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBanManagementModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto mb-5 space-y-2.5 pr-1 custom-scrollbar">
              {bannedUsersList.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <ShieldCheck size={32} className="mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No banned users!</p>
                  <p className="text-xs text-slate-500 mt-1">Excellent! All batchmates currently have chat access.</p>
                </div>
              ) : (
                bannedUsersList.map((user) => (
                  <div key={user.uid} className="p-3.5 rounded-xl border border-slate-100 dark:border-emerald-900/30 bg-slate-50 dark:bg-[#03130d] flex items-start justify-between gap-3 animate-in fade-in animate-duration-150">
                    <div className="space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {user.name || 'Anonymous User'}
                      </div>
                      {user.email && (
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {user.email}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">Reason:</span> {user.reason || 'No reason specified'}
                      </p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">
                        Banned by {user.bannedByName || 'Admin'} on {new Date(user.bannedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnbanUser(user.uid, user.name || 'Anonymous User')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Unban
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowBanManagementModal(false)}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
