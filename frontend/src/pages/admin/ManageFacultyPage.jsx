import { useState, useEffect } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { AdminBackground3D } from "../../components/three/AdminBackground3D";
import { DataTable } from "./components/DataTable";
import { adminApi } from "../../api/client";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Plus, Trash2, Edit2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ManageFacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const load = () =>
    adminApi
      .listFaculty()
      .then(({ data }) => setFaculty(data.faculty || []))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await adminApi.createFaculty(form);
      setModal(null);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this faculty member?")) return;
    try {
      await adminApi.deleteFaculty(id);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    }
  };

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "faceRegistered",
      label: "Face Status",
      sortable: true,
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            val
              ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
              : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
          }`}
        >
          {val ? "Registered" : "Pending"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (id) => (
        <div className="flex gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); handleDelete(id); }}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Faculty"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <AdminBackground3D />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto bg-transparent">
        <Header 
            title="Manage Faculty" 
            subtitle="Staff accounts and permissions" 
            className="bg-white/50 dark:bg-gray-900/50"
        />
        
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex flex-col h-full">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Total Faculty: {faculty.length}</span>
                </div>
                <Button 
                    onClick={() => setModal("create")}
                    className="flex items-center gap-2 shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700"
                >
                    <Plus className="w-4 h-4" /> 
                    Add Faculty
                </Button>
            </div>

            {/* Content Table */}
            <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex-1"
            >
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                        {error}
                    </div>
                )}
                <DataTable
                    columns={columns}
                    data={faculty}
                    loading={loading}
                    title="Faculty Directory"
                    subtitle="Manage registered staff members"
                />
            </motion.div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modal === "create" && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setModal(null)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add New Faculty</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                        
                        <div className="flex gap-3 pt-4">
                            <Button type="submit" className="flex-1">Create Account</Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setModal(null)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
