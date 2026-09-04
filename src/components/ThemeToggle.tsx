import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export default function ThemeToggle({ className = '', compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex items-center justify-center transition-all duration-300 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
        compact 
          ? 'w-9 h-9 sm:w-10 sm:h-10' 
          : 'px-2.5 py-1.5 sm:px-3 sm:py-2 gap-2 text-xs sm:text-sm font-medium'
      } ${
        isDark
          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-400/50 hover:text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900 shadow-[0_2px_8px_rgba(5,150,105,0.12)]'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun 
            size={18} 
            className="text-amber-300 transform transition-transform duration-500 rotate-0 hover:rotate-45" 
            strokeWidth={2.2}
          />
        ) : (
          <Moon 
            size={18} 
            className="text-emerald-800 transform transition-transform duration-500 -rotate-12 hover:rotate-0" 
            strokeWidth={2.2}
          />
        )}
      </div>

      {!compact && (
        <span className="hidden xl:inline capitalize tracking-wide select-none">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
