import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Medication } from '../../../types/medication';

interface MedicationCardProps {
  medication: Medication;
  onClick?: () => void;
  onEdit?: (medication: Medication) => void;
  onDelete?: (medication: Medication) => void;
  onToggleActive?: (medication: Medication, isActive: boolean) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'High Alert': 'bg-red-100 text-red-700',
  'Controlled': 'bg-amber-100 text-amber-700',
  'Antibiotic': 'bg-purple-100 text-purple-700',
  'Vaccine': 'bg-blue-100 text-blue-700',
  'IV Fluid': 'bg-cyan-100 text-cyan-700',
};

const getCategoryColor = (category: string | null): string => {
  if (!category) return 'bg-slate-100 text-slate-600';
  return CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-600';
};

export const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
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
          {/* Initial Letter Badge */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-lg bg-gradient-to-br from-violet-100 to-blue-100 text-violet-600">
            {medication.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{medication.name}</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium min-w-fit whitespace-nowrap ${getCategoryColor(medication.category)}`}>
                {medication.category || '—'}
              </span>
            </div>

            {/* Strength / Form / Unit */}
            <p className="text-sm text-gray-500 mt-1">
              {[medication.strength, medication.form, medication.unit].filter(Boolean).join(' · ') || '—'}
            </p>

            {/* Linked PHCs */}
            {medication.phc_medications_count !== undefined && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {medication.phc_medications_count} PHC{medication.phc_medications_count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {onToggleActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(medication, !medication.is_active);
              }}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                medication.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {medication.is_active ? 'Active' : 'Inactive'}
            </button>
          )}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(medication);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit medication"
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
                    onDelete(medication);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete medication"
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
    </Card>
  );
};

export default MedicationCard;
