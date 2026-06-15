import React from 'react';
import { Card } from '../../ui/cards/Card';
import type { Field, Specialty, Rank, Category, ClassificationMapping } from '../../../types/classification';

type ItemType = Field | Specialty | Rank | Category | ClassificationMapping;
type TabKey = 'fields' | 'specialties' | 'ranks' | 'categories' | 'mappings';

interface ClassificationCardProps {
  item: ItemType;
  tabKey: TabKey;
  color: { from: string; to: string; bg: string; text: string; badge: string; ring: string };
  onEdit?: (item: ItemType) => void;
  onDelete?: (item: ItemType) => void;
  onToggleActive?: (item: Field | Specialty | Rank | Category) => void;
}

const getItemName = (item: ItemType): string => {
  if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) {
    const m = item as ClassificationMapping;
    return m.category?.name || '—';
  }
  return (item as Field | Specialty | Rank | Category).name || '—';
};

const getItemCode = (item: ItemType): string | undefined => {
  if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) {
    return (item as ClassificationMapping).category?.code;
  }
  return (item as Field | Specialty | Rank | Category).code;
};

const getItemDescription = (item: ItemType): string | null => {
  if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) return null;
  return (item as Field | Specialty | Rank | Category).description || null;
};

const getItemActive = (item: ItemType): boolean => {
  if ('is_active' in item) return (item as Field | Specialty | Rank | Category).is_active;
  return true;
};

export const ClassificationCard: React.FC<ClassificationCardProps> = ({
  item,
  tabKey,
  color,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const name = getItemName(item);
  const description = getItemDescription(item);
  const isActive = getItemActive(item);
  const code = getItemCode(item);

  return (
    <Card
      variant="outlined"
      padding="md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-lg bg-gradient-to-br ${color.from} ${color.to} ${color.text}`}>
            {((tabKey === 'categories' || tabKey === 'mappings' ? code : name) || '—').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900 truncate">{tabKey === 'categories' || tabKey === 'mappings' ? code : name}</h4>
            </div>
            {tabKey === 'mappings' && (
              <div className="space-y-1 mt-1">
                <p className="text-sm text-gray-500">Field: {(item as ClassificationMapping).field?.name || '—'}</p>
                <p className="text-sm text-gray-500">Specialty: {(item as ClassificationMapping).specialty?.name || '—'}</p>
                <p className="text-sm text-gray-500">Rank: {(item as ClassificationMapping).rank?.name || '—'}</p>
              </div>
            )}
            {tabKey === 'specialties' && (item as Specialty).field && (
              <p className="text-sm text-gray-400 mt-1">
                Field: {(item as Specialty).field!.name}
              </p>
            )}
            {description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tabKey !== 'mappings' && onToggleActive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(item as Field | Specialty | Rank | Category);
              }}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </button>
          )}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
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
                    onDelete(item);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
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

export default ClassificationCard;
