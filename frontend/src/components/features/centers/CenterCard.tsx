import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Center, CenterClassification } from '../../../types/center';
import { CENTER_CLASSIFICATION_COLORS } from '../../../types/center';

interface CenterCardProps {
  center: Center;
  onClick?: () => void;
  onEdit?: (center: Center) => void;
  onDelete?: (center: Center) => void;
  onToggleActive?: (center: Center, isActive: boolean) => void;
}

export const CenterCard: React.FC<CenterCardProps> = ({
  center,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const classificationColor = CENTER_CLASSIFICATION_COLORS[center.classification as CenterClassification] || 'bg-gray-100 text-gray-800';

  const classificationLabels: Record<CenterClassification, string> = {
    primary: 'Primary Health Center',
    secondary: 'Secondary Health Center',
    specialized: 'Specialized Center',
    community: 'Community Health Center',
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-lg bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600">
            {center.code.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{center.name}</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium min-w-fit whitespace-nowrap ${classificationColor}`}>
                {classificationLabels[center.classification as CenterClassification] || center.classification}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Code: {center.code}</p>
            {center.address && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-1">{center.address}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              {center.zone && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {center.zone.name}
                </span>
              )}
              {center.staff_count !== undefined && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {center.staff_count} staff
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(center, !center.is_active);
              }}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                center.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {center.is_active ? 'Active' : 'Inactive'}
            </button>
          )}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(center);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit center"
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
                    onDelete(center);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {(center.phone || center.email) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          {center.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {center.phone}
            </span>
          )}
          {center.email && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {center.email}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default CenterCard;