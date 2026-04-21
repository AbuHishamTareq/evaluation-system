import { Edit2, Trash2, Eye } from 'lucide-react'
import { Button } from './Button'

interface ActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onCustom?: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; title: string; variant?: 'default' | 'danger' }[]
  editTitle?: string
  deleteTitle?: string
  viewTitle?: string
  showEdit?: boolean
  showDelete?: boolean
  showView?: boolean
}

export function ActionButtons({
  onEdit,
  onDelete,
  onView,
  onCustom,
  editTitle = 'Edit',
  deleteTitle = 'Delete',
  viewTitle = 'View',
  showEdit = true,
  showDelete = true,
  showView = false,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {showView && onView && (
        <Button variant="ghost" size="sm" onClick={onView} title={viewTitle}>
          <Eye className="w-4 h-4" />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button variant="ghost" size="sm" onClick={onEdit} title={editTitle}>
          <Edit2 className="w-4 h-4" />
        </Button>
      )}
      {onCustom?.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={action.onClick}
          title={action.title}
          className={action.variant === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}
        >
          <action.icon className="w-4 h-4" />
        </Button>
      ))}
      {showDelete && onDelete && (
        <Button variant="ghost" size="sm" onClick={onDelete} title={deleteTitle} className="text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}