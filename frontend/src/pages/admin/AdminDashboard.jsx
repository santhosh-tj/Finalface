import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { AnimatedStatCard } from "./components/AnimatedStatCard";
import { AdminBackground3D } from "../../components/three/AdminBackground3D";
import { DashboardWidgets } from "./components/DashboardCharts";
import { adminApi } from "../../api/client";
import { Users, GraduationCap, Calendar, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .reports()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Total Faculty",
      value: stats?.totalFaculty ?? 0,
      icon: <Users className="w-6 h-6" />,
      gradient: "from-blue-500 to-indigo-600",
      trend: 12
    },
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: <GraduationCap className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-600",
      trend: 8
    },
    {
      title: "Today's Attendance",
      value: stats?.todayAttendance ?? 0,
      icon: <Calendar className="w-6 h-6" />,
      gradient: "from-emerald-500 to-teal-600",
      trend: 5
    },
    {
      title: "Mobile + GPS Mode",
      value: stats?.mobileGpsEnabled ? "ON" : "OFF",
      icon: <MapPin className="w-6 h-6" />,
      gradient: stats?.mobileGpsEnabled ? "from-green-500 to-emerald-600" : "from-amber-500 to-orange-600",
      trend: 0
    },
  ];

  const quickActions = [
    {
      to: "/admin/faculty",
      label: "Manage Faculty",
      description: "Add or edit faculty members",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      to: "/admin/students",
      label: "Manage Students",
      description: "Student records & enrollment",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      to: "/admin/reports",
      label: "View Reports",
      description: "Attendance analytics",
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      to: "/admin/settings",
      label: "System Settings",
      description: "Configure application",
      gradient: "from-slate-500 to-gray-600"
    },
  ];

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <AdminBackground3D />
      
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto bg-transparent">
        <Header title="Admin Dashboard" subtitle="Overview & Analytics" className="bg-white/50 dark:bg-gray-900/50" />
        
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <AnimatedStatCard
                        key={index}
                        {...stat}
                        delay={index * 0.1}
                        loading={loading}
                    />
                ))}
            </div>

            {/* Charts & Widgets */}
            <DashboardWidgets />

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-8 rounded-full bg-cyan-500" />
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <Link key={index} to={action.to}>
                            <motion.div
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative overflow-hidden p-6 rounded-2xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
                                    <ArrowRight className="w-5 h-5 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>
                                
                                <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {action.label}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {action.description}
                                </p>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
            
            <div className="h-8" /> {/* Spacer */}
        </div>
      </main>
    </div>
  );
}
