import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Search, Download, Filter, MoreVertical } from 'lucide-react';

export function DataTable({ 
  columns, 
  data, 
  loading, 
  onRowClick, 
  searchable = true, 
  actions,
  title,
  subtitle
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm) {
      result = result.filter(item => 
        Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           {title && <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>}
           {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        
        <div className="flex gap-3">
          {searchable && (
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm transition-all w-full md:w-64"
              />
            </div>
          )}
          
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {columns.map((col, idx) => (
                <th 
                  key={idx}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 ${col.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''} transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortConfig.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="p-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className='relative'>
             {loading ? (
                // Loading Skeleton
                [...Array(5)].map((_, i) => (
                   <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50">
                      {columns.map((__, j) => (
                         <td key={j} className="p-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                         </td>
                      ))}
                      {actions && <td className="p-4" />}
                   </tr>
                ))
             ) : (
                <AnimatePresence mode="wait">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, idx) => (
                      <motion.tr 
                        key={idx} // Using index as key fallback, ideal to have unique ID
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        onClick={() => onRowClick && onRowClick(row)}
                        className={`
                           border-b border-gray-50 dark:border-gray-800/50 
                           hover:bg-gray-50/80 dark:hover:bg-gray-800/40 
                           transition-colors
                           ${onRowClick ? 'cursor-pointer' : ''}
                        `}
                      >
                        {columns.map((col, cIdx) => (
                          <td key={cIdx} className="p-4 text-sm text-gray-600 dark:text-gray-300">
                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                          </td>
                        ))}
                        {actions && (
                           <td className="p-4 text-right">
                              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                                 <MoreVertical className="w-4 h-4 text-gray-400" />
                              </button>
                           </td>
                        )}
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                       <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-gray-500">
                          No results found
                       </td>
                    </tr>
                  )}
                </AnimatePresence>
             )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
         <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} entries
         </span>
         <div className="flex gap-2">
            <button 
               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
               disabled={currentPage === 1}
               className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               Previous
            </button>
            <button 
               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
               disabled={currentPage === totalPages}
               className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
               Next
            </button>
         </div>
      </div>
    </div>
  );
}
