import { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  MessageSquare, 
  AlertCircle, 
  CheckCheck, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  X, 
  Globe
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';

export default function NotificationCenter({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    notifications,
    unreadCount,
    unreadNoticesCount,
    unreadMessagesCount,
    soundEnabled,
    browserNotificationsEnabled,
    browserPermission,
    toggleSound,
    requestBrowserPermission,
    markAsRead,
    markAllAsRead,
    clearAll,
    setActiveTab,
    setChatActiveChannel,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'notice' | 'message'>('all');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const handleNotificationClick = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.linkTab === 'notices') {
      setActiveTab('notices');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.linkTab === 'chat') {
      if (item.channelId) {
        setChatActiveChannel(item.channelId);
      }
      setActiveTab('chat');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onClose();
  };

  const handleBrowserPermissionClick = async () => {
    setIsRequestingPermission(true);
    await requestBrowserPermission();
    setIsRequestingPermission(false);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 pt-14 p-2 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        ref={panelRef}
        className="w-full max-w-md bg-white dark:bg-[#051c14] border border-emerald-900/15 dark:border-emerald-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-top-3 duration-300"
      >
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-900/10 dark:border-emerald-500/15 bg-slate-50/80 dark:bg-[#04160f]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <Bell size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live alerts for published notices & batch messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Mute notification chimes' : 'Unmute notification chimes'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Browser Push Permission Banner (if not yet granted) */}
        {!browserNotificationsEnabled && browserPermission !== 'denied' && (
          <div className="p-3 bg-emerald-50/90 dark:bg-[#06291d]/80 border-b border-emerald-500/20 px-4 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Globe size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-tight truncate">
                Get notified even when browsing other tabs
              </p>
            </div>
            <button
              type="button"
              onClick={handleBrowserPermissionClick}
              disabled={isRequestingPermission}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-all shrink-0 cursor-pointer"
            >
              {isRequestingPermission ? 'Enabling...' : 'Enable'}
            </button>
          </div>
        )}

        {/* Filters & Action Bar */}
        <div className="p-3 px-4 border-b border-emerald-900/10 dark:border-emerald-500/15 bg-white dark:bg-[#051c14] flex items-center justify-between gap-2 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/30 p-0.5 rounded-xl border border-emerald-900/10 dark:border-emerald-500/15">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-[#0a261d] text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All {notifications.length > 0 && `(${notifications.length})`}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('notice')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === 'notice'
                  ? 'bg-white dark:bg-[#0a261d] text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Notices</span>
              {unreadNoticesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('message')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                activeFilter === 'message'
                  ? 'bg-white dark:bg-[#0a261d] text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Messages</span>
              {unreadMessagesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          {/* Quick Mark Read / Clear */}
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                title="Mark all as read"
                className="p-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                title="Clear all notifications"
                className="p-1.5 text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center justify-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Bell size={22} />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No notifications right now
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                You'll receive live sound & visual alerts when notices are published or new batch chat messages arrive.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isNotice = item.type === 'notice';
              return (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group relative ${
                    !item.read
                      ? isNotice && item.isImportant
                        ? 'bg-red-50/80 dark:bg-red-950/20 border-red-500/30 hover:bg-red-100/70 dark:hover:bg-red-950/30'
                        : 'bg-emerald-50/80 dark:bg-[#082a1e]/80 border-emerald-500/30 hover:bg-emerald-100/70 dark:hover:bg-[#0c3627]'
                      : 'bg-slate-50/60 dark:bg-black/20 border-slate-200/60 dark:border-white/5 hover:bg-slate-100/80 dark:hover:bg-white/5 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Left Icon */}
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isNotice
                      ? item.isImportant
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                  }`}>
                    {isNotice ? (
                      item.isImportant ? <AlertCircle size={16} /> : <Bell size={16} />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isNotice
                          ? item.isImportant ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'
                          : 'text-teal-700 dark:text-teal-400'
                      }`}>
                        {isNotice ? (item.isImportant ? 'Important Notice' : 'Notice') : 'Batch Chat'}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <h4 className={`text-xs sm:text-sm font-bold leading-snug line-clamp-1 ${
                      !item.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 group-hover:underline">
                      <span>{isNotice ? 'Read Notice' : 'Open in Chat'}</span>
                      <ExternalLink size={11} />
                    </div>
                  </div>

                  {/* Unread Dot Indicator */}
                  {!item.read && (
                    <div className={`w-2.5 h-2.5 rounded-full absolute top-3.5 right-3.5 ${
                      isNotice && item.isImportant ? 'bg-red-500' : 'bg-emerald-500'
                    }`} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
