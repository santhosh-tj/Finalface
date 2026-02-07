import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Card } from "../../components/common/Card";
import { useAuth } from "../../contexts/AuthContext";
import FaceCaptureComponent from "../../components/FaceCaptureComponent";
import { CheckCircle, Moon, Sun, Camera, Shield, UserCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RegisterFacePage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true); // Toggle state
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (user?.faceRegistered) {
      navigate("/student");
    }
  }, [user?.faceRegistered, navigate]);

  const handleComplete = (data) => {
    console.log("Registration completed:", data);
    setSuccess(true);
    updateUser({ ...user, faceRegistered: true });
    setTimeout(() => navigate("/student"), 2500);
  };

  const handleError = (err) => {
    console.error("Registration error:", err);
    const errorMessage = err.response?.data?.error || 
                        err.message || 
                        "Registration failed. Please try again.";
    setError(errorMessage);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (user?.faceRegistered) return null;

  // Dynamic Styles based on Theme
  const theme = {
    bg: isDarkMode ? "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-blue-50",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textMuted: isDarkMode ? "text-gray-300" : "text-gray-600",
    cardBg: isDarkMode ? "bg-black/40 backdrop-blur-xl border-white/10" : "bg-white/70 backdrop-blur-xl border-gray-200 shadow-xl",
    instructionBg: isDarkMode ? "bg-purple-500/10 border-purple-500/30" : "bg-blue-50 border-blue-100",
    iconColor: isDarkMode ? "text-green-400" : "text-green-600",
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} transition-colors duration-500`}>
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toggle Theme Button */}
        <button 
            onClick={toggleTheme}
            className={`absolute top-6 right-6 z-50 p-2 rounded-full ${isDarkMode ? "bg-white/10 text-yellow-300 hover:bg-white/20" : "bg-gray-200 text-gray-700 hover:bg-gray-300"} transition-all`}
        >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <Header 
          title="Face Registration"
          subtitle="Secure your account with biometric data" 
        />
        
        <div className="p-6 flex-1 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-5xl p-8 rounded-2xl border ${theme.cardBg} ${theme.text} shadow-2xl`}
          >
            {success ? (
              <div className="text-center py-16">
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} 
                    className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle size={48} className="text-white" />
                </motion.div>
                <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Registration Complete!
                </h2>
                <p className={`${theme.textMuted} text-lg`}>
                  Your face biometric data has been securely verified.
                </p>
                <p className="text-sm text-gray-400 mt-4 animate-pulse">Redirecting to dashboard...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Instructions */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-lg ${isDarkMode ? "bg-purple-500/20 text-purple-400" : "bg-blue-100 text-blue-600"}`}>
                            <Shield size={28} />
                        </div>
                        <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                           Setup Guide
                        </h3>
                    </div>

                  <p className={`${theme.textMuted} leading-relaxed`}>
                    We need to capture **50 high-quality images** to build your unique face profile. This ensures quick and accurate attendance marking.
                  </p>

                  <div className={`p-6 rounded-xl border ${theme.instructionBg} space-y-4`}>
                    {[
                        { icon: UserCheck, text: "Center your face in the frame" },
                        { icon: Sun, text: "Ensure balanced lighting (no strong shadows)" },
                        { icon: AlertCircle, text: "Remove masks or dark glasses" },
                        { icon: Camera, text: "Slightly rotate head for better angles" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <item.icon size={20} className={theme.iconColor} />
                            <span className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                  </div>

                  {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3"
                    >
                      <AlertCircle size={20} />
                      <span className="text-sm font-semibold">{error}</span>
                    </motion.div>
                  )}
                </div>

                {/* Right: Camera */}
                <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800">
                    <FaceCaptureComponent
                        numImages={50}
                        onComplete={handleComplete}
                        onError={handleError}
                    />
                    
                    {/* Overlay Tip */}
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                        <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs text-white/80 font-medium border border-white/10">
                            Looking good! Hold steady.
                        </span>
                    </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}