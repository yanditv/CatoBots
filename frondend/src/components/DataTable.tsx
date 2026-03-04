import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: string;
  actions?: (item: T) => React.ReactNode;
  expandedContent?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  actions,
  expandedContent,
  emptyMessage = 'SIN REGISTROS',
  pageSize = 10
}: DataTableProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Reset to page 0 when data changes significantly
  const totalColSpan = columns.length + (actions ? 1 : 0) + (expandedContent ? 1 : 0);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
    setExpandedId(null);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header */}
        <thead>
          <tr className="border-b-3 border-cb-yellow-neon">
            {expandedContent && <th className="w-10 p-3 bg-[#0a0a0a]" />}
            {columns.map(col => (
              <th
                key={col.key}
                className={`text-left px-4 py-3 text-[10px] font-tech font-black uppercase tracking-widest text-cb-yellow-neon bg-[#0a0a0a] ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="text-right px-4 py-3 text-[10px] font-tech font-black uppercase tracking-widest text-cb-yellow-neon bg-[#0a0a0a]">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={totalColSpan} className="text-center py-16">
                <p className="text-neutral-600 font-tech font-black uppercase text-sm tracking-widest">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            paginatedData.map((item, index) => {
              const id = item[keyField];
              const isExpanded = expandedId === id;

              return (
                <Fragment key={id}>
                  {/* Main Row */}
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    layout
                    className={`border-b border-neutral-800 hover:bg-white/[0.02] transition-colors duration-75 group ${isExpanded ? 'bg-white/[0.03]' : ''}`}
                  >
                    {expandedContent && (
                      <td className="px-2 py-3">
                        <button
                          onClick={() => toggleExpand(id)}
                          className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-cb-yellow-neon border border-neutral-800 hover:border-cb-yellow-neon transition-all duration-75"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    )}

                    {columns.map(col => (
                      <td key={col.key} className={`px-4 py-3.5 text-sm font-tech text-cb-white-tech ${col.className || ''}`}>
                        {col.render ? col.render(item) : String(item[col.key] ?? '---')}
                      </td>
                    ))}

                    {actions && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </motion.tr>

                  {/* Expanded Detail Row */}
                  {expandedContent && (
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={totalColSpan}>
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 py-5 bg-[#0d0d0d] border-l-4 border-cb-green-vibrant">
                                {expandedContent(item)}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-neutral-800 bg-[#0a0a0a]">
          <span className="text-[10px] font-tech font-bold text-neutral-500 uppercase tracking-widest">
            {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, data.length)} de {data.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="w-8 h-8 flex items-center justify-center border border-neutral-700 text-neutral-500 hover:text-cb-yellow-neon hover:border-cb-yellow-neon transition-all duration-75 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-tech font-black transition-all duration-75 border ${
                  i === currentPage
                    ? 'bg-cb-yellow-neon text-cb-black-pure border-cb-yellow-neon'
                    : 'text-neutral-500 border-neutral-700 hover:text-cb-yellow-neon hover:border-cb-yellow-neon'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="w-8 h-8 flex items-center justify-center border border-neutral-700 text-neutral-500 hover:text-cb-yellow-neon hover:border-cb-yellow-neon transition-all duration-75 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
