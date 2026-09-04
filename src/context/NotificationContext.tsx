import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../firebase';
import { AppNotification } from '../types';
import { playNoticeSound, playMessageSound } from '../utils/audio';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  unreadNoticesCount: number;
  unreadMessagesCount: number;
  activeToast: AppNotification | null;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  browserPermission: NotificationPermission;
  toggleSound: () => void;
  requestBrowserPermission: () => Promise<boolean>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  markNoticesAsRead: () => void;
  markMessagesAsRead: (channelId?: string) => void;
  clearAll: () => void;
  dismissToast: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chatActiveChannel: 'batch' | 'academic' | 'casual';
  setChatActiveChannel: (channel: 'batch' | 'academic' | 'casual') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'ewmc_notifications_v1';
const SOUND_KEY = 'ewmc_sound_notifications_enabled';
const LAST_NOTICE_TS_KEY = 'ewmc_last_notice_ts';
const LAST_MSG_TS_KEY = 'ewmc_last_msg_ts';

export function NotificationProvider({ 
  children,
  activeTab,
  setActiveTab,
  chatActiveChannel,
  setChatActiveChannel
}: { 
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chatActiveChannel: 'batch' | 'academic' | 'casual';
  setChatActiveChannel: (channel: 'batch' | 'academic' | 'casual') => void;
}) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInitialNoticesLoad = useRef(true);
  const isInitialChatLoad = useRef(true);
  const latestNoticeTsRef = useRef<number>(
    (() => {
      try {
        return Number(localStorage.getItem(LAST_NOTICE_TS_KEY)) || Date.now();
      } catch {
        return Date.now();
      }
    })()
  );
  const latestMsgTsRef = useRef<number>(
    (() => {
      try {
        return Number(localStorage.getItem(LAST_MSG_TS_KEY)) || Date.now();
      } catch {
        return Date.now();
      }
    })()
  );

  // Track auth state to avoid self-notifying sent messages
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save notifications to storage:', e);
    }
  }, [notifications]);

  // Save sound preference
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch (e) {
      console.warn('Could not save sound pref:', e);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const requestBrowserPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
      return result === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }, []);

  const triggerToast = useCallback((item: AppNotification) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(item);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6500);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(null);
  }, []);

  // Monitor in real-time if the current user is banned, and trigger a prominent notification
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'bannedUsers', currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        const banData = snapshot.data();
        const banId = `ban-${currentUser.uid}-${banData.bannedAt || Date.now()}`;
        
        setNotifications((prev) => {
          if (prev.some((n) => n.id === banId)) return prev;
          
          const banNotice: AppNotification = {
            id: banId,
            type: 'notice',
            title: '⚠️ Chat Access Restricted',
            message: `Your chat access has been suspended. Reason: ${banData.reason || 'No reason specified'}. Contact Admin at cadetsalman2034@gmail.com if you think this is a misunderstanding.`,
            timestamp: banData.bannedAt || Date.now(),
            read: false,
            linkTab: 'chat',
            isImportant: true,
          };
          
          triggerToast(banNotice);
          if (soundEnabledRef.current) {
            playNoticeSound();
          }
          return [banNotice, ...prev.filter(n => !n.id.startsWith('ban-'))];
        });
      }
    }, (error) => {
      console.warn('Current user ban subscription note:', error);
    });
    return () => unsub();
  }, [currentUser, triggerToast]);

  const sendBrowserNotification = useCallback((item: AppNotification) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const n = new Notification(item.title, {
        body: item.message,
        icon: '/Ewmch-bg.png',
        tag: item.id,
      });

      n.onclick = () => {
        window.focus();
        if (item.linkTab === 'notices') {
          setActiveTab('notices');
        } else if (item.linkTab === 'chat') {
          if (item.channelId) setChatActiveChannel(item.channelId);
          setActiveTab('chat');
        }
        n.close();
      };
    } catch (e) {
      console.warn('Browser notification error:', e);
    }
  }, [setActiveTab, setChatActiveChannel]);

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const chatActiveChannelRef = useRef(chatActiveChannel);
  chatActiveChannelRef.current = chatActiveChannel;

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // 1. Realtime Listener for New Notices
  useEffect(() => {
    let isFirstSnapshot = true;
    try {
      const q = query(collection(db, 'notices'), orderBy('createdTimestamp', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          // Initial snapshot on load: record the latest timestamp, DO NOT fire notifications for existing records
          if (!snapshot.empty) {
            const newest = snapshot.docs[0].data();
            const ts = newest.createdTimestamp || Date.now();
            if (ts > latestNoticeTsRef.current) {
              latestNoticeTsRef.current = ts;
              try {
                localStorage.setItem(LAST_NOTICE_TS_KEY, String(latestNoticeTsRef.current));
              } catch {}
            }
          }
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const docTs = data.createdTimestamp || Date.now();
            
            // Only notify for notices created after the listener was established
            if (docTs > latestNoticeTsRef.current) {
              latestNoticeTsRef.current = docTs;
              try {
                localStorage.setItem(LAST_NOTICE_TS_KEY, String(latestNoticeTsRef.current));
              } catch {}

              const newNoticeNotification: AppNotification = {
                id: `notice-${change.doc.id}-${docTs}`,
                type: 'notice',
                title: data.isImportant ? `⚠️ Important Notice: ${data.title}` : `📢 New Notice: ${data.title}`,
                message: data.content ? (data.content.length > 120 ? `${data.content.substring(0, 117)}...` : data.content) : 'New batch announcement published.',
                timestamp: docTs,
                read: false,
                linkTab: 'notices',
                isImportant: !!data.isImportant,
                noticeId: change.doc.id,
              };

              setNotifications((prev) => [newNoticeNotification, ...prev.filter(p => p.id !== newNoticeNotification.id)]);

              if (soundEnabledRef.current) {
                playNoticeSound();
              }

              triggerToast(newNoticeNotification);
              sendBrowserNotification(newNoticeNotification);
            }
          }
        });
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Notice notification listener error:', e);
    }
  }, [triggerToast, sendBrowserNotification]);

  // 2. Realtime Listener for New Messages
  useEffect(() => {
    let isFirstSnapshot = true;
    try {
      const q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'desc'), limit(15));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (isFirstSnapshot) {
          isFirstSnapshot = false;
          // Initial snapshot on load: record the latest timestamp, DO NOT fire notifications for existing records
          if (!snapshot.empty) {
            const newest = snapshot.docs[0].data();
            const ts = newest.timestamp || Date.now();
            if (ts > latestMsgTsRef.current) {
              latestMsgTsRef.current = ts;
              try {
                localStorage.setItem(LAST_MSG_TS_KEY, String(latestMsgTsRef.current));
              } catch {}
            }
          }
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            const docTs = data.timestamp || Date.now();

            // Do not notify if it's user's own sent message
            const currentU = currentUserRef.current;
            if (currentU && data.senderUid === currentU.uid) {
              if (docTs > latestMsgTsRef.current) {
                latestMsgTsRef.current = docTs;
              }
              return;
            }

            // Only notify for messages created after the listener was established
            if (docTs > latestMsgTsRef.current) {
              latestMsgTsRef.current = docTs;
              try {
                localStorage.setItem(LAST_MSG_TS_KEY, String(latestMsgTsRef.current));
              } catch {}

              const channelName = 
                data.channel === 'academic' ? 'Academic & Q/A' :
                data.channel === 'casual' ? 'Casual Lounge' : 'General Batch';

              const senderDisplay = data.senderName || 'Cadet';
              const roleDisplay = data.role === 'admin' ? ' (Admin)' : (data.rollNumber ? ` (Roll ${data.rollNumber})` : '');

              const newMsgNotification: AppNotification = {
                id: `msg-${change.doc.id}-${docTs}`,
                type: 'message',
                title: `💬 #${channelName}: ${senderDisplay}${roleDisplay}`,
                message: data.text ? (data.text.length > 110 ? `${data.text.substring(0, 107)}...` : data.text) : 'Sent a message in chat.',
                timestamp: docTs,
                read: false,
                linkTab: 'chat',
                channelId: data.channel || 'batch',
                senderName: senderDisplay,
                senderRoll: data.rollNumber,
                senderRole: data.role || 'student',
              };

              setNotifications((prev) => [newMsgNotification, ...prev.filter(p => p.id !== newMsgNotification.id)]);

              // If user is not currently in this specific chat channel, ring chime and toast
              const isLookingAtThisChannel = activeTabRef.current === 'chat' && chatActiveChannelRef.current === (data.channel || 'batch') && document.visibilityState === 'visible';

              if (!isLookingAtThisChannel) {
                if (soundEnabledRef.current) {
                  playMessageSound();
                }
                triggerToast(newMsgNotification);
                sendBrowserNotification(newMsgNotification);
              }
            }
          }
        });
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Chat notification listener error:', e);
    }
  }, [triggerToast, sendBrowserNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target || target.read) return prev;
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const hasUnread = prev.some((n) => !n.read);
      if (!hasUnread) return prev;
      return prev.map((n) => ({ ...n, read: true }));
    });
  }, []);

  const markNoticesAsRead = useCallback(() => {
    setNotifications((prev) => {
      const hasUnread = prev.some((n) => n.type === 'notice' && !n.read);
      if (!hasUnread) return prev;
      return prev.map((n) => (n.type === 'notice' ? { ...n, read: true } : n));
    });
  }, []);

  const markMessagesAsRead = useCallback((channelId?: string) => {
    setNotifications((prev) => {
      const hasUnread = prev.some(
        (n) => n.type === 'message' && !n.read && (!channelId || n.channelId === channelId)
      );
      if (!hasUnread) return prev;
      return prev.map((n) => {
        if (n.type === 'message' && (!channelId || n.channelId === channelId)) {
          return { ...n, read: true };
        }
        return n;
      });
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const unreadNoticesCount = useMemo(() => notifications.filter((n) => n.type === 'notice' && !n.read).length, [notifications]);
  const unreadMessagesCount = useMemo(() => notifications.filter((n) => n.type === 'message' && !n.read).length, [notifications]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    unreadNoticesCount,
    unreadMessagesCount,
    activeToast,
    soundEnabled,
    browserNotificationsEnabled: browserPermission === 'granted',
    browserPermission,
    toggleSound,
    requestBrowserPermission,
    markAsRead,
    markAllAsRead,
    markNoticesAsRead,
    markMessagesAsRead,
    clearAll,
    dismissToast,
    activeTab,
    setActiveTab,
    chatActiveChannel,
    setChatActiveChannel,
  }), [
    notifications,
    unreadCount,
    unreadNoticesCount,
    unreadMessagesCount,
    activeToast,
    soundEnabled,
    browserPermission,
    toggleSound,
    requestBrowserPermission,
    markAsRead,
    markAllAsRead,
    markNoticesAsRead,
    markMessagesAsRead,
    clearAll,
    dismissToast,
    activeTab,
    setActiveTab,
    chatActiveChannel,
    setChatActiveChannel,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
