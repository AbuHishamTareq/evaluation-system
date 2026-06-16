import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { QuestionSubCategory } from '../../../types/question';

interface SubCategoryCardProps {
  subCategory: QuestionSubCategory;
  onClick?: () => void;
  onEdit?: (subCategory: QuestionSubCategory) => void;
  onDelete?: (subCategory: QuestionSubCategory) => void;
  onToggleActive?: (subCategory: QuestionSubCategory, isActive: boolean) => void;
}

export const SubCategoryCard: React.FC<SubCategoryCardProps> = ({
  subCategory,
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
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-lg bg-gradient-to-br from-red-100 to-rose-100 text-red-600">
            {subCategory.code.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{subCategory.name}</h4>
            </div>
            <p className="text-sm text-gray-500 mt-1">Code: {subCategory.code}</p>
            {subCategory.category && (
              <p className="text-xs text-gray-400 mt-0.5">
                Parent: <span className="font-medium text-gray-500">{subCategory.category.name}</span>
              </p>
            )}
            {subCategory.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-1">{subCategory.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Order: {subCategory.order}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(subCategory, !subCategory.is_active);
              }}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                subCategory.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {subCategory.is_active ? 'Active' : 'Inactive'}
            </button>
          )}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(subCategory);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Edit sub-category"
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
                    onDelete(subCategory);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete sub-category"
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

      {subCategory.description && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {subCategory.description}
          </span>
        </div>
      )}
    </Card>
  );
};

export default SubCategoryCard;
