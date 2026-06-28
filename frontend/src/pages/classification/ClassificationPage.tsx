import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import {
  FieldForm,
  SpecialtyForm,
  RankForm,
  CategoryForm,
  ClassificationMappingForm,
  ClassificationCard,
} from '../../components/features/classification';
import {
  useFieldStore,
  useSpecialtyStore,
  useRankStore,
  useCategoryStore,
  useClassificationStore,
} from '../../stores';
import { useToast } from '../../components/ui/toast';
import { useAuthStore } from '../../stores/authStore';
import type {
  Field,
  FieldCreateInput,
  Specialty,
  SpecialtyCreateInput,
  Rank,
  RankCreateInput,
  Category,
  CategoryCreateInput,
  ClassificationMapping,
  ClassificationMappingCreateInput,
  ClassificationResolveInput,
} from '../../types/classification';

type TabKey = 'fields' | 'specialties' | 'ranks' | 'categories' | 'mappings';
type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ─── Tab Configuration ──────────────────────────────────────────────────────
const TABS: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'fields',
    label: 'Fields',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'sky',
  },
  {
    key: 'specialties',
    label: 'Specialties',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    key: 'ranks',
    label: 'Ranks',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    color: 'violet',
  },
  {
    key: 'mappings',
    label: 'Mappings',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: 'emerald',
  },
];

const TAB_PERMISSION_MAP: Record<TabKey, string> = {
  fields: 'fields.view',
  specialties: 'specialties.view',
  ranks: 'ranks.view',
  categories: 'categories.view',
  mappings: 'classifications.view',
};

const COLOR_MAP: Record<string, { from: string; to: string; bg: string; text: string; badge: string; ring: string }> = {
  sky: { from: 'from-sky-100', to: 'to-sky-100', bg: 'bg-sky-100', text: 'text-sky-700', badge: 'bg-sky-100 text-sky-700', ring: 'ring-sky-500' },
  indigo: { from: 'from-indigo-100', to: 'to-indigo-100', bg: 'bg-indigo-100', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700', ring: 'ring-indigo-500' },
  blue: { from: 'from-blue-100', to: 'to-blue-100', bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', ring: 'ring-blue-500' },
  violet: { from: 'from-violet-100', to: 'to-violet-100', bg: 'bg-violet-100', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700', ring: 'ring-violet-500' },
  emerald: { from: 'from-emerald-100', to: 'to-emerald-100', bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-500' },
};

type ItemType = Field | Specialty | Rank | Category | ClassificationMapping;

// ─── Dropdown Item ──────────────────────────────────────────────────────────
interface DropdownItemProps {
  item: ItemType;
  tabKey: TabKey;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (item: ItemType) => void;
  onEdit: (item: ItemType) => void;
  onDelete: (item: ItemType) => void;
  onToggleActive?: (item: Field | Specialty | Rank | Category) => void;
  hasPerm?: (perm: string) => boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  item,
  tabKey,
  isSelected,
  isHighlighted,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
  hasPerm,
}) => {
  const color = COLOR_MAP[TABS.find((t) => t.key === tabKey)?.color || 'sky'];

  const getName = () => {
    if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) {
      const m = item as ClassificationMapping;
      return `${m.field?.name || '—'} / ${m.specialty?.name || '—'} / ${m.rank?.name || '—'}`;
    }
    return (item as Field | Specialty | Rank | Category).name || '—';
  };

  const getSubtitle = () => {
    if (tabKey === 'specialties') {
      return (item as Specialty).field?.name;
    }
    if (tabKey === 'mappings') {
      const m = item as ClassificationMapping;
      return `${m.field?.name || ''} / ${m.specialty?.name || ''} / ${m.rank?.name || ''} → ${m.category?.name || ''}`;
    }
    return (item as Field | Specialty | Rank | Category).description;
  };

  const getCode = (): string | undefined => {
    if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) return undefined;
    return (item as Field | Specialty | Rank | Category).code;
  };

  const isActive = 'is_active' in item ? (item as Field | Specialty | Rank | Category).is_active : true;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? `bg-gradient-to-r ${color.bg.replace('100', '50')} to-white border-l-4 ${color.text.replace('700', '500').replace('text', 'border')}`
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(item)}
    >
      {/* Icon Badge */}
      <div className={`
        shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm
        transition-colors duration-200
        ${isSelected
          ? `bg-gradient-to-br ${color.from} ${color.to} ${color.text} shadow-md`
          : `${color.bg} ${color.text}`
        }
      `}>
        {(tabKey === 'categories' ? (getCode() || getName()) : getName()).charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? color.text : 'text-gray-900'}`}>
            {tabKey === 'categories' ? (getCode() || getName()) : getName()}
          </span>
          {tabKey !== 'mappings' && onToggleActive && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleActive(item as Field | Specialty | Rank | Category); }}
              className={`
                text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
                ${isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {isActive ? 'Active' : 'Inactive'}
            </button>
          )}
        </div>
        {getSubtitle() && (
          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{getSubtitle()}</p>
        )}
        {tabKey === 'categories' && getCode() && (
          <p className="text-xs text-gray-500 mt-0.5">{getCode()}</p>
        )}
      </div>

      {/* Actions */}
      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {tabKey !== 'mappings' && onToggleActive && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(item as Field | Specialty | Rank | Category); }}
            className={`
              p-1.5 rounded-lg transition-colors
              ${isActive
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100'
              }
            `}
            title={isActive ? 'Deactivate' : 'Activate'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isActive
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              }
            </svg>
          </button>
        )}
        {(!hasPerm || hasPerm(`${tabKey === 'mappings' ? 'classifications' : tabKey}.edit`)) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {(!hasPerm || hasPerm(`${tabKey === 'mappings' ? 'classifications' : tabKey}.delete`)) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Detail Panel ───────────────────────────────────────────────────────────
interface DetailPanelProps {
  item: ItemType;
  tabKey: TabKey;
  onEdit: (item: ItemType) => void;
  onDelete: (item: ItemType) => void;
  onToggleActive?: (item: Field | Specialty | Rank | Category) => void;
  hasPerm?: (perm: string) => boolean;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  item,
  tabKey,
  onEdit,
  onDelete,
  onToggleActive,
  hasPerm,
}) => {
  const color = COLOR_MAP[TABS.find((t) => t.key === tabKey)?.color || 'sky'];

  const getName = () => {
    if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) {
      const m = item as ClassificationMapping;
      return `${m.field?.name || '—'} / ${m.specialty?.name || '—'} / ${m.rank?.name || '—'}`;
    }
    return (item as Field | Specialty | Rank | Category).name || '—';
  };

  const getCode = (): string | undefined => {
    if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) {
      return (item as ClassificationMapping).category?.code;
    }
    return (item as Field | Specialty | Rank | Category).code;
  };

  const isActive = 'is_active' in item ? (item as Field | Specialty | Rank | Category).is_active : true;
  const description = 'description' in item ? (item as Field | Specialty | Rank | Category).description : null;

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color.from} ${color.to} flex items-center justify-center ${color.text} font-bold text-lg shadow-lg`}>
            {(tabKey === 'categories' || tabKey === 'mappings' ? getCode() || getName() : getName()).charAt(0).toUpperCase()}
          </div>
          <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{tabKey === 'mappings' ? getCode() || getName() : getName()}</h2>
                {tabKey !== 'mappings' && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>

        <div className="flex items-center gap-2">
          {tabKey !== 'mappings' && onToggleActive && (!hasPerm || hasPerm(`${tabKey}.edit`)) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(item as Field | Specialty | Rank | Category)}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          {(!hasPerm || hasPerm(`${tabKey === 'mappings' ? 'classifications' : tabKey}.edit`)) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
          {(!hasPerm || hasPerm(`${tabKey === 'mappings' ? 'classifications' : tabKey}.delete`)) && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(item)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        {tabKey === 'specialties' && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide">Field</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {(item as Specialty).field?.name || '—'}
            </p>
          </div>
        )}

        {tabKey === 'mappings' && (
          <>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wide">Field</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">{(item as ClassificationMapping).field?.name || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wide">Specialty</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">{(item as ClassificationMapping).specialty?.name || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wide">Rank</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">{(item as ClassificationMapping).rank?.name || '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wide">Category</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-1">{(item as ClassificationMapping).category?.code || '—'}</p>
            </div>
          </>
        )}

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Created</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Updated</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {description && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      )}

      {(item as ClassificationMapping).notes && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
          <p className="text-sm text-gray-700">{(item as ClassificationMapping).notes}</p>
        </div>
      )}
    </Card>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export const ClassificationPage: React.FC = () => {
  const { addToast } = useToast();

  // Permission gating
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const visibleTabs = TABS.filter((tab) => hasPermission(TAB_PERMISSION_MAP[tab.key]));
  const noneVisible = visibleTabs.length === 0;

  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>('fields');
  const [currentPage, setCurrentPage] = useState(1);

  // Redirect to first visible tab if current tab lacks permission
  useEffect(() => {
    if (!noneVisible && !visibleTabs.some((t) => t.key === activeTab)) {
      setActiveTab(visibleTabs[0].key);
    }
  }, [noneVisible, visibleTabs, activeTab]);

  // ─── Store Hooks ────────────────────────────────────────────────────────
  const fields = useFieldStore((s) => s.fields);
  const fieldsLoading = useFieldStore((s) => s.isLoading);
  const fieldsImporting = useFieldStore((s) => s.isImporting);
  const fieldsError = useFieldStore((s) => s.error);
  const fieldsPagination = useFieldStore((s) => s.pagination);
  const fetchFields = useFieldStore((s) => s.fetchFields);
  const createField = useFieldStore((s) => s.createField);
  const updateField = useFieldStore((s) => s.updateField);
  const deleteField = useFieldStore((s) => s.deleteField);
  const clearFieldsError = useFieldStore((s) => s.clearError);
  const exportFields = useFieldStore((s) => s.exportFields);
  const importFields = useFieldStore((s) => s.importFields);

  const specialties = useSpecialtyStore((s) => s.specialties);
  const specialtiesLoading = useSpecialtyStore((s) => s.isLoading);
  const specialtiesImporting = useSpecialtyStore((s) => s.isImporting);
  const specialtiesError = useSpecialtyStore((s) => s.error);
  const specialtiesPagination = useSpecialtyStore((s) => s.pagination);
  const fetchSpecialties = useSpecialtyStore((s) => s.fetchSpecialties);
  const createSpecialty = useSpecialtyStore((s) => s.createSpecialty);
  const updateSpecialty = useSpecialtyStore((s) => s.updateSpecialty);
  const deleteSpecialty = useSpecialtyStore((s) => s.deleteSpecialty);
  const fetchSpecialtiesByField = useSpecialtyStore((s) => s.fetchSpecialtiesByField);
  const clearSpecialtiesError = useSpecialtyStore((s) => s.clearError);
  const exportSpecialties = useSpecialtyStore((s) => s.exportSpecialties);
  const importSpecialties = useSpecialtyStore((s) => s.importSpecialties);

  const ranks = useRankStore((s) => s.ranks);
  const ranksLoading = useRankStore((s) => s.isLoading);
  const ranksImporting = useRankStore((s) => s.isImporting);
  const ranksError = useRankStore((s) => s.error);
  const ranksPagination = useRankStore((s) => s.pagination);
  const fetchRanks = useRankStore((s) => s.fetchRanks);
  const createRank = useRankStore((s) => s.createRank);
  const updateRank = useRankStore((s) => s.updateRank);
  const deleteRank = useRankStore((s) => s.deleteRank);
  const clearRanksError = useRankStore((s) => s.clearError);
  const exportRanks = useRankStore((s) => s.exportRanks);
  const importRanks = useRankStore((s) => s.importRanks);

  const categories = useCategoryStore((s) => s.categories);
  const categoriesLoading = useCategoryStore((s) => s.isLoading);
  const categoriesImporting = useCategoryStore((s) => s.isImporting);
  const categoriesError = useCategoryStore((s) => s.error);
  const categoriesPagination = useCategoryStore((s) => s.pagination);
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);
  const createCategory = useCategoryStore((s) => s.createCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);
  const clearCategoriesError = useCategoryStore((s) => s.clearError);
  const exportCategories = useCategoryStore((s) => s.exportCategories);
  const importCategories = useCategoryStore((s) => s.importCategories);

  const mappings = useClassificationStore((s) => s.mappings);
  const mappingsLoading = useClassificationStore((s) => s.isLoading);
  const mappingsImporting = useClassificationStore((s) => s.isImporting);
  const mappingsError = useClassificationStore((s) => s.error);
  const mappingsPagination = useClassificationStore((s) => s.pagination);
  const fetchMappings = useClassificationStore((s) => s.fetchMappings);
  const createMapping = useClassificationStore((s) => s.createMapping);
  const updateMapping = useClassificationStore((s) => s.updateMapping);
  const deleteMapping = useClassificationStore((s) => s.deleteMapping);
  const resolveClassification = useClassificationStore((s) => s.resolveClassification);
  const resolveResult = useClassificationStore((s) => s.resolveResult);
  const clearMappingsError = useClassificationStore((s) => s.clearError);
  const clearResolveResult = useClassificationStore((s) => s.clearResolveResult);
  const exportClassifications = useClassificationStore((s) => s.exportClassifications);
  const importClassifications = useClassificationStore((s) => s.importClassifications);

  // ─── Search & Filter State ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [fieldFilter, setFieldFilter] = useState<number | null>(null);

  // ─── Dropdown State ─────────────────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Modal State ────────────────────────────────────────────────────────
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemType | null>(null);
  const [deletingItem, setDeletingItem] = useState<ItemType | null>(null);

  // Resolve state
  const [resolveFieldId, setResolveFieldId] = useState<number | null>(null);
  const [resolveSpecialtyId, setResolveSpecialtyId] = useState<number | null>(null);
  const [resolveRankId, setResolveRankId] = useState<number | null>(null);
  const [filteredSpecialtiesForResolve, setFilteredSpecialtiesForResolve] = useState<Specialty[]>([]);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Load Data ──────────────────────────────────────────────────────────
  const buildFilters = useCallback(() => {
    const filters: Record<string, string | boolean | number | undefined> = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== '') filters.is_active = statusFilter;
    if (fieldFilter) filters.field_id = fieldFilter;
    return filters;
  }, [searchQuery, statusFilter, fieldFilter]);

  const loadData = useCallback(async (page: number = 1, filtersOverride?: Record<string, string | boolean | number | undefined>, tabKey?: TabKey) => {
    const filters = filtersOverride !== undefined ? filtersOverride : buildFilters();
    const targetTab = tabKey ?? activeTab;
    switch (targetTab) {
      case 'fields':
        await fetchFields({ page, per_page: 15, filters });
        break;
      case 'specialties':
        await fetchSpecialties({ page, per_page: 15, filters });
        break;
      case 'ranks':
        await fetchRanks({ page, per_page: 15, filters });
        break;
      case 'categories':
        await fetchCategories({ page, per_page: 15, filters });
        break;
      case 'mappings':
        await fetchMappings({ page, per_page: 15, filters });
        break;
    }
    setCurrentPage(page);
  }, [activeTab, buildFilters, fetchFields, fetchSpecialties, fetchRanks, fetchCategories, fetchMappings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load all fields for dropdowns
  useEffect(() => {
    const loadAllFields = async () => {
      await fetchFields({ page: 1, per_page: 1000 });
    };
    loadAllFields();
  }, [fetchFields]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = async (item: ItemType) => {
    setEditingItem(item);
    setShowFormModal(true);
    setShowDeleteModal(false);

    // When editing a mapping, load specialties for its field and all ranks/categories
    if (activeTab === 'mappings') {
      const mapping = item as ClassificationMapping;
      if (mapping.field_id) {
        await fetchSpecialtiesByField(mapping.field_id);
      }
      await Promise.all([
        fetchRanks({ per_page: 9999 }),
        fetchCategories({ per_page: 9999 }),
      ]);
    }
  };

  const handleOpenDelete = (item: ItemType) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingItem(null);
    setDeletingItem(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadData(1);
    setDropdownOpen(true);
  };

  const handleSelect = (item: ItemType) => {
    setSelectedItem(item);
    setDropdownOpen(false);
    setSearchQuery(getItemName(item));
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    const items = getActiveItems();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(items[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedItem(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setFieldFilter(null);
    setSelectedItem(null);
    setCurrentPage(1);
    loadData(1, {});
  };

  // ─── Form Submissions ───────────────────────────────────────────────────
  const handleFieldSubmit = async (data: FieldCreateInput) => {
    try {
      if (editingItem) {
        await updateField(editingItem.id, data);
        addToast('Field updated successfully', 'success');
      } else {
        await createField(data);
        addToast('Field created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store error state — modal stays open
    }
  };

  const handleSpecialtySubmit = async (data: SpecialtyCreateInput) => {
    try {
      if (editingItem) {
        await updateSpecialty(editingItem.id, data);
        addToast('Specialty updated successfully', 'success');
      } else {
        await createSpecialty(data);
        addToast('Specialty created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store error state — modal stays open
    }
  };

  const handleRankSubmit = async (data: RankCreateInput) => {
    try {
      if (editingItem) {
        await updateRank(editingItem.id, data);
        addToast('Rank updated successfully', 'success');
      } else {
        await createRank(data);
        addToast('Rank created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store error state — modal stays open
    }
  };

  const handleCategorySubmit = async (data: CategoryCreateInput) => {
    try {
      if (editingItem) {
        await updateCategory(editingItem.id, data);
        addToast('Category updated successfully', 'success');
      } else {
        await createCategory(data);
        addToast('Category created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store error state — modal stays open
    }
  };

  const handleMappingSubmit = async (data: ClassificationMappingCreateInput) => {
    try {
      if (editingItem) {
        await updateMapping(editingItem.id, data);
        addToast('Mapping updated successfully', 'success');
      } else {
        await createMapping(data);
        addToast('Mapping created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store error state — modal stays open
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    switch (activeTab) {
      case 'fields':
        await deleteField(deletingItem.id);
        addToast('Field deleted successfully', 'success');
        break;
      case 'specialties':
        await deleteSpecialty(deletingItem.id);
        addToast('Specialty deleted successfully', 'success');
        break;
      case 'ranks':
        await deleteRank(deletingItem.id);
        addToast('Rank deleted successfully', 'success');
        break;
      case 'categories':
        await deleteCategory(deletingItem.id);
        addToast('Category deleted successfully', 'success');
        break;
      case 'mappings':
        await deleteMapping(deletingItem.id);
        addToast('Mapping deleted successfully', 'success');
        break;
    }

    if (selectedItem?.id === deletingItem.id) {
      setSelectedItem(null);
      setSearchQuery('');
    }

    handleCloseModal();
  };

  // ─── Toggle Active ──────────────────────────────────────────────────────
  const handleToggleActive = async (item: Field | Specialty | Rank | Category) => {
    switch (activeTab) {
      case 'fields':
        await updateField(item.id, { is_active: !item.is_active });
        break;
      case 'specialties':
        await updateSpecialty(item.id, { is_active: !item.is_active });
        break;
      case 'ranks':
        await updateRank(item.id, { is_active: !item.is_active });
        break;
      case 'categories':
        await updateCategory(item.id, { is_active: !item.is_active });
        break;
    }

    if (selectedItem?.id === item.id) {
      const updated = { ...item, is_active: !item.is_active };
      setSelectedItem(updated as ItemType);
    }

    addToast(`${getItemName(item)} ${!item.is_active ? 'activated' : 'deactivated'}`, 'success');
  };

  // ─── Resolve Handler ────────────────────────────────────────────────────
  const handleResolve = async () => {
    if (!resolveFieldId || !resolveSpecialtyId || !resolveRankId) {
      addToast('Please select field, specialty, and rank', 'error');
      return;
    }

    const resolveInput: ClassificationResolveInput = {
      field_id: resolveFieldId,
      specialty_id: resolveSpecialtyId,
      rank_id: resolveRankId,
    };

    await resolveClassification(resolveInput);
  };

  const handleFieldChangeForResolve = async (fieldId: number) => {
    setResolveFieldId(fieldId);
    setResolveSpecialtyId(null);
    const data = await fetchSpecialtiesByField(fieldId);
    setFilteredSpecialtiesForResolve(data);
  };

  const handleFieldChangeForMapping = async (fieldId: number) => {
    await fetchSpecialtiesByField(fieldId);
  };

  // ─── Import / Export Handlers ───────────────────────────────────────────
  const getActiveExportFn = () => {
    switch (activeTab) {
      case 'fields': return exportFields;
      case 'specialties': return exportSpecialties;
      case 'ranks': return exportRanks;
      case 'categories': return exportCategories;
      case 'mappings': return exportClassifications;
      default: return exportFields;
    }
  };

  const getActiveImportFn = () => {
    switch (activeTab) {
      case 'fields': return importFields;
      case 'specialties': return importSpecialties;
      case 'ranks': return importRanks;
      case 'categories': return importCategories;
      case 'mappings': return importClassifications;
      default: return importFields;
    }
  };

  const getActiveIsImporting = () => {
    switch (activeTab) {
      case 'fields': return fieldsImporting;
      case 'specialties': return specialtiesImporting;
      case 'ranks': return ranksImporting;
      case 'categories': return categoriesImporting;
      case 'mappings': return mappingsImporting;
      default: return false;
    }
  };

  const getEntityLabelPlural = () => {
    switch (activeTab) {
      case 'fields': return 'Fields';
      case 'specialties': return 'Specialties';
      case 'ranks': return 'Ranks';
      case 'categories': return 'Categories';
      case 'mappings': return 'Classifications';
      default: return 'Data';
    }
  };

  const handleExport = async (format: ExportFormat = 'xlsx') => {
    try {
      const exportFn = getActiveExportFn();
      const blob = await exportFn(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeTab}-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast(`${getEntityLabelPlural()} exported successfully`, 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast(`Failed to export ${activeTab}`, 'error');
    }
  };

  const handleExportFormatSelect = (format: ExportFormat) => {
    handleExport(format);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSample = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sampleFns: Record<TabKey, () => Promise<any>> = {
        fields: () => import('../../api/services').then(m => m.fieldService.downloadSample()),
        specialties: () => import('../../api/services').then(m => m.specialtyService.downloadSample()),
        ranks: () => import('../../api/services').then(m => m.rankService.downloadSample()),
        categories: () => import('../../api/services').then(m => m.categoryService.downloadSample()),
        mappings: () => import('../../api/services').then(m => m.classificationService.downloadSample()),
      };

      const response = await sampleFns[activeTab]();
      const url = window.URL.createObjectURL(new Blob([response as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}-sample-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Sample template downloaded', 'success');
    } catch {
      addToast('Failed to download sample template', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExtension) {
      addToast('Please select a valid Excel or CSV file', 'error');
      return;
    }

    try {
      const importFn = getActiveImportFn();
      const result = await importFn(file);
      if (result.success) {
        addToast(result.message || `${getEntityLabelPlural()} imported successfully`, 'success');
      } else {
        addToast(result.message || `Failed to import ${activeTab}`, 'error');
      }
    } catch {
      addToast(`Failed to import ${activeTab}`, 'error');
    }

    // Reset local state and refresh data after import
    setCurrentPage(1);
    setSelectedItem(null);
    setSearchQuery('');
    loadData(1, {});

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  // ─── Helpers ────────────────────────────────────────────────────────────
  const getItemName = (item: ItemType): string => {
    if ('field_id' in item && 'specialty_id' in item && 'rank_id' in item) {
      const m = item as ClassificationMapping;
      return `${m.field?.name || 'Field'} / ${m.specialty?.name || 'Specialty'} / ${m.rank?.name || 'Rank'}`;
    }
    return (item as Field | Specialty | Rank | Category).name;
  };

  const getActiveItems = (): ItemType[] => {
    switch (activeTab) {
      case 'fields': return fields;
      case 'specialties': return specialties;
      case 'ranks': return ranks;
      case 'categories': return categories;
      case 'mappings': return mappings;
      default: return [];
    }
  };

  const getActiveLoading = (): boolean => {
    switch (activeTab) {
      case 'fields': return fieldsLoading;
      case 'specialties': return specialtiesLoading;
      case 'ranks': return ranksLoading;
      case 'categories': return categoriesLoading;
      case 'mappings': return mappingsLoading;
      default: return false;
    }
  };

  const getActiveError = (): string | null => {
    switch (activeTab) {
      case 'fields': return fieldsError;
      case 'specialties': return specialtiesError;
      case 'ranks': return ranksError;
      case 'categories': return categoriesError;
      case 'mappings': return mappingsError;
      default: return null;
    }
  };

  const getActivePagination = () => {
    switch (activeTab) {
      case 'fields': return fieldsPagination;
      case 'specialties': return specialtiesPagination;
      case 'ranks': return ranksPagination;
      case 'categories': return categoriesPagination;
      case 'mappings': return mappingsPagination;
      default: return { currentPage: 1, totalPages: 1, total: 0, perPage: 15 };
    }
  };

  const clearActiveError = () => {
    switch (activeTab) {
      case 'fields': clearFieldsError(); break;
      case 'specialties': clearSpecialtiesError(); break;
      case 'ranks': clearRanksError(); break;
      case 'categories': clearCategoriesError(); break;
      case 'mappings': clearMappingsError(); break;
    }
  };

  const getAllSpecialties = () => {
    if (fieldFilter) {
      return specialties.filter((s) => s.field_id === fieldFilter);
    }
    return specialties;
  };

  const entityForPerm = activeTab === 'mappings' ? 'classifications' : activeTab;
  const color = COLOR_MAP[TABS.find((t) => t.key === activeTab)?.color || 'sky'];

  if (noneVisible) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-sm text-gray-500">You do not have permission to view any classification data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            SHC Classification System
          </h1>
          <p className="text-slate-500 mt-1">Search and manage fields, specialties, ranks, categories, and mappings</p>
        </div>
        <div className="flex gap-2">
          {(() => {
            const entity = activeTab === 'mappings' ? 'classifications' : activeTab;
            return hasPermission(`${entity}.export`) || hasPermission(`${entity}.import`);
          })() && (
            <Button
              variant="outline"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              }
              onClick={() => setShowDataModal(true)}
            >
              Data
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
          />
          {activeTab === 'mappings' && hasPermission('classifications.view') && (
            <Button
              variant="outline"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              onClick={async () => {
                setShowResolveModal(true);
                clearResolveResult();
                await fetchRanks({ per_page: 9999 });
              }}
            >
              Resolve
            </Button>
          )}
          {hasPermission(`${activeTab === 'mappings' ? 'classifications' : activeTab}.create`) && (
            <Button
              variant="gradient"
              gradient="from-sky-500 to-indigo-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={handleOpenCreate}
            >
              Add {activeTab === 'mappings' ? 'Mapping' : activeTab.slice(0, -1)}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); setSelectedItem(null); setSearchQuery(''); setStatusFilter(''); setFieldFilter(null); setDropdownOpen(false); loadData(1, {}, tab.key); }}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.key
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {getActiveError() && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-red-600">{getActiveError()}</p>
          <button onClick={clearActiveError} className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Search + Filter Bar */}
      <Card variant="outlined" padding="md">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          {/* Searchable Dropdown */}
          <div ref={dropdownRef} className="flex-1 min-w-[280px] relative">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Search {activeTab}
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder={`Type to search... (e.g., ${activeTab.slice(0, -1)} name)`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => { setHighlightedIndex(-1); setDropdownOpen(true); }}
                onKeyDown={handleDropdownKeyDown}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                rightIcon={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : null
                }
              />

              {/* Dropdown List */}
              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto">
                  {getActiveLoading() ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                    </div>
                  ) : getActiveItems().length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? `No ${activeTab} match your search` : `No ${activeTab} found`}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : `Create a new ${activeTab.slice(0, -1)} to get started`}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {getActiveItems().map((item, index) => (
                        <DropdownItem
                          key={item.id}
                          item={item}
                          tabKey={activeTab}
                          isSelected={selectedItem?.id === item.id}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleSelect}
                          onEdit={handleOpenEdit}
                          onDelete={handleOpenDelete}
                          onToggleActive={activeTab !== 'mappings' ? handleToggleActive : undefined}
                          hasPerm={hasPermission}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
{!getActiveLoading() && !selectedItem && getActiveItems().length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{getActiveItems().length} result{getActiveItems().length !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-2">
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd>
                        navigate
                        <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd>
                        select
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          {activeTab !== 'mappings' && (
            <div className="w-44">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Status
              </label>
              <SearchableCombobox
                value={statusFilter === '' ? null : (statusFilter ? 1 : 0)}
                onChange={(val) => {
                  if (val === null || val === '') setStatusFilter('');
                  else if (val === 1) setStatusFilter(true);
                  else if (val === 0) setStatusFilter(false);
                  else setStatusFilter('');
                }}
                options={[
                  { value: null, label: 'All Statuses' },
                  { value: 1, label: 'Active' },
                  { value: 0, label: 'Inactive' },
                ]}
                placeholder="Filter by status..."
                noSelectionLabel="All Statuses"
                clearable={false}
              />
            </div>
          )}

          {/* Field Filter for Specialties & Mappings */}
          {(activeTab === 'specialties' || activeTab === 'mappings') && (
            <div className="w-56">
              <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                Field
              </label>
              <SearchableCombobox
                value={fieldFilter}
                onChange={(val) => {
                  setFieldFilter(val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : null);
                }}
                options={fields.map((f) => ({
                  value: f.id,
                  label: f.name,
                }))}
                placeholder="Filter by field..."
                noSelectionLabel="All Fields"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="outline">
              Search
            </Button>
            {(searchQuery || statusFilter !== '' || fieldFilter) && (
              <Button type="button" variant="ghost" onClick={handleClearFilters}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Loading state */}
      {getActiveLoading() && (
        <div className="flex items-center justify-center py-12">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${color.ring.replace('ring', 'border')}`}></div>
        </div>
      )}

      {/* Card Grid */}
      {!getActiveLoading() && !selectedItem && getActiveItems().length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {getActiveItems().map((item) => (
            <ClassificationCard
              key={item.id}
              item={item}
              tabKey={activeTab}
              color={COLOR_MAP[TABS.find((t) => t.key === activeTab)?.color || 'sky']}
              onEdit={hasPermission(`${activeTab === 'mappings' ? 'classifications' : activeTab}.edit`) ? handleOpenEdit : undefined}
              onDelete={hasPermission(`${activeTab === 'mappings' ? 'classifications' : activeTab}.delete`) ? handleOpenDelete : undefined}
              onToggleActive={activeTab !== 'mappings' && hasPermission(`${activeTab}.edit`) ? handleToggleActive : undefined}
            />
          ))}
        </div>
      )}

      {/* Selected item card at grid width (from search dropdown or card click) */}
      {!getActiveLoading() && selectedItem && (
        <div className="w-full md:w-1/2 lg:w-1/2">
          <ClassificationCard
            item={selectedItem}
            tabKey={activeTab}
            color={COLOR_MAP[TABS.find((t) => t.key === activeTab)?.color || 'sky']}
            onEdit={hasPermission(`${activeTab === 'mappings' ? 'classifications' : activeTab}.edit`) ? handleOpenEdit : undefined}
            onDelete={hasPermission(`${activeTab === 'mappings' ? 'classifications' : activeTab}.delete`) ? handleOpenDelete : undefined}
            onToggleActive={activeTab !== 'mappings' && hasPermission(`${activeTab}.edit`) ? handleToggleActive : undefined}
          />
        </div>
      )}

      {/* Detail Panel */}
      {!getActiveLoading() && selectedItem && (
        <DetailPanel
          item={selectedItem}
          tabKey={activeTab}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleActive={activeTab !== 'mappings' ? handleToggleActive : undefined}
          hasPerm={hasPermission}
        />
      )}

      {/* Empty state */}
      {!getActiveLoading() && getActiveItems().length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No {activeTab} yet
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first {activeTab === 'mappings' ? 'classification mapping' : activeTab.slice(0, -1)}.
              </p>
              {hasPermission(`${activeTab === 'mappings' ? 'classifications' : activeTab}.create`) && (
                <div className="mt-6">
                  <Button
                    variant="gradient"
                    gradient="from-sky-500 to-indigo-500"
                    onClick={handleOpenCreate}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    Create {activeTab === 'mappings' ? 'Mapping' : activeTab.slice(0, -1)}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!getActiveLoading() && getActivePagination().totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * getActivePagination().perPage) + 1} to {Math.min(currentPage * getActivePagination().perPage, getActivePagination().total)} of {getActivePagination().total} {getEntityLabelPlural().toLowerCase()}
            <span className="ml-2 text-gray-400">(Page {currentPage} of {getActivePagination().totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => loadData(currentPage - 1)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Previous
            </Button>
            {(() => {
              const total = getActivePagination().totalPages;
              const maxVisible = 7;
              let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              const end = Math.min(total, start + maxVisible - 1);
              if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
              }
              return Array.from({ length: end - start + 1 }, (_, i) => start + i);
            })().map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => loadData(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= getActivePagination().totalPages}
              onClick={() => loadData(currentPage + 1)}
              rightIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showFormModal} onClose={handleCloseModal} size="lg">
        <ModalHeader
          title={
            editingItem
              ? `Edit ${activeTab === 'mappings' ? 'Mapping' : activeTab.slice(0, -1)}`
              : `Create ${activeTab === 'mappings' ? 'Mapping' : activeTab.slice(0, -1)}`
          }
          onClose={handleCloseModal}
        />
        <ModalContent>
          {activeTab === 'fields' && (
            <FieldForm
              field={editingItem as Field | undefined}
              onSubmit={handleFieldSubmit}
              onCancel={handleCloseModal}
              isLoading={fieldsLoading}
            />
          )}
          {activeTab === 'specialties' && (
            <SpecialtyForm
              specialty={editingItem as Specialty | undefined}
              onSubmit={handleSpecialtySubmit}
              onCancel={handleCloseModal}
              isLoading={specialtiesLoading}
              fields={fields}
            />
          )}
          {activeTab === 'ranks' && (
            <RankForm
              rank={editingItem as Rank | undefined}
              onSubmit={handleRankSubmit}
              onCancel={handleCloseModal}
              isLoading={ranksLoading}
            />
          )}
          {activeTab === 'categories' && (
            <CategoryForm
              category={editingItem as Category | undefined}
              onSubmit={handleCategorySubmit}
              onCancel={handleCloseModal}
              isLoading={categoriesLoading}
            />
          )}
          {activeTab === 'mappings' && (
            <ClassificationMappingForm
              mapping={editingItem as ClassificationMapping | undefined}
              onSubmit={handleMappingSubmit}
              onCancel={handleCloseModal}
              isLoading={mappingsLoading}
              fields={fields}
              specialties={getAllSpecialties()}
              ranks={ranks}
              categories={categories}
              onFieldChange={handleFieldChangeForMapping}
            />
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader title="Delete Confirmation" onClose={handleCloseModal} />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingItem ? getItemName(deletingItem) : ''}</strong>? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={getActiveLoading()}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Resolve Classification Modal */}
      <Modal isOpen={showResolveModal} onClose={() => { setShowResolveModal(false); clearResolveResult(); }} size="lg">
        <ModalHeader title="Resolve Classification" onClose={() => { setShowResolveModal(false); clearResolveResult(); }} />
        <ModalContent>
          <div className="space-y-4">
            <SearchableCombobox
              id="resolve-field"
              label="Field"
              value={resolveFieldId}
              onChange={(val) => {
                const fieldId = val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : null;
                if (fieldId) handleFieldChangeForResolve(fieldId);
              }}
              options={fields.map((f) => ({
                value: f.id,
                label: f.name,
              }))}
              placeholder="Select a field..."
              noSelectionLabel="Select a field"
              required
            />

            <SearchableCombobox
              id="resolve-specialty"
              label="Specialty"
              value={resolveSpecialtyId}
              onChange={(val) => {
                setResolveSpecialtyId(val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : null);
              }}
              options={filteredSpecialtiesForResolve.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
              placeholder={resolveFieldId ? 'Select a specialty...' : 'Select a field first'}
              noSelectionLabel="Select a specialty"
              required
              disabled={!resolveFieldId}
            />

            <SearchableCombobox
              id="resolve-rank"
              label="Rank"
              value={resolveRankId}
              onChange={(val) => {
                setResolveRankId(val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : null);
              }}
              options={ranks.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
              placeholder="Select a rank..."
              noSelectionLabel="Select a rank"
              required
            />

            <div className="flex justify-end pt-4">
              <Button
                variant="gradient"
                gradient="from-sky-500 to-indigo-500"
                onClick={handleResolve}
                isLoading={mappingsLoading}
              >
                Resolve
              </Button>
            </div>

            {/* Resolve Result */}
            {resolveResult && (
              <div className={`mt-4 p-4 rounded-xl border ${
                resolveResult.category
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <h4 className={`font-semibold ${
                  resolveResult.category ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {resolveResult.category ? 'Classification Found' : 'No Classification Found'}
                </h4>
                <p className={`text-sm mt-1 ${
                  resolveResult.category ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {resolveResult.message}
                </p>
                {resolveResult.category && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-700">
                      {resolveResult.category.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>

      {/* Import/Export Data Modal */}
      <Modal isOpen={showDataModal} onClose={handleCloseDataModal} size="lg">
        <div className="p-6 relative">
            <button
                onClick={handleCloseDataModal}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          {showImportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-sky-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Import {getEntityLabelPlural()}</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file</p></div>
                </button>
                <button onClick={handleImportClick} disabled={getActiveIsImporting()} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Export {getEntityLabelPlural()}</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleExportFormatSelect('csv')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">CSV</h3><p className="text-sm text-slate-500">Export as CSV</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('xlsx')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">XLSX</h3><p className="text-sm text-slate-500">Export as Excel</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('pdf')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">PDF</h3><p className="text-sm text-slate-500">Export as PDF</p></div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your {getEntityLabelPlural().toLowerCase()} data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hasPermission(`${entityForPerm}.import`) && (
                  <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-sky-600">Import</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                  </button>
                )}
                {hasPermission(`${entityForPerm}.export`) && (
                  <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-indigo-600">Export</h3>
                    <p className="text-sm text-slate-500 mt-1">Download {getEntityLabelPlural().toLowerCase()} data</p>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClassificationPage;
