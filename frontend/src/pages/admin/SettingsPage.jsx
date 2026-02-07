import { useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { AdminBackground3D } from "../../components/three/AdminBackground3D";
import { adminApi } from "../../api/client";
import { Settings, Save, Smartphone, Map, Bell, Shield, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function SettingsPage() {
  const [mobileGpsEnabled, setMobileGpsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(({ data }) => setMobileGpsEnabled(data.mobileGpsEnabled ?? false))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    setSaving(true);
    try {
      const { data } = await adminApi.updateSettings({
        mobileGpsEnabled: !mobileGpsEnabled,
      });
      setMobileGpsEnabled(data.mobileGpsEnabled);
    } finally {
      setSaving(false);
    }
  };

  const SettingCard = ({ icon: Icon, title, description, children }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
        <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">{description}</p>
            </div>
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <AdminBackground3D />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto bg-transparent">
        <Header 
            title="System Settings" 
            subtitle="Configure global application preferences" 
            className="bg-white/50 dark:bg-gray-900/50" 
        />
        
        <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
            
            {/* Mobile + GPS Mode */}
            <SettingCard 
                icon={Map}
                title="Mobile + GPS Attendance"
                description="Allow faculty to create attendance sessions that require students to be within a specific GPS range using their mobile devices."
            >
                <button
                    onClick={handleToggle}
                    disabled={saving || loading}
                    className={`
                        relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
                        ${mobileGpsEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                    `}
                >
                    <span
                        className={`
                            inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out
                            ${mobileGpsEnabled ? 'translate-x-7' : 'translate-x-1'}
                        `}
                    />
                </button>
            </SettingCard>

             {/* Placeholder for future settings to look "complete" */}
            <SettingCard 
                icon={Bell}
                title="System Notifications"
                description="Enable global announcements and alerts for all users. (Coming Soon)"
            >
                 <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">Coming Soon</div>
            </SettingCard>

            <SettingCard 
                icon={Shield}
                title="Security Policies"
                description="Configure password requirements and session timeout settings. (Coming Soon)"
            >
                 <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">Coming Soon</div>
            </SettingCard>

        </div>
      </main>
    </div>
  );
}
