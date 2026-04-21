import { Search } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  placeholder_ar?: string
  maxWidth?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  placeholder_ar = 'بحث...',
  maxWidth = 'max-w-md',
}: SearchBarProps) {
  const { locale } = useAppStore()
  const displayPlaceholder = locale === 'ar' ? placeholder_ar : placeholder

  return (
    <div className="relative flex-1">
      <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={displayPlaceholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${maxWidth}`}
      />
    </div>
  )
}