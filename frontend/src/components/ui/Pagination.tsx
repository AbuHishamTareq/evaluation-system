import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  totalItems?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: PaginationProps) {
  const isRTL = document.dir === 'rtl'
  const [gotoPage, setGotoPage] = useState('')

  const handleGotoPage = () => {
    const page = Number(gotoPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page - 1)
      setGotoPage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGotoPage()
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        >
          {[15, 30, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">per page</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          Page {currentPage + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="First page"
          >
            {isRTL ? (
              <ChevronLast className="w-4 h-4" />
            ) : (
              <ChevronFirst className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous page"
          >
            {isRTL ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="#"
              min={1}
              max={totalPages}
              className="w-12 px-2 py-1 text-sm border border-gray-200 rounded text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
            <button
              onClick={handleGotoPage}
              disabled={!gotoPage || Number(gotoPage) < 1 || Number(gotoPage) > totalPages}
              className="px-2 py-1 text-sm bg-brand-500 text-white rounded hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go
            </button>
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next page"
          >
            {isRTL ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Last page"
          >
            {isRTL ? (
              <ChevronFirst className="w-4 h-4" />
            ) : (
              <ChevronLast className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}