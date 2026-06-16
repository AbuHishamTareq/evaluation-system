import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { SubCategoryCard } from '../../components/features/question-sub-categories';
import { useQuestionSubCategoryStore } from '../../stores/questionSubCategoryStore';
import { questionCategoryService, questionService } from '../../api/services';
import { useToast } from '../../components/ui/toast';
import { useAuthStore } from '../../stores/authStore';
import type { Question, QuestionCategory, QuestionSubCategory, QuestionSubCategoryCreateInput } from '../../types';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ─── Searchable Dropdown Item ───────────────────────────────────────────────
interface DropdownItemProps {
  subCategory: QuestionSubCategory;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (subCategory: QuestionSubCategory) => void;
  onEdit: (subCategory: QuestionSubCategory) => void;
  onDelete: (subCategory: QuestionSubCategory) => void;
  onToggleActive: (subCategory: QuestionSubCategory, isActive: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  subCategory,
  isSelected,
  isHighlighted,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(subCategory)}
    >
      {/* Icon Badge */}
      <div className={`
        shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm
        transition-colors duration-200
        ${isSelected
          ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20'
          : 'bg-gradient-to-br from-red-100 to-rose-100 text-red-700'
        }
      `}>
        {subCategory.code.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
            {subCategory.name}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(subCategory, !subCategory.is_active); }}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
              ${subCategory.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {subCategory.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{subCategory.code}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
          {subCategory.category && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {subCategory.category.name}
            </span>
          )}
        </div>
      </div>

      {/* Actions (visible on hover or when selected) */}
      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {hasPermission('question-sub-categories.activate') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(subCategory, !subCategory.is_active); }}
            className={`
              p-1.5 rounded-lg transition-colors
              ${subCategory.is_active
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100'
              }
            `}
            title={subCategory.is_active ? 'Deactivate' : 'Activate'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {subCategory.is_active
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              }
            </svg>
          </button>
        )}
        {hasPermission('question-sub-categories.edit') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(subCategory); }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {hasPermission('question-sub-categories.delete') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(subCategory); }}
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
  subCategory: QuestionSubCategory;
  onEdit: (subCategory: QuestionSubCategory) => void;
  onDelete: (subCategory: QuestionSubCategory) => void;
  onToggleActive: (subCategory: QuestionSubCategory, isActive: boolean) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  subCategory,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  // Questions modal state
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const handleViewQuestions = async () => {
    setShowQuestionsModal(true);
    setLoadingQuestions(true);
    try {
      const res = await questionService.getAll({ sub_category_id: subCategory.id, per_page: 100 });
      setQuestions(res.data);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/25">
            {subCategory.code.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{subCategory.name}</h2>
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full
                ${subCategory.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
                }
              `}>
                {subCategory.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Code: {subCategory.code}</p>
            {subCategory.category && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                Parent: {subCategory.category.name}
              </p>
            )}
            {subCategory.description && (
              <p className="text-sm text-gray-400 mt-1">{subCategory.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('question-sub-categories.activate') && (
            <button
              type="button"
              onClick={() => onToggleActive(subCategory, !subCategory.is_active)}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${subCategory.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {subCategory.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {hasPermission('question-sub-categories.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(subCategory)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
          {hasPermission('question-sub-categories.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(subCategory)}
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
        {/* Parent Category */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Parent Category</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {subCategory.category ? subCategory.category.name : '—'}
          </p>
          {subCategory.category && (
            <p className="text-xs text-gray-400 mt-0.5">{subCategory.category.code}</p>
          )}
        </div>

        {/* Description */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Description</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {subCategory.description || '—'}
          </p>
        </div>

        {/* Questions */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Questions</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {subCategory.questions_count ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {subCategory.questions_count === 1 ? 'question' : 'questions'} in this sub-category
          </p>
        </div>

        {/* Created */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Created</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {subCategory.created_at ? new Date(subCategory.created_at).toLocaleDateString() : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {subCategory.created_at ? new Date(subCategory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      </div>

      {/* View Questions Button (only shown when there are questions) */}
      {(subCategory.questions_count ?? 0) > 0 && (
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewQuestions}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
          >
            View Questions ({subCategory.questions_count})
          </Button>
        </div>
      )}

      {/* Questions Modal */}
      <Modal isOpen={showQuestionsModal} onClose={() => setShowQuestionsModal(false)} size="xl">
        <ModalHeader title={`Questions in "${subCategory.name}"`} onClose={() => setShowQuestionsModal(false)} />
        <ModalContent>
          {loadingQuestions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : questions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No questions found.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {questions.map((q) => (
                <div key={q.id} className="py-3 flex items-start gap-3">
                  <span className="text-xs font-mono text-gray-400 mt-0.5 min-w-[2rem]">#{q.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{q.question_text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Type: {q.question_type}
                      {q.is_required && <span className="ml-2 text-amber-500">Required</span>}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {q.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowQuestionsModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

// ─── Sub Category Form Modal ───────────────────────────────────────────────────

interface SubCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionSubCategoryCreateInput) => void;
  isLoading: boolean;
  editingSubCategory: QuestionSubCategory | null;
}

const SubCategoryFormModal: React.FC<SubCategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingSubCategory,
}) => {
  const [questionCategoryId, setQuestionCategoryId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);

  useEffect(() => {
    // Fetch active categories for the parent category selector
    const loadCategories = async () => {
      try {
        const cats = await questionCategoryService.getActive();
        setCategories(cats);
      } catch {
        // Silently fail - empty list will show
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (editingSubCategory) {
      setQuestionCategoryId(editingSubCategory.question_category_id);
      setName(editingSubCategory.name);
      setCode(editingSubCategory.code);
      setDescription(editingSubCategory.description ?? '');
      setOrder(editingSubCategory.order);
    } else {
      setQuestionCategoryId(null);
      setName('');
      setCode('');
      setDescription('');
      setOrder(0);
    }
  }, [editingSubCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !questionCategoryId) return;
    onSubmit({
      question_category_id: questionCategoryId,
      name,
      code,
      description: description || undefined,
      order,
      is_active: true,
    });
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: `${cat.name} (${cat.code})`,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={editingSubCategory ? 'Edit Sub-Category' : 'Create Sub-Category'} onClose={onClose} />
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category *</label>
            <SearchableCombobox
              value={questionCategoryId}
              onChange={(val) => setQuestionCategoryId(val as number | null)}
              options={categoryOptions}
              placeholder="Search category..."
              noSelectionLabel="Select a category"
              clearable={false}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sub-category name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., safety_training" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={2}
              placeholder="Optional description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient" gradient="from-red-500 to-rose-600" isLoading={isLoading}>
              {editingSubCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const QuestionSubCategoriesPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const {
    subCategories,
    isLoading,
    isImporting,
    error,
    pagination,
    fetchSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    toggleStatus,
    exportSubCategories,
    importSubCategories,
    downloadSample,
    clearError,
  } = useQuestionSubCategoryStore();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [parentCategories, setParentCategories] = useState<QuestionCategory[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedSubCategory, setSelectedSubCategory] = useState<QuestionSubCategory | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<QuestionSubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<QuestionSubCategory | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback(() => {
    const filters: { search?: string; question_category_id?: number } = {};
    if (searchQuery) filters.search = searchQuery;
    if (categoryFilter !== '') filters.question_category_id = categoryFilter;
    return filters;
  }, [searchQuery, categoryFilter]);

  const loadSubCategories = useCallback(async (page: number = 1) => {
    await fetchSubCategories({ page, per_page: 100, filters: buildFilters() });
  }, [fetchSubCategories, buildFilters]);

  // Load parent categories for the filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const activeCats = await questionCategoryService.getActive();
        setParentCategories(activeCats);
      } catch {
        setParentCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadSubCategories(1);
  }, [loadSubCategories]);

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

  const handleExport = async (format: ExportFormat = 'xlsx') => {
    try {
      const blob = await exportSubCategories(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `question-sub-categories-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Sub-categories exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export sub-categories', 'error');
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
      const blob = await downloadSample();
      if (!blob) {
        addToast('Failed to download sample template', 'error');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `question-sub-categories-sample-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
      const result = await importSubCategories(file);
      if (result.success) {
        addToast(result.message || 'Sub-categories imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import sub-categories', 'error');
      }
    } catch {
      addToast('Failed to import sub-categories', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadSubCategories(1);
    setDropdownOpen(true);
  };

  const handleSelect = (subCategory: QuestionSubCategory) => {
    setSelectedSubCategory(subCategory);
    setDropdownOpen(false);
    setSearchQuery(subCategory.name);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, subCategories.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(subCategories[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedSubCategory(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleOpenCreate = () => {
    setEditingSubCategory(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (subCategory: QuestionSubCategory) => {
    setEditingSubCategory(subCategory);
    setShowFormModal(true);
  };

  const handleOpenDelete = (subCategory: QuestionSubCategory) => {
    setDeletingSubCategory(subCategory);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingSubCategory(null);
    setDeletingSubCategory(null);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleSubmit = async (data: QuestionSubCategoryCreateInput) => {
    try {
      if (editingSubCategory) {
        await updateSubCategory(editingSubCategory.id, data);
        addToast('Sub-category updated successfully', 'success');
      } else {
        await createSubCategory(data);
        addToast('Sub-category created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store
    }
  };

  const handleDelete = async () => {
    if (deletingSubCategory) {
      await deleteSubCategory(deletingSubCategory.id);
      setSelectedSubCategory(null);
      handleCloseModal();
    }
  };

  const handleToggleActive = async (subCategory: QuestionSubCategory, isActive: boolean) => {
    await toggleStatus(subCategory.id);
    if (selectedSubCategory?.id === subCategory.id) {
      setSelectedSubCategory({ ...subCategory, is_active: isActive });
    }
    addToast(
      `Sub-category ${!isActive ? 'activated' : 'deactivated'} successfully`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
            Question Sub-Categories
          </h1>
          <p className="text-slate-500 mt-1">Manage question sub-categories under parent categories</p>
        </div>
        <div className="flex gap-2">
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            className="hidden"
          />
          {hasPermission('question-sub-categories.create') && (
            <Button
              variant="gradient"
              gradient="from-red-500 to-rose-600"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={handleOpenCreate}
            >
              Add Sub-Category
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-red-600">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
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
              Search Sub-Category
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search... (e.g., sub-category name)"
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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    </div>
                  ) : subCategories.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No sub-categories match your search' : 'No sub-categories found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new sub-category to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {subCategories.map((subCategory, index) => (
                        <DropdownItem
                          key={subCategory.id}
                          subCategory={subCategory}
                          isSelected={selectedSubCategory?.id === subCategory.id}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleSelect}
                          onEdit={handleOpenEdit}
                          onDelete={handleOpenDelete}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  {!isLoading && subCategories.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{subCategories.length} result{subCategories.length !== 1 ? 's' : ''}</span>
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

          {/* Parent Category Filter */}
          <div className="w-44">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <SearchableCombobox
              value={categoryFilter || null}
              onChange={(val) => setCategoryFilter(typeof val === 'number' ? val : '')}
              options={parentCategories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Filter by category..."
              noSelectionLabel="All Categories"
              clearable={false}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Search</Button>
            {(searchQuery || categoryFilter) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setSelectedSubCategory(null);
                  loadSubCategories(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Sub-Category Card Grid */}
      {!isLoading && subCategories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {subCategories.map((subCategory) => (
            <SubCategoryCard
              key={subCategory.id}
              subCategory={subCategory}
              onClick={() => handleSelect(subCategory)}
              onEdit={hasPermission('question-sub-categories.edit') ? handleOpenEdit : undefined}
              onDelete={hasPermission('question-sub-categories.delete') ? handleOpenDelete : undefined}
              onToggleActive={hasPermission('question-sub-categories.edit') ? handleToggleActive : undefined}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedSubCategory && (
        <DetailPanel
          subCategory={selectedSubCategory}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Empty state */}
      {!isLoading && subCategories.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No sub-categories yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Get started by creating your first question sub-category. Sub-categories group questions within a parent category.
              </p>
              {hasPermission('question-sub-categories.create') && (
                <div className="mt-6">
                  <Button
                    variant="gradient"
                    gradient="from-red-500 to-rose-600"
                    onClick={handleOpenCreate}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    Create Sub-Category
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} sub-categories
            <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchSubCategories({ page: pagination.currentPage - 1, per_page: 100, filters: buildFilters() })}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.currentPage ? 'primary' : 'outline'}
                size="sm"
                onClick={() => fetchSubCategories({ page, per_page: 100, filters: buildFilters() })}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchSubCategories({ page: pagination.currentPage + 1, per_page: 100, filters: buildFilters() })}
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
      <SubCategoryFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingSubCategory(null); }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        editingSubCategory={editingSubCategory}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader title="Delete Sub-Category" onClose={handleCloseModal} />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingSubCategory?.name}</strong>? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete</Button>
        </ModalFooter>
      </Modal>

      {/* Import/Export Data Modal */}
      <Modal isOpen={showDataModal} onClose={handleCloseDataModal} size="lg">
        <div className="p-6">
          {showImportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Import Sub-Categories</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file with the correct format</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV file</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Export Sub-Categories</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map((format) => (
                  <button key={format} onClick={() => handleExportFormatSelect(format)} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all duration-300 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <div className="text-left"><h3 className="text-base font-semibold text-slate-700">{format.toUpperCase()}</h3><p className="text-sm text-slate-500">Export as {format === 'xlsx' ? 'Excel' : format.toUpperCase()}</p></div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your sub-categories</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hasPermission('question-sub-categories.create') && (
                  <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-red-600">Import</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                  </button>
                )}
                {hasPermission('question-sub-categories.view') && (
                  <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-rose-600">Export</h3>
                    <p className="text-sm text-slate-500 mt-1">Download sub-categories</p>
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

export default QuestionSubCategoriesPage;
