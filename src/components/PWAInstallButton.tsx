import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'hero' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed or in standalone native container, show subtle native badge or hide
  if (isInstalled) {
    if (variant === 'hero') {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setJustInstalled(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback modal or notice for browsers that don't trigger ambient beforeinstallprompt yet
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'navbar' && (
        <button
          onClick={handleInstallClick}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-emerald-400/30 ${className}`}
          title="Install Tejashwi 23 as Native Mobile App"
        >
          <Smartphone size={15} className="group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Install Native App</span>
          <span className="sm:hidden">Install App</span>
          <Download size={13} className="opacity-80" />
        </button>
      )}

      {variant === 'hero' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-emerald-400/40 w-full sm:w-auto ${className}`}
        >
          <Smartphone size={18} />
          <span>Install Native App</span>
          <Download size={16} className="opacity-90" />
        </button>
      )}

      {variant === 'floating' && (
        <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#061e17] text-emerald-400 border border-emerald-500/40 shadow-2xl hover:bg-[#0b2b22] hover:scale-105 transition-all text-xs font-bold cursor-pointer"
          >
            <Smartphone size={18} className="animate-pulse text-emerald-400" />
            <div className="text-left leading-tight">
              <div className="font-extrabold text-white">Get Native App</div>
              <div className="text-[10px] text-emerald-300/80 font-normal">Offline ready • 1-Tap launch</div>
            </div>
          </button>
        </div>
      )}

      {/* iOS & Browser Fallback Installation Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#07241c] text-white p-6 shadow-2xl border border-emerald-500/30 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30">
                <Smartphone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Install Tejashwi 23 App</h3>
                <p className="text-xs text-emerald-300/80">Add to Home Screen for Native Experience</p>
              </div>
            </div>

            <div className="space-y-3 my-5 text-xs sm:text-sm text-slate-200">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-xs shrink-0">1</span>
                    <p className="leading-relaxed">
                      Tap the <strong className="text-emerald-400 flex inline-flex items-center gap-1 mx-1"><Share size={13} /> Share</strong> icon in your Safari bottom navigation bar.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-xs shrink-0">2</span>
                    <p className="leading-relaxed">
                      Scroll down and select <strong className="text-emerald-400 flex inline-flex items-center gap-1 mx-1"><PlusSquare size={13} /> Add to Home Screen</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-xs shrink-0">3</span>
                    <p className="leading-relaxed">
                      Tap <strong>Add</strong> in the top-right corner to launch Tejashwi 23 as a native full-screen app!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-xs shrink-0">1</span>
                    <p className="leading-relaxed">
                      Tap your browser menu (<strong>⋮</strong> or <strong>Share</strong> icon).
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/20">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-xs shrink-0">2</span>
                    <p className="leading-relaxed">
                      Select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
