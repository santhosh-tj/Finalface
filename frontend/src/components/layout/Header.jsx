import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { NotificationCenter } from "../../pages/admin/components/NotificationCenter";

export function Header({ title, subtitle, className }) {
  const { user } = useAuth();
  return (
    <header className={`glass-strong px-6 py-4 sticky top-0 z-40 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
              {user?.role}
            </p>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold shadow-lg">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
