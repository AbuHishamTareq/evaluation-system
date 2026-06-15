import React from 'react';
import { Card } from '../../ui/cards/Card';

interface QuestionCardProps {
  id: string | number;
  question: string;
  category?: string;
  type?: 'multiple-choice' | 'true-false' | 'short-answer' | 'rating';
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'active' | 'draft' | 'archived';
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  category,
  type = 'multiple-choice',
  difficulty = 'medium',
  status = 'active',
  onClick,
  onEdit,
  onDelete,
}) => {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
    archived: 'bg-purple-100 text-purple-800',
  };

  const typeLabels = {
    'multiple-choice': 'Multiple Choice',
    'true-false': 'True/False',
    'short-answer': 'Short Answer',
    rating: 'Rating',
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-900 font-medium line-clamp-2">{question}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {category && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                {category}
              </span>
            )}
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              {typeLabels[type]}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 ml-2">
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