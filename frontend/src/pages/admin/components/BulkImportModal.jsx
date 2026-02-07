import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/common/Button';

export function BulkImportModal({ isOpen, onClose, type = "students", onUpload }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === "text/csv") {
        setFile(selected);
        setStatus('idle');
    } else {
        alert("Please upload a CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('uploading');
    
    // Simulate upload delay
    setTimeout(() => {
        setUploading(false);
        setStatus('success');
        if (onUpload) onUpload(file);
        setTimeout(onClose, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Upload className="w-5 h-5 text-cyan-500" />
                        Bulk Import {type}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div 
                    className={`
                        border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                        ${file ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-600'}
                    `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    
                    {file ? (
                        <div className="flex flex-col items-center">
                            <FileSpreadsheet className="w-10 h-10 text-cyan-600 dark:text-cyan-400 mb-2" />
                            <p className="font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="font-medium text-gray-600 dark:text-gray-400">Click to upload CSV</p>
                            <p className="text-xs text-gray-400 mt-1">or drag and drop here</p>
                        </div>
                    )}
                </div>
                
                <div className="mt-2 text-center">
                    <a href="#" className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 underline">
                        Download template CSV
                    </a>
                </div>

                <div className="mt-6 flex gap-3">
                    <Button 
                        onClick={handleUpload} 
                        disabled={!file || uploading || status === 'success'}
                        className={`w-full flex items-center justify-center gap-2 ${status === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                    >
                        {status === 'uploading' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {status === 'success' && <Check className="w-4 h-4" />}
                        {status === 'idle' && "Upload & Process"}
                        {status === 'uploading' && "Processing..."}
                        {status === 'success' && "Import Complete"}
                    </Button>
                    <Button variant="secondary" onClick={onClose} disabled={uploading}>
                        Cancel
                    </Button>
                </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
