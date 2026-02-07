import { motion } from 'framer-motion';


export function AnimatedStatCard({ title, value, icon, gradient, delay = 0, loading = false, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden p-6 rounded-2xl group cursor-default transition-all duration-300
        bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl
      `}
    >
      {/* Gradient Glow Effect */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
          <div className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
             {loading ? (
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
             ) : (
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
                    {value}
                </span>
             )}
          </div>
          {trend && (
             <div className={`flex items-center mt-2 text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                <span className="ml-1 text-gray-400 dark:text-gray-500">vs last week</span>
             </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg text-white transform group-hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      {/* Bottom Shine Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
