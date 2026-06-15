import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Professional } from '../../../types/professional';

interface ProfessionalCardProps {
  professional: Professional;
  onClick?: () => void;
  onEdit?: (professional: Professional) => void;
  onDelete?: (professional: Professional) => void;
  onToggleActive?: (professional: Professional, isActive: boolean) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
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
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm bg-gradient-to-br from-rose-100 to-orange-100 text-rose-700">
            {(professional.name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '—'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{professional.name}</h4>
              {onToggleActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleActive(professional, !professional.is_active);
                  }}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    professional.is_active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {professional.is_active ? 'Active' : 'Inactive'}
                </button>
              )}
            </div>
            {professional.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{professional.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(professional);
              }}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Edit professional role"
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
                onDelete(professional);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete professional role"
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

export default ProfessionalCard;
