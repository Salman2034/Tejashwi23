import { Bell, MessageSquare, AlertCircle, X, ArrowRight, Volume2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationToast() {
  const { 
    activeToast, 
    dismissToast, 
    setActiveTab, 
    setChatActiveChannel, 
    markAsRead, 
    soundEnabled 
  } = useNotifications();

  if (!activeToast) return null;

  const handleAction = () => {
    markAsRead(activeToast.id);
    if (activeToast.linkTab === 'notices') {
      setActiveTab('notices');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeToast.linkTab === 'chat') {
      if (activeToast.channelId) {
        setChatActiveChannel(activeToast.channelId);
      }
      setActiveTab('chat');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    dismissToast();
  };

  const isNotice = activeToast.type === 'notice';

  return (
    <div 
      id="notification-toast-container"
      className="fixed top-14 sm:top-16 right-3 sm:right-6 z-[60] max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto"
    >
      <div className={`p-4 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all relative overflow-hidden ${
        isNotice
          ? activeToast.isImportant
            ? 'bg-red-950/90 dark:bg-red-950/95 text-white border-red-500/40 shadow-red-500/10 ring-1 ring-red-500/30'
            : 'bg-emerald-900/90 dark:bg-[#06241a]/95 text-white border-emerald-500/30 shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : 'bg-slate-900/90 dark:bg-[#051c14]/95 text-white border-emerald-500/25 shadow-emerald-500/10 ring-1 ring-emerald-500/20'
      }`}>
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div className={`h-full animate-toast-progress ${
            isNotice && activeToast.isImportant 
              ? 'bg-red-400' 
              : 'bg-emerald-400'
          }`} />
        </div>

        <div className="flex items-start gap-3 pt-0.5">
          {/* Icon Badge */}
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isNotice
              ? activeToast.isImportant
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {isNotice ? (
              activeToast.isImportant ? <AlertCircle size={20} /> : <Bell size={20} />
            ) : (
              <MessageSquare size={20} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isNotice
                  ? activeToast.isImportant
                    ? 'bg-red-500/30 text-red-200 border border-red-500/40'
                    : 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/30'
                  : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
              }`}>
                {isNotice ? (activeToast.isImportant ? 'Important Notice' : 'Notice Alert') : 'New Batch Message'}
              </span>

              {soundEnabled && (
                <span className="text-[10px] text-white/50 flex items-center gap-0.5" title="Audio chime played">
                  <Volume2 size={11} />
                </span>
              )}
            </div>

            <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
              {activeToast.title}
            </h4>
            <p className="text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
              {activeToast.message}
            </p>

            {/* Action Bar */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={handleAction}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                  isNotice && activeToast.isImportant
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 dark:text-emerald-950 font-black'
                }`}
              >
                <span>{isNotice ? 'View Notice' : 'Open Chat'}</span>
                <ArrowRight size={13} />
              </button>
              
              <button
                type="button"
                onClick={dismissToast}
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close Icon */}
          <button
            type="button"
            onClick={dismissToast}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
