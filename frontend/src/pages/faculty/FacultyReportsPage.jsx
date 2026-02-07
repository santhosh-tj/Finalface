import { useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { attendanceApi } from "../../api/client";
import { FacultyBackground } from "../../components/layout/FacultyBackground";
import { useTheme } from "../../contexts/ThemeContext";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import { Download, Filter, Search } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function FacultyReportsPage() {
  const { theme } = useTheme();
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [subject, setSubject] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const load = () => {
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (subject) params.subject = subject;
    if (classFilter) params.class = classFilter;
    
    setLoading(true);
    attendanceApi
      .list(params)
      .then(({ data }) => setAttendances(data.attendances || []))
      .catch(() => setAttendances([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const exportCsv = () => {
    const headers = ["Date", "Time", "Student", "Subject", "Class", "Mode"];
    const rows = attendances.map((a) => [a.date, a.time, a.studentName, a.subject, a.class, a.mode]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart Styling based on Theme
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
  const textColor = isDark ? '#9ca3af' : '#4b5563';

  const chartData = {
    labels: [...new Set(attendances.map(a => a.date))].slice(0, 7),
    datasets: [{
        label: 'Daily Attendance',
        data: [...new Set(attendances.map(a => a.date))].slice(0, 7).map(date => attendances.filter(a => a.date === date).length),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 5
    }]
  };

  return (
    <div className="flex min-h-screen font-sans relative overflow-hidden bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <FacultyBackground />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto">
        <Header 
            title="Attendance Archives" 
            subtitle="Historical data analysis and export" 
            className="!bg-white/50 dark:!bg-transparent backdrop-blur-md border-b !border-gray-200 dark:!border-white/5" 
        />
        
        <div className="p-8 pb-20 space-y-8">
          
          {/* Filters Bar */}
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-wrap gap-4 items-end shadow-xl transition-all">
             <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Date Range</label>
                <div className="flex gap-2">
                    <input 
                        type="date" 
                        value={dateFrom} 
                        onChange={e => setDateFrom(e.target.value)} 
                        className="bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors" 
                    />
                    <input 
                        type="date" 
                        value={dateTo} 
                        onChange={e => setDateTo(e.target.value)} 
                        className="bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors" 
                    />
                </div>
             </div>
             
             <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Filter By</label>
                <div className="flex gap-2">
                    <input 
                        placeholder="Subject..." 
                        value={subject} 
                        onChange={e => setSubject(e.target.value)} 
                        className="bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors placeholder:text-gray-400" 
                    />
                    <input 
                        placeholder="Class..." 
                        value={classFilter} 
                        onChange={e => setClassFilter(e.target.value)} 
                        className="bg-white dark:bg-black/50 border border-gray-300 dark:border-white/20 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors placeholder:text-gray-400" 
                    />
                </div>
             </div>

             <div className="flex gap-2 ml-auto">
                <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 font-bold shadow-lg transition-transform hover:scale-105">
                    <Filter size={16} /> Filter Data
                </button>
                <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 font-bold shadow-lg transition-transform hover:scale-105">
                    <Download size={16} /> Export CSV
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart Section */}
              <div className="lg:col-span-3 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 h-80 shadow-lg transition-all">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Attendance Trends (Last 7 Days)</h3>
                  <div className="h-full w-full pb-8">
                       <Bar 
                            data={chartData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { color: gridColor }, ticks: { color: textColor } },
                                    x: { grid: { display: false }, ticks: { color: textColor } }
                                }
                            }} 
                        />
                  </div>
              </div>

              {/* Data Table */}
              <div className="lg:col-span-3 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100/50 dark:bg-white/5 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-white/10">
                          <th className="p-4">Timestamp</th>
                          <th className="p-4">Student</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">Class</th>
                          <th className="p-4">Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading records...</td></tr>
                        ) : attendances.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-500">No records found matching criteria.</td></tr>
                        ) : (
                            attendances.map((a, i) => (
                                <motion.tr 
                                    key={a.id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-blue-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <td className="p-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                                        {a.date} <span className="opacity-30">|</span> {a.time}
                                    </td>
                                    <td className="p-4 font-bold text-gray-900 dark:text-white">{a.studentName}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{a.subject}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{a.class}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            a.mode === 'mobile' 
                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' 
                                                : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                        }`}>
                                            {a.mode || 'WEBCAM'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
              </div>
          </div>

        </div>
      </main>
    </div>
  );
}
