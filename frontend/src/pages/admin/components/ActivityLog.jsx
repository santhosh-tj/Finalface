import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, AlertCircle, CheckCircle, FileText, Filter } from 'lucide-react';
import { Card } from '../../../components/common/Card';

export function ActivityLog() {
  const [filter, setFilter] = useState('all');
  
  // Mock data - normally fetched from API
  const logs = [
    { id: 1, action: "User Login", user: "Admin User", ip: "192.168.1.1", time: "2 mins ago", status: "success" },
    { id: 2, action: "Student Created", user: "Admin User", ip: "192.168.1.1", time: "15 mins ago", status: "success", details: "Created student 'John Doe'" },
    { id: 3, action: "Failed Login", user: "Unknown", ip: "10.0.0.55", time: "1 hour ago", status: "error", details: "Invalid password" },
    { id: 4, action: "Settings Updated", user: "Admin User", ip: "192.168.1.1", time: "2 hours ago", status: "warning", details: "Changed GPS tolerance" },
    { id: 5, action: "Report Exported", user: "Faculty Smith", ip: "192.168.1.42", time: "4 hours ago", status: "success" },
  ];

  const getIcon = (status) => {
    switch(status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-500" />
          Recent Activity
        </h3>
        
        <div className="flex gap-2">
            {['all', 'success', 'error'].map(f => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs rounded-full capitalize transition-colors ${
                        filter === f 
                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 items-start p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={`mt-1 p-2 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700`}>
              {getIcon(log.status)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{log.action}</span>
                <span className="text-xs text-gray-400">{log.time}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                by <span className="font-medium text-gray-600 dark:text-gray-300">{log.user}</span>
              </p>
              {log.details && (
                <p className="text-xs text-gray-400 mt-1 italic border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                    {log.details}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
