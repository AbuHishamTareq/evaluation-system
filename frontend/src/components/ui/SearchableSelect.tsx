import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
}

interface SearchableSelectProps {
  label?: string
  value?: string | number
  onChange: (value: string | number) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  disabled?: boolean
  onSearch?: (query: string) => void
  loading?: boolean
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  disabled,
  onSearch,
  loading,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => 
    String(opt.value) === String(value)
  )

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }, [onSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-full" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 text-start border rounded-lg bg-white
            flex items-center justify-between
            focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none
            ${error ? 'border-red-500' : 'border-gray-200'}
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={placeholder}
                  className="w-full ps-10 pe-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  autoFocus
                />
                {loading && (
                  <Loader2 className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            </div>
            <div className="max-h-60 overflow-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {loading ? '' : 'No results found'}
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`
                      w-full px-4 py-2.5 text-start flex items-center justify-between
                      hover:bg-brand-50
                      ${option.value === value ? 'text-brand-700 bg-brand-50' : 'text-gray-700'}
                    `}
                  >
                    {option.label}
                    {option.value === value && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}