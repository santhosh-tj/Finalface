import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/client";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { motion } from "framer-motion";

export function LoginForm({ isWhiteMode = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.login(email, password);
      login(data.user, data.token);
      const role = data.user?.role;
      const path =
        role === "admin"
          ? "/admin"
          : role === "faculty"
          ? "/faculty"
          : "/student";
      navigate(path, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Dynamic Styles
  const textColor = isWhiteMode ? "text-gray-900" : "text-white";
  const subTextColor = isWhiteMode ? "text-gray-500" : "text-slate-400";
  const inputBg = isWhiteMode ? "bg-gray-50 border-gray-200" : "bg-slate-900/50 border-white/10";
  const inputText = isWhiteMode ? "text-gray-900 placeholder-gray-400" : "text-white placeholder-slate-500";
  const iconColor = isWhiteMode ? "text-gray-400" : "text-slate-400";
  
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="relative w-20 h-20 mx-auto mb-6 group">
            <div className={`absolute inset-0 bg-gradient-to-tr ${isWhiteMode ? 'from-cyan-400 to-blue-500 opacity-60' : 'from-cyan-500 to-blue-600 opacity-75'} rounded-2xl blur group-hover:opacity-100 transition duration-500`} />
            <div className={`relative w-full h-full ${isWhiteMode ? 'bg-white' : 'bg-slate-900'} rounded-2xl flex items-center justify-center border ${isWhiteMode ? 'border-gray-100' : 'border-white/10'} shadow-xl`}>
                <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
        
        <h1 className={`text-3xl font-bold ${textColor} mb-2 tracking-tight`}>
          Welcome Back
        </h1>
        <p className={subTextColor}>Sign in to your account</p>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemVariants}>
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={`${inputBg} ${inputText} focus:border-cyan-500 focus:ring-cyan-500/20`}
              labelClassName={isWhiteMode ? "text-gray-700" : "text-gray-200"}
              icon={
                <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />
        </motion.div>

        <motion.div variants={itemVariants}>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={`${inputBg} ${inputText} focus:border-cyan-500 focus:ring-cyan-500/20`}
              labelClassName={isWhiteMode ? "text-gray-700" : "text-gray-200"}
              icon={
                <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              error={error}
            />
        </motion.div>
        
        <motion.div variants={itemVariants} className="pt-2">
            <Button 
                type="submit" 
                className="w-full py-3.5 text-base font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 border-none transition-all duration-300 transform hover:-translate-y-0.5" 
                loading={loading} 
                disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-8 text-center">
        {/* <p className="text-xs text-slate-500">
            Protected by F.R.A.S. Face Recognition Security
        </p> */}
      </motion.div>
    </motion.div>
  );
}

