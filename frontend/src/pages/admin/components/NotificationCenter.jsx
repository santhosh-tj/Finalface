import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertTriangle } from 'lucide-react';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'System update completed successfully', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New student registration requests pending', time: '1 hour ago' },
    { id: 3, type: 'warning', message: 'Server load approaching 80%', time: '3 hours ago' },
  ]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <Check className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/50 shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                  <span className="bg-cyan-100 text-cyan-800 text-xs px-2 py-0.5 rounded-full dark:bg-cyan-900 dark:text-cyan-200">
                    {notifications.length}
                  </span>
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Bell className="w-12 h-12 mb-2 opacity-20" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {notifications.map(n => (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="relative group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-3">
                          <div className="mt-1 flex-shrink-0 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            {getIcon(n.type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                              {n.message}
                            </p>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {n.time}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeNotification(n.id)}
                          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                 <button 
                    onClick={() => setNotifications([])}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                 >
                    Clear all notifications
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
