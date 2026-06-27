import React from 'react';
import { Input } from '../../ui/forms/Input';
import { Button } from '../../ui/buttons/Button';
import type { MedicationEvaluationTemplateCriterion } from '../../../types/medicationEvaluation';

interface CriterionInputProps {
  criterion: MedicationEvaluationTemplateCriterion;
  value: string | null;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
}

const calculateScore = (criterion: MedicationEvaluationTemplateCriterion, value: string | null): number => {
  if (value === null || value === '') return 0;

  switch (criterion.type) {
    case 'number': {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return 0;
      // For number type, score = min(value / 100, 1) * weight (approximation)
      return Math.min(num / 100, 1) * Number(criterion.weight);
    }
    case 'yes_no':
      return value === 'yes' ? Number(criterion.weight) : 0;
    case 'yes_no_partial':
      if (value === 'yes') return Number(criterion.weight);
      if (value === 'partial') return Number(criterion.weight) / 2;
      return 0;
    case 'text':
      return value.trim().length > 0 ? Number(criterion.weight) : 0;
    default:
      return 0;
  }
};

export const CriterionInput: React.FC<CriterionInputProps> = ({
  criterion,
  value,
  onChange,
  readOnly = false,
}) => {
  const score = calculateScore(criterion, value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Number type */}
        {criterion.type === 'number' && (
          <Input
            type="number"
            min={0}
            step="any"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={readOnly}
            placeholder="Enter value"
            className="w-32"
          />
        )}

        {/* Yes/No type */}
        {criterion.type === 'yes_no' && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={value === 'yes' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onChange(value === 'yes' ? null : 'yes')}
              disabled={readOnly}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={value === 'no' ? 'danger' : 'outline'}
              size="sm"
              onClick={() => onChange(value === 'no' ? null : 'no')}
              disabled={readOnly}
            >
              No
            </Button>
          </div>
        )}

        {/* Yes/Partially/No type */}
        {criterion.type === 'yes_no_partial' && (
          <div className="flex gap-2">
            {(['yes', 'partial', 'no'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onChange(value === option ? null : option)}
                disabled={readOnly}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  value === option
                    ? option === 'yes'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : option === 'partial'
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {option === 'yes' ? 'Yes' : option === 'partial' ? 'Partially' : 'No'}
              </button>
            ))}
          </div>
        )}

        {/* Text type */}
        {criterion.type === 'text' && (
          <Input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={readOnly}
            placeholder="Enter notes..."
            className="w-64"
          />
        )}
      </div>

      {/* Score preview */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Weight: {Number(criterion.weight)}</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-400">
          Score: <span className="font-semibold text-emerald-600">{score.toFixed(1)}</span>
        </span>
      </div>
    </div>
  );
};

export default CriterionInput;
