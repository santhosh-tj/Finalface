import { useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { attendanceApi } from "../../api/client";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, MapPin, Video, Wifi } from "lucide-react";
import { format, parseISO } from "date-fns";

export function AttendanceHistoryPage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = () => {
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
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header
          title="Attendance Timeline"
          subtitle="Your academic journey, tracked."
        />
        
        <div className="p-6 md:p-12 max-w-5xl mx-auto w-full">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-12 items-end bg-white/50 dark:bg-white/5 p-4 rounded-2xl backdrop-blur-md border border-gray-200 dark:border-white/10">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 outline-none focus:border-cyan-500 dark:text-white transition-colors"
                title="Start Date"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent border-b border-gray-300 dark:border-gray-700 py-2 outline-none focus:border-cyan-500 dark:text-white transition-colors"
                title="End Date"
              />
            </div>
            <button
              onClick={load}
              className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-80 transition-opacity ml-auto"
            >
              Filter Timeline
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="relative">
                {/* Central Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-transparent opacity-30" />

                <div className="space-y-12">
                    {attendances.length === 0 ? (
                        <div className="text-center py-20 opacity-50">
                            <Calendar size={48} className="mx-auto mb-4" />
                            <p>No attendance records found for this period.</p>
                        </div>
                    ) : attendances.map((a, index) => (
                        <motion.div 
                            key={a.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                        >
                            {/* Content Card */}
                            <div className="flex-1">
                                <div className={`p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-2xl ${
                                    index % 2 === 0 
                                      ? 'bg-gradient-to-br from-white/80 to-blue-50/80 dark:from-white/5 dark:to-blue-900/10 border-blue-100 dark:border-blue-500/20' 
                                      : 'bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-white/5 dark:to-purple-900/10 border-purple-100 dark:border-purple-500/20'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-xl dark:text-white">{a.subject}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            a.status === 'Present' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {a.status || 'Present'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm opacity-80 dark:text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-cyan-500" />
                                            {format(parseISO(a.date), 'MMMM d, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-purple-500" />
                                            {a.time}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {a.mode === 'mobile' ? <MapPin size={16} className="text-orange-500" /> : <Video size={16} className="text-blue-500" />}
                                            <span className="capitalize">{a.mode || 'Webcam'} Scan</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            Class {a.class}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center Dot */}
                            <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-white dark:bg-black border-4 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] -translate-x-1/2 mt-6 z-10" />

                            {/* Spacer for alternate side */}
                            <div className="flex-1 md:block hidden" />
                        </motion.div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
