import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

export function GlobalLoader({ isLoading }) {
  const { theme } = useTheme();
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ 
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
            zIndex: 99999999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            isolation: 'isolate'
          }}
          className="flex items-center justify-center backdrop-blur-none"
        >
          <div className="relative flex flex-col items-center">
            {/* Scanning Box Container */}
            <div className="relative w-48 h-48">
              
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-500 dark:border-blue-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-500 dark:border-blue-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-500 dark:border-blue-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-500 dark:border-blue-500 rounded-br-lg" />

              {/* Scanning Line */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent dark:via-blue-500 opacity-80 shadow-[0_0_15px_rgba(6,182,212,0.8)] dark:shadow-[0_0_15px_rgba(59,130,246,0.8)]"
              />

              {/* Inner Grid / Face Placeholder */}
              <div className="absolute inset-4 border border-cyan-500/20 dark:border-blue-500/20 rounded-lg overflow-hidden bg-cyan-500/5 dark:bg-blue-500/5">
                 <div className="w-full h-full opacity-30 bg-[url('/grid.svg')] bg-center bg-[length:20px_20px]" />
                 {/* Optional: Central target circle */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-cyan-500/30 dark:border-blue-500/30 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-cyan-500/10 dark:bg-blue-500/10 animate-pulse" />
                    </div>
                 </div>
              </div>

            </div>

            {/* Logo / Text below */}
            <div className="mt-8 flex flex-col items-center">
                 {/* <h2 className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-blue-400 dark:to-purple-400">
                    FRAS SYSTEM
                 </h2> */}
                 <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mt-2 text-sm font-medium text-cyan-600 dark:text-blue-400 uppercase tracking-[0.2em]"
                >
                  Authenticating...
                </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
