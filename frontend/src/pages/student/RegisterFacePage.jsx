import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Camera, CheckCircle2, Shield, SunMedium, UserCheck } from "lucide-react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Card } from "../../components/common/Card";
import FaceCaptureComponent from "../../components/FaceCaptureComponent";
import { studentApi } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

const tips = [
  "Keep your face centered inside the frame.",
  "Use even lighting and avoid strong backlight.",
  "Remove masks and dark glasses during capture.",
  "Slowly turn your head for multiple angles.",
];

export function RegisterFacePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const { data } = await studentApi.me();
        if (!mounted) return;
        const fresh = data?.user || null;
        setProfile(fresh);
        if (fresh) updateUser({ ...(user || {}), ...fresh });
        if (fresh?.faceRegistered) navigate("/student", { replace: true });
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.error || "Unable to load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleComplete = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await studentApi.me();
      const fresh = data?.user || {};
      setProfile(fresh);
      updateUser({ ...(user || {}), ...fresh, faceRegistered: true });
      setSuccess(true);
      setTimeout(() => navigate("/student", { replace: true }), 1800);
    } catch (e) {
      setError(e?.response?.data?.error || "Face registered, but failed to refresh profile.");
      setSuccess(true);
      setTimeout(() => navigate("/student", { replace: true }), 1800);
    } finally {
      setSaving(false);
    }
  };

  const handleError = (err) => {
    setSaving(false);
    setError(
      err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Please try again."
    );
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.15),transparent_40%)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header
          title="Register Face"
          subtitle="Capture your biometric profile for fast attendance verification."
        />

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <div className="h-64 grid place-items-center">
              <div className="h-10 w-10 rounded-full border-4 border-cyan-500/25 border-t-cyan-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <motion.section
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="xl:col-span-2 space-y-6"
              >
                <Card className="border border-gray-200 dark:border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl p-2 bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Biometric Setup</p>
                      <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                        We capture about 20 frames to build a stable face embedding quickly.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border border-gray-200 dark:border-white/10">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Capture Checklist</h3>
                  <div className="space-y-3">
                    {tips.map((tip) => (
                      <div key={tip} className="flex items-start gap-3">
                        <UserCheck size={16} className="mt-0.5 text-emerald-600 dark:text-emerald-300" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border border-gray-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current status</p>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      <SunMedium size={12} />
                      {profile?.faceRegistered ? "Registered" : "Not registered"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    After completion, you will be redirected to dashboard automatically.
                  </p>
                </Card>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="xl:col-span-3"
              >
                <Card className="border border-gray-200 dark:border-white/10 p-4 md:p-5">
                  {success ? (
                    <div className="h-[520px] grid place-items-center text-center">
                      <div>
                        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 grid place-items-center">
                          <CheckCircle2 size={34} className="text-emerald-600 dark:text-emerald-300" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">Registration Complete</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Your face profile has been saved. Redirecting to dashboard.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {error && (
                        <div className="mb-4 rounded-xl border border-red-300/70 dark:border-red-500/30 bg-red-50 dark:bg-red-950/30 px-3 py-2 flex items-center gap-2">
                          <AlertCircle size={16} className="text-red-600 dark:text-red-300" />
                          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                      )}

                      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Camera size={16} />
                        Keep your camera stable while scanning is in progress.
                      </div>

                      <div className="h-[520px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black">
                        <FaceCaptureComponent
                          numImages={20}
                          onComplete={handleComplete}
                          onError={handleError}
                        />
                      </div>
                      {saving && (
                        <p className="mt-3 text-sm text-cyan-700 dark:text-cyan-300">Finalizing and syncing profile...</p>
                      )}
                    </>
                  )}
                </Card>
              </motion.section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
