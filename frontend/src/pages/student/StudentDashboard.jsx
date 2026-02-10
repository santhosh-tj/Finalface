import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Camera, CircleCheck, Clock3, GraduationCap, ShieldCheck, UserCheck } from "lucide-react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Card } from "../../components/common/Card";
import { attendanceApi, studentApi } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

function getAttendanceDate(record) {
  if (record?.timestamp) {
    const ts = new Date(record.timestamp);
    if (!Number.isNaN(ts.getTime())) return ts;
  }
  if (record?.date) {
    const composed = new Date(`${record.date}T${record.time || "00:00:00"}`);
    if (!Number.isNaN(composed.getTime())) return composed;
  }
  return null;
}

function formatWhen(record) {
  const date = getAttendanceDate(record);
  if (!date) return "Unknown time";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ title, value, hint, icon: Icon, accent }) {
  return (
    <Card className="border border-gray-200/80 dark:border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{hint}</p>
        </div>
        <div className={`rounded-xl p-3 ${accent}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [profileRes, attendanceRes] = await Promise.all([
          studentApi.me(),
          attendanceApi.list(),
        ]);

        if (!mounted) return;

        const freshUser = profileRes?.data?.user || null;
        const records = attendanceRes?.data?.attendances || [];

        setProfile(freshUser);
        setAttendances(records);

        if (freshUser) {
          updateUser({ ...(user || {}), ...freshUser });
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.error || "Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const totalAttended = profile?.attendanceStats?.totalAttended ?? attendances.length;
    const monthCount = attendances.filter((a) => {
      const d = getAttendanceDate(a);
      return d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const uniqueSubjects = new Set(attendances.map((a) => a.subject).filter(Boolean)).size;
    const faceReady = profile?.faceRegistered ? "Registered" : "Pending";
    return { totalAttended, monthCount, uniqueSubjects, faceReady };
  }, [profile, attendances]);

  const subjectBreakdown = useMemo(() => {
    const raw = profile?.attendanceStats?.bySubject || [];
    return raw
      .map((entry) => ({
        subject: entry?._id?.subject || "Unknown",
        className: entry?._id?.class || "-",
        count: entry?.count || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [profile]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header
          title="Student Dashboard"
          subtitle="Live attendance overview and face profile status."
        />

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
          {loading ? (
            <div className="h-60 grid place-items-center">
              <div className="h-10 w-10 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin" />
            </div>
          ) : (
            <>
              {error && (
                <Card className="border border-red-300/60 dark:border-red-500/30">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </Card>
              )}

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cyan-200/70 dark:border-cyan-500/20 bg-gradient-to-r from-cyan-100/70 via-white to-sky-100/70 dark:from-cyan-900/30 dark:via-slate-950 dark:to-sky-900/30 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Welcome</p>
                    <h2 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {(profile?.name || user?.name || "Student").split(" ")[0]}, your records are synced.
                    </h2>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      Face status: <span className="font-semibold">{stats.faceReady}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/student/mobile-attendance"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 transition-colors"
                    >
                      <Camera size={16} />
                      Mark Attendance
                    </Link>
                    <Link
                      to="/student/register-face"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/15 text-gray-800 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                    >
                      <UserCheck size={16} />
                      Register Face
                    </Link>
                  </div>
                </div>
              </motion.section>

              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  title="Total Attendance"
                  value={stats.totalAttended}
                  hint="All time check-ins"
                  icon={CircleCheck}
                  accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                />
                <StatCard
                  title="This Month"
                  value={stats.monthCount}
                  hint="Current month records"
                  icon={Calendar}
                  accent="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                />
                <StatCard
                  title="Subjects Covered"
                  value={stats.uniqueSubjects}
                  hint="Distinct subjects attended"
                  icon={GraduationCap}
                  accent="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                />
                <StatCard
                  title="Face Profile"
                  value={stats.faceReady}
                  hint="Needed for auto verification"
                  icon={ShieldCheck}
                  accent="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                />
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 border border-gray-200/80 dark:border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
                    <Link to="/student/history" className="text-sm font-medium text-cyan-600 dark:text-cyan-300 hover:underline">
                      View full history
                    </Link>
                  </div>
                  {attendances.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No attendance records yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {attendances.slice(0, 7).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.subject || "Subject"}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Class {item.class || "-"} - {item.mode || "webcam"}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Clock3 size={14} />
                            {formatWhen(item)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="border border-gray-200/80 dark:border-white/10">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">By Subject</h3>
                  {subjectBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No subject stats available.</p>
                  ) : (
                    <div className="space-y-3">
                      {subjectBreakdown.map((s) => (
                        <div key={`${s.subject}-${s.className}`} className="rounded-xl border border-gray-200 dark:border-white/10 p-3">
                          <p className="font-medium text-gray-900 dark:text-white">{s.subject}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Class {s.className}</p>
                          <p className="text-sm mt-1 text-cyan-700 dark:text-cyan-300 font-semibold">{s.count} attendance records</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/student/register-face" className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                  <p className="font-semibold text-gray-900 dark:text-white">Register Face</p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Update biometric profile for better recognition.</p>
                </Link>
                <Link to="/student/history" className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                  <p className="font-semibold text-gray-900 dark:text-white">Attendance History</p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Review all your previous check-ins.</p>
                </Link>
                <Link to="/student/mobile-attendance" className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 hover:bg-white/60 dark:hover:bg-white/5 transition-colors">
                  <p className="font-semibold text-gray-900 dark:text-white">Mobile Attendance</p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Mark attendance from your phone with GPS.</p>
                </Link>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
