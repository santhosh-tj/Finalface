import { motion } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';

export function AttendanceChart({ data }) {
  // Mock data if none provided
  const chartData = data || [65, 59, 80, 81, 56, 55, 40];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const maxVal = Math.max(...chartData);

  return (
    <div className="flex items-end justify-between h-48 gap-2 pt-8">
      {chartData.map((value, i) => {
        const height = (value / maxVal) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
            <div className="relative w-full flex justify-end flex-col items-center">
               <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${height}%`, opacity: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.1, type: "spring" }}
                  className="w-full max-w-[40px] bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity relative"
                >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {value} students
                    </div>
                </motion.div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">{days[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityDonut({ percent = 75 }) {
    const circumference = 2 * Math.PI * 40; // r=40
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    
    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="64"
                    cy="64"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="64"
                    cy="64"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    className="text-cyan-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold dark:text-white">{percent}%</span>
                <span className="text-xs text-gray-500">Active</span>
            </div>
        </div>
    );
}

export function DashboardWidgets() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Attendance Trends */}
            <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Weekly Attendance</h3>
                <AttendanceChart />
            </div>

            {/* System Health / Activity */}
            <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-6 rounded-2xl shadow-xl">
                 <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">System Activity</h3>
                 <div className="flex items-center justify-around h-48">
                    <ActivityDonut percent={85} />
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Face Match Rate (98%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Active Sensors</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Server Status: Online</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    )
}
