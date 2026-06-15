import React from 'react';
import { Card } from '../../ui/cards/Card';

interface EvaluationCardProps {
  id: string | number;
  title: string;
  description?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  participantsCount?: number;
  score?: number;
  onClick?: () => void;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  title,
  description,
  status = 'draft',
  startDate,
  endDate,
  participantsCount,
  score,
  onClick,
}) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-purple-100 text-purple-800',
  };

  return (
    <Card
      variant="outlined"
      padding="md"
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      {description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
      )}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
        {startDate && (
          <span>Start: {new Date(startDate).toLocaleDateString()}</span>
        )}
        {endDate && (
          <span>End: {new Date(endDate).toLocaleDateString()}</span>
        )}
        {participantsCount !== undefined && (
          <span>{participantsCount} participants</span>
        )}
        {score !== undefined && (
          <span className="font-medium text-blue-600">Score: {score}%</span>
        )}
      </div>
    </Card>
  );
};