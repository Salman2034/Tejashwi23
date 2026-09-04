import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Send, User, MessageSquare, Hash, Sparkles, Trash2, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChatMessage, INITIAL_CHAT_MESSAGES } from '../data/chat';

const CHANNELS = [
  { id: 'batch', name: 'General Batch', description: 'Announcements, batch discussions & daily chats' },
  { id: 'academic', name: 'Academic & Q/A', description: 'Lectures, items, cards, practicals & exam queries' },
  { id: 'casual', name: 'Casual & Lounge', description: 'Informal discussions & college life' },
] as const;

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState<'batch' | 'academic' | 'casual'>('batch');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isSending, setIsSending] = useState(false);

  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem('tejashwi_user_name') || '';
  });
  const [rollNumber, setRollNumber] = useState(() => {
    return localStorage.getItem('tejashwi_user_roll') || '';
  });
  const [isIdentitySaved, setIsIdentitySaved] = useState(() => {
    return Boolean(localStorage.getItem('tejashwi_user_name'));
  });

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time listener for Firestore collection across all users/devices
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'chatMessages'),
        orderBy('timestamp', 'asc'),
        limit(150)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setIsFirebaseConnected(true);
          if (!snapshot.empty) {
            const firestoreMsgs: ChatMessage[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                senderName: data.senderName || 'Anonymous',
                rollNumber: data.rollNumber || undefined,
                role: data.role || 'student',
                text: data.text || '',
                timestamp: data.timestamp || Date.now(),
                channel: data.channel || 'batch',
              };
            });
            setMessages(firestoreMsgs);
          } else {
            // Keep default starter messages if DB has no documents yet
            setMessages(INITIAL_CHAT_MESSAGES);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const saveIdentity = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!senderName.trim()) return;
    localStorage.setItem('tejashwi_user_name', senderName.trim());
    localStorage.setItem('tejashwi_user_roll', rollNumber.trim());
    setIsIdentitySaved(true);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const nameToUse = senderName.trim() || 'EWMC Cadet';
    const isCR = rollNumber.trim() === '01' || nameToUse.toLowerCase().includes('salman');
    const textToSend = inputText.trim();

    const newMsgData = {
      senderName: nameToUse,
      rollNumber: rollNumber.trim() || '',
      role: isCR ? 'cr' : 'student',
      text: textToSend,
      timestamp: Date.now(),
      channel: activeChannel,
    };

    setIsSending(true);
    setInputText('');

    try {
      // Write to live cloud database so anyone anywhere sees it instantly
      await addDoc(collection(db, 'chatMessages'), newMsgData);
    } catch (err) {
      console.error('Error sending message to Firebase:', err);
      // Fallback locally in case of network interruption
      setMessages((prev) => [
        ...prev,
        {
          ...newMsgData,
          id: `local-${Date.now()}`,
          role: (newMsgData.role as 'cr' | 'student'),
        },
      ]);
    } finally {
      setIsSending(false);
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
                Real-time multi-device cloud chat for Tejashwi 23 - East West Medical College
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIdentitySaved(false)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white dark:bg-[#0a231b] border border-emerald-900/15 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors shadow-sm"
          >
            <User size={14} />
            {senderName ? `${senderName} ${rollNumber ? `(Roll ${rollNumber})` : ''}` : 'Set My Name'}
          </button>
        </div>
      </div>

      {/* Name / Roll Setup Box if not set */}
      {!isIdentitySaved && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-[#06241a] dark:to-[#041a12] border border-emerald-300/60 dark:border-emerald-500/30 shadow-sm animate-in fade-in">
          <form onSubmit={saveIdentity} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-1">
                Your Full Name or Nickname
              </label>
              <input
                type="text"
                placeholder="e.g. Salman Sami, Tanvir, Ayesha..."
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-[#04130d] border border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-300 mb-1">
                Roll (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 01"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-[#04130d] border border-emerald-300 dark:border-emerald-500/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="pt-0 sm:pt-5 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Save Identity
              </button>
            </div>
          </form>
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
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Hash size={18} className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
                      <span className="font-semibold text-sm truncate">{ch.name}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-900/10 dark:border-emerald-500/15 px-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold mb-1">
              <Sparkles size={14} /> Cloud Synchronized
            </div>
            Messages are delivered in real time to any batchmate connected on mobile or desktop anywhere in the world.
          </div>
        </div>

        {/* Message Feed & Input (3 cols on large screens) */}
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
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
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
                const isMe = msg.senderName === senderName;
                const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {msg.senderName}
                        {msg.rollNumber && (
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-normal">
                            (Roll {msg.rollNumber})
                          </span>
                        )}
                      </span>
                      {msg.role === 'cr' && (
                        <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-500/30">
                          CR
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{formattedTime}</span>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Message Input Field */}
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
        </div>
      </div>
    </div>
  );
}
