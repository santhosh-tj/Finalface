import { useRef, useEffect, useState } from 'react';
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { AdminBackground3D } from "../../components/three/AdminBackground3D";
import { ActivityLog } from "./components/ActivityLog";
import { Card } from "../../components/common/Card";
import { motion } from "framer-motion";
import { SystemTrafficChart } from "../../components/analytics/SystemTrafficChart";
import { AttendanceModesChart } from "../../components/analytics/AttendanceModesChart";
import { DepartmentAttendanceChart } from "../../components/analytics/DepartmentAttendanceChart";

export function SystemAnalyticsPage() {

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <AdminBackground3D />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto bg-transparent">
        <Header 
            title="System Analytics" 
            subtitle="Deep dive into system performance and usage" 
            className="bg-white/50 dark:bg-gray-900/50" 
        />
        
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Trends Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2"
                >
                    <SystemTrafficChart />
                </motion.div>

                {/* Donut Chart */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <AttendanceModesChart />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Perf */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <DepartmentAttendanceChart />
                </motion.div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="h-[350px]"
                >
                    <ActivityLog />
                </motion.div>
            </div>
            
        </div>
      </main>
    </div>
  );
}
