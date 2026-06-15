import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Staff } from '../../../types/staff';

const DEACTIVATION_BADGES: Record<string, { label: string; style: string }> = {
  terminated: { label: 'Terminated', style: 'bg-red-100 text-red-700 hover:bg-red-200' },
  on_vacation: { label: 'On Vacation', style: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  resigned: { label: 'Resigned', style: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  transferred: { label: 'Transferred', style: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  sabbatical: { label: 'Sabbatical', style: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  suspended: { label: 'Suspended', style: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  other: { label: 'Other', style: 'bg-gray-100 text-gray-500 hover:bg-gray-200' },
};

interface StaffCardProps {
  staff: Staff;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
  onToggleActive?: (staff: Staff, isActive?: boolean) => void;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  isSelected,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const initials = (staff.first_name?.charAt(0) || '') + (staff.last_name?.charAt(0) || '') || '—';

  return (
    <Card
      variant="outlined"
      padding="md"
      className={[
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '',
        isSelected ? 'ring-2 ring-violet-500 border-violet-500 bg-violet-50/30' : '',
      ].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{staff.full_name || `${staff.first_name} ${staff.last_name}`}</h4>
              {onToggleActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(staff, !staff.is_active);
                  }}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    staff.is_active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : staff.deactivation_reason
                        ? DEACTIVATION_BADGES[staff.deactivation_reason]?.style || 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {staff.is_active
                    ? 'Active'
                    : staff.deactivation_reason
                      ? (DEACTIVATION_BADGES[staff.deactivation_reason]?.label || 'Inactive')
                      : 'Inactive'}
                </button>
              )}
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                {staff.staff_id}
              </span>
            </div>
            {staff.email && (
              <p className="text-sm text-gray-500 mt-0.5">{staff.email}</p>
            )}
            {(staff.department?.name || staff.professional?.name) && (
              <p className="text-xs text-gray-400 mt-0.5">
                {[staff.department?.name, staff.professional?.name].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(staff);
              }}
              className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="Edit staff"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(staff);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete staff"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StaffCard;
