import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Question } from '../../../types';

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  textarea: 'Textarea',
  select: 'Select',
  radio: 'Radio',
  checkbox: 'Checkbox',
  rating: 'Rating',
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
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
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-medium line-clamp-2">{question.question_text}</p>
          {question.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{question.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {question.category && (
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                {question.category.name}
              </span>
            )}
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {TYPE_LABELS[question.question_type] || question.question_type}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
              W: {question.weight}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
              Max: {question.max_score}
            </span>
            {question.is_required && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                Required
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              question.is_active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {question.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 ml-2 shrink-0">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1 text-gray-400 hover:text-blue-600"
                aria-label="Edit question"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1 text-gray-400 hover:text-red-600"
                aria-label="Delete question"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
