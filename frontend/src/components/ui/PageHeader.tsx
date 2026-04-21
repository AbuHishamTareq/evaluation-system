import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { useAppStore } from '@/stores/appStore'

interface PageHeaderProps {
  title: string
  title_ar?: string
  addLink?: string
  addLabel?: string
  addLabel_ar?: string
  onAddClick?: () => void
  rightContent?: ReactNode
}

export function PageHeader({
  title,
  title_ar,
  addLink,
  addLabel = 'Add',
  addLabel_ar = 'إضافة',
  onAddClick,
  rightContent,
}: PageHeaderProps) {
  const { locale } = useAppStore()
  const displayTitle = locale === 'ar' && title_ar ? title_ar : title
  const label = locale === 'ar' ? addLabel_ar : addLabel

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{displayTitle}</h1>
      <div className="flex items-center gap-4">
        {rightContent}
        {addLink && (
          <Link to={addLink}>
            <Button>
              {label}
            </Button>
          </Link>
        )}
        {onAddClick && (
          <Button onClick={onAddClick}>
            {label}
          </Button>
        )}
      </div>
    </div>
  )
}