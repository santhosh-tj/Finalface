import { useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { AdminBackground3D } from "../../components/three/AdminBackground3D";
import { DataTable } from "./components/DataTable";
import { attendanceApi } from "../../api/client";
import { Filter, Download, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function AdminReportsPage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = () => {
    setLoading(true); // Ensure loading state is true when refetching
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    attendanceApi
      .list(params)
      .then(({ data }) => setAttendances(data.attendances || []))
      .catch(() => setAttendances([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [dateFrom, dateTo]);

  const exportCsv = () => {
    const headers = ["Date", "Time", "Student", "Subject", "Class", "Mode"];
    const rows = attendances.map((a) => [
      a.date,
      a.time,
      a.studentName,
      a.subject,
      a.class,
      a.mode,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${dateFrom || "all"}-${dateTo || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "time", label: "Time", sortable: true },
    { key: "studentName", label: "Student Name", sortable: true },
    { key: "subject", label: "Subject", sortable: true },
    { key: "class", label: "Class", sortable: true },
    { 
        key: "mode", 
        label: "Mode", 
        sortable: true,
        render: (value) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                value === 'mobile' 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            }`}>
                {value || 'webcam'}
            </span>
        )
    },
  ];

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <AdminBackground3D />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto bg-transparent">
        <Header title="Attendance Reports" subtitle="View and export attendance logs" className="bg-white/50 dark:bg-gray-900/50" />
        
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex flex-col h-full">
            {/* Filters Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-6 rounded-2xl shadow-lg"
            >
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">From Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">To Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500/50"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={load}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-lg shadow-cyan-500/30"
                        >
                            <Filter className="w-4 h-4" />
                            Apply Filter
                        </button>
                        <button
                            onClick={exportCsv}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-lg shadow-emerald-500/30"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Data Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
            >
                <DataTable 
                    columns={columns}
                    data={attendances}
                    loading={loading}
                    title="Attendance Logs"
                    subtitle="Recent attendance records"
                />
            </motion.div>
        </div>
      </main>
    </div>
  );
}
