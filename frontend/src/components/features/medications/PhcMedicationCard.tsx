import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { PhcMedication } from '../../../types/medication';

interface PhcMedicationCardProps {
  item: PhcMedication;
  onClick?: () => void;
  onEdit?: (item: PhcMedication) => void;
  onDelete?: (id: number) => void;
}

export const PhcMedicationCard: React.FC<PhcMedicationCardProps> = ({
  item,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      variant="outlined"
      padding="md"
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Initial Letter Badge */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-lg bg-gradient-to-br from-rose-100 to-red-100 text-rose-600">
            {item.medication?.name?.charAt(0).toUpperCase() || '?'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Active Pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">
                {item.medication?.name || 'Unknown Medication'}
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium min-w-fit whitespace-nowrap ${
                  item.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Strength */}
            <p className="text-sm text-gray-500 mt-1">
              {item.medication?.strength || '—'}
            </p>

            {/* Recommended Qty + Current Stock */}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-500">
                Recommended:{' '}
                <span className="font-semibold text-gray-700">{item.recommended_quantity}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                Stock:{' '}
                {item.current_stock !== null ? (
                  <span
                    className={`font-semibold ${
                      item.current_stock < item.recommended_quantity
                        ? 'text-red-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {item.current_stock}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </span>
            </div>

            {/* Allocation Location Badge */}
            {item.allocation_location && (
              <div className="mt-2">
                <span className="inline-block px-2.5 py-0.5 text-xs rounded-full font-medium bg-cyan-100 text-cyan-700">
                  {item.allocation_location}
                </span>
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <p className="text-xs text-gray-400 mt-2 italic line-clamp-2">
                {item.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit PHC medication"
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
                onDelete(item.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Unlink medication"
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

export default PhcMedicationCard;
