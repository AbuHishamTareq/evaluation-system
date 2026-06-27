import React from 'react';
import { Card } from '../../ui/cards/Card';
import { CriterionInput } from './CriterionInput';
import type {
  MedicationEvaluationTemplateMedication,
  MedicationEvaluationTemplateCriterion,
} from '../../../types/medicationEvaluation';

interface MedicationEvalCardProps {
  medication: MedicationEvaluationTemplateMedication;
  criteria: MedicationEvaluationTemplateCriterion[];
  answers: Record<string, string | null>;
  onAnswerChange: (templateMedicationId: number, criterionId: number, value: string | null) => void;
  readOnly?: boolean;
}

const calculateSubtotal = (
  criteria: MedicationEvaluationTemplateCriterion[],
  answers: Record<string, string | null>,
  medicationId: number,
  recommendedQuantity?: number
): number => {
  let total = 0;
  criteria.forEach((criterion) => {
    const key = `${medicationId}-${criterion.id}`;
    const value = answers[key] ?? null;
    if (value === null || value === '') return;
    switch (criterion.type) {
      case 'number': {
        const num = parseFloat(value);
        if (!isNaN(num) && num >= 0) {
          const qty = recommendedQuantity ?? 0;
          const ratio = num / Math.max(1, qty);
          total += Math.min(ratio, 1) * Number(criterion.weight);
        }
        break;
      }
      case 'yes_no':
        total += value === 'yes' ? Number(criterion.weight) : 0;
        break;
      case 'yes_no_partial':
        if (value === 'yes') total += Number(criterion.weight);
        else if (value === 'partial') total += Number(criterion.weight) / 2;
        break;
      case 'text':
        total += value.trim().length > 0 ? Number(criterion.weight) : 0;
        break;
    }
  });
  return total;
};

const calculateMaxSubtotal = (criteria: MedicationEvaluationTemplateCriterion[]): number => {
  return criteria.reduce((sum, c) => sum + Number(c.weight), 0);
};

export const MedicationEvalCard: React.FC<MedicationEvalCardProps> = ({
  medication,
  criteria,
  answers,
  onAnswerChange,
  readOnly = false,
}) => {
  const subtotal = calculateSubtotal(criteria, answers, medication.id, medication.recommended_quantity);
  const maxSubtotal = calculateMaxSubtotal(criteria);
  const medicationName = medication.medication?.name || 'Unknown Medication';
  const strength = medication.medication?.strength || '';
  const form = medication.medication?.form || '';

  return (
    <Card variant="elevated" padding="lg" className="border-l-4 border-l-emerald-400">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {medicationName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{medicationName}</h3>
              <p className="text-sm text-slate-500">
                {[strength, form].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Subtotal</p>
          <p className="text-xl font-bold text-emerald-600">
            {subtotal.toFixed(1)} <span className="text-sm text-slate-400 font-normal">/ {maxSubtotal.toFixed(1)}</span>
          </p>
        </div>
      </div>

      {/* Info line */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        {medication.allocation_location && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Allocation: {medication.allocation_location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Rec. Qty: {medication.recommended_quantity}
        </span>
      </div>

      {/* Criteria rows */}
      <div className="space-y-4">
        {criteria.map((criterion, idx) => {
          const key = `${medication.id}-${criterion.id}`;
          const criterionValue = answers[key] ?? null;

          return (
            <div
              key={criterion.id}
              className="flex items-start gap-4 pb-3 border-b border-slate-100 last:border-0"
            >
              {/* Order number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                {idx + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-700">{criterion.name}</span>
                </div>
                {criterion.description && (
                  <p className="text-xs text-slate-400 mb-2">{criterion.description}</p>
                )}
                <CriterionInput
                  criterion={criterion}
                  value={criterionValue}
                  onChange={(val) => onAnswerChange(medication.id, criterion.id, val)}
                  readOnly={readOnly}
                />
              </div>

              {/* Score display */}
              <div className="flex-shrink-0 w-16 text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide">Score</p>
                <p className="text-sm font-bold text-emerald-600">
                  {criterionValue !== null && criterionValue !== ''
                    ? (() => {
                        switch (criterion.type) {
                          case 'number': {
                            const num = parseFloat(criterionValue);
                            if (!isNaN(num) && num >= 0) {
                              const qty = medication.recommended_quantity ?? 0;
                              const ratio = num / Math.max(1, qty);
                              return (Math.min(ratio, 1) * Number(criterion.weight)).toFixed(1);
                            }
                            return '0.0';
                          }
                          case 'yes_no': return criterionValue === 'yes' ? Number(criterion.weight).toFixed(1) : '0.0';
                          case 'yes_no_partial': {
                            if (criterionValue === 'yes') return Number(criterion.weight).toFixed(1);
                            if (criterionValue === 'partial') return (Number(criterion.weight) / 2).toFixed(1);
                            return '0.0';
                          }
                          case 'text': return criterionValue.trim().length > 0 ? Number(criterion.weight).toFixed(1) : '0.0';
                          default: return '0.0';
                        }
                      })()
                    : '—'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtotal footer */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-600">Subtotal</span>
        <span className="text-lg font-bold text-emerald-600">
          {subtotal.toFixed(1)} / {maxSubtotal.toFixed(1)}
        </span>
      </div>
    </Card>
  );
};

export default MedicationEvalCard;
