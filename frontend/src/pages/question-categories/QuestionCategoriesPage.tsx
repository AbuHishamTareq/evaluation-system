import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { QuestionCategoryCard } from '../../components/features/question-categories';
import { useQuestionCategoryStore } from '../../stores/questionCategoryStore';
import { useToast } from '../../components/ui/toast';
import { useAuthStore } from '../../stores/authStore';
import { questionService, questionSubCategoryService } from '../../api/services';
import type { Question, QuestionCategory, QuestionCategoryCreateInput, QuestionSubCategory } from '../../types';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ─── Searchable Dropdown Item ───────────────────────────────────────────────
interface DropdownItemProps {
  category: QuestionCategory;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (category: QuestionCategory) => void;
  onEdit: (category: QuestionCategory) => void;
  onDelete: (category: QuestionCategory) => void;
  onToggleActive: (category: QuestionCategory, isActive: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  category,
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
          ? 'bg-gradient-to-r from-cyan-50 to-teal-50 border-l-4 border-cyan-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(category)}
    >
      {/* Icon Badge */}
      <div className={`
        shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm
        transition-colors duration-200
        ${isSelected
          ? 'bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-md shadow-cyan-500/20'
          : 'bg-gradient-to-br from-cyan-100 to-teal-100 text-cyan-700'
        }
      `}>
        {category.code.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-700' : 'text-gray-900'}`}>
            {category.name}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(category, !category.is_active); }}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
              ${category.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {category.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{category.code}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
          {category.description && (
            <span className="flex items-center gap-1 truncate max-w-[200px]">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              {category.description}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Order: {category.order}
          </span>
        </div>
      </div>

      {/* Actions (visible on hover or when selected) */}
      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {hasPermission('question-categories.activate') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(category, !category.is_active); }}
            className={`
              p-1.5 rounded-lg transition-colors
              ${category.is_active
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100'
              }
            `}
            title={category.is_active ? 'Deactivate' : 'Activate'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {category.is_active
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              }
            </svg>
          </button>
        )}
        {hasPermission('question-categories.edit') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(category); }}
            className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {hasPermission('question-categories.delete') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(category); }}
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
  category: QuestionCategory;
  onEdit: (category: QuestionCategory) => void;
  onDelete: (category: QuestionCategory) => void;
  onToggleActive: (category: QuestionCategory, isActive: boolean) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  // Extra fields possibly returned by API
  const extra = category as unknown as Record<string, unknown>;
  const questionsCount = extra.questions_count as number | undefined;
  const subCategoriesCount = extra.sub_categories_count as number | undefined;

  // Questions modal state
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Sub-categories modal state
  const [showSubCategoriesModal, setShowSubCategoriesModal] = useState(false);
  const [subCategories, setSubCategories] = useState<QuestionSubCategory[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const handleViewQuestions = async () => {
    setShowQuestionsModal(true);
    setLoadingQuestions(true);
    try {
      const res = await questionService.getAll({ category_id: category.id, per_page: 100 });
      setQuestions(res.data);
    } catch {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleViewSubCategories = async () => {
    setShowSubCategoriesModal(true);
    setLoadingSubCategories(true);
    try {
      const res = await questionSubCategoryService.getAll({ question_category_id: category.id, per_page: 100 });
      setSubCategories(res.data);
    } catch {
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
            {category.code.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full
                ${category.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
                }
              `}>
                {category.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Code: {category.code}</p>
            {category.description && (
              <p className="text-sm text-gray-400 mt-1">{category.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('question-categories.activate') && (
            <button
              type="button"
              onClick={() => onToggleActive(category, !category.is_active)}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${category.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {category.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {hasPermission('question-categories.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
          {hasPermission('question-categories.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(category)}
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

      {/* Action Buttons */}
      {(!!questionsCount || !!subCategoriesCount) && (
        <div className="flex items-center gap-3 mt-4">
          {!!questionsCount && (
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
              View Questions ({questionsCount})
            </Button>
          )}
          {!!subCategoriesCount && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewSubCategories}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            >
              View Sub-Categories ({subCategoriesCount})
            </Button>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100">
        {/* Description */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Description</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {category.description || '—'}
          </p>
        </div>

        {/* Order */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Order</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {category.order}
          </p>
        </div>

        {/* Questions Count */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Questions</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {questionsCount ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">associated questions</p>
        </div>

        {/* Sub-Categories Count */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Sub-Categories</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {subCategoriesCount ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">associated sub-categories</p>
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
            {category.created_at ? new Date(category.created_at).toLocaleDateString() : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {category.created_at ? new Date(category.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      </div>

      {/* Questions Modal */}
      <Modal isOpen={showQuestionsModal} onClose={() => setShowQuestionsModal(false)} size="xl">
        <ModalHeader title={`Questions in "${category.name}"`} onClose={() => setShowQuestionsModal(false)} />
        <ModalContent>
          {loadingQuestions ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
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

      {/* Sub-Categories Modal */}
      <Modal isOpen={showSubCategoriesModal} onClose={() => setShowSubCategoriesModal(false)} size="xl">
        <ModalHeader title={`Sub-Categories in "${category.name}"`} onClose={() => setShowSubCategoriesModal(false)} />
        <ModalContent>
          {loadingSubCategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600" />
            </div>
          ) : subCategories.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No sub-categories found.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {subCategories.map((sc) => (
                <div key={sc.id} className="py-3 flex items-start gap-3">
                  <span className="text-xs font-mono text-gray-400 mt-0.5 min-w-[2rem]">#{sc.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{sc.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Code: {sc.code}</p>
                    {sc.description && <p className="text-xs text-gray-400 mt-0.5">{sc.description}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {sc.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSubCategoriesModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
};

// ─── Category Form Modal ──────────────────────────────────────────────────────

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionCategoryCreateInput) => void;
  isLoading: boolean;
  editingCategory: QuestionCategory | null;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingCategory,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setCode(editingCategory.code);
      setDescription(editingCategory.description ?? '');
      setOrder(editingCategory.order);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setOrder(0);
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    onSubmit({
      name,
      code,
      description: description || undefined,
      order,
      is_active: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={editingCategory ? 'Edit Category' : 'Create Category'} onClose={onClose} />
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., safety_compliance" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient" gradient="from-cyan-500 to-teal-500" isLoading={isLoading}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const QuestionCategoriesPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const {
    categories,
    isLoading,
    isImporting,
    error,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleStatus,
    exportCategories,
    importCategories,
    downloadSample,
    clearError,
  } = useQuestionCategoryStore();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<QuestionCategory | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback((): { search?: string } => {
    const filters: { search?: string } = {};
    if (searchQuery) filters.search = searchQuery;
    return filters;
  }, [searchQuery]);

  const loadCategories = useCallback(async (page: number = 1) => {
    await fetchCategories({ page, per_page: 100, filters: buildFilters() });
  }, [fetchCategories, buildFilters]);

  useEffect(() => {
    loadCategories(1);
  }, [loadCategories]);

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
      const blob = await exportCategories(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `question-categories-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Categories exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export categories', 'error');
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
      link.download = `question-categories-sample-${timestamp}.xlsx`;
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
      const result = await importCategories(file);
      if (result.success) {
        addToast(result.message || 'Categories imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import categories', 'error');
      }
    } catch {
      addToast('Failed to import categories', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadCategories(1);
    setDropdownOpen(true);
  };

  const handleSelect = (category: QuestionCategory) => {
    setSelectedCategory(category);
    setDropdownOpen(false);
    setSearchQuery(category.name);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, categories.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(categories[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (category: QuestionCategory) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleOpenDelete = (category: QuestionCategory) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingCategory(null);
    setDeletingCategory(null);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleSubmit = async (data: QuestionCategoryCreateInput) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        addToast('Category updated successfully', 'success');
      } else {
        await createCategory(data);
        addToast('Category created successfully', 'success');
      }
      handleCloseModal();
    } catch {
      // Error handled by store
    }
  };

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteCategory(deletingCategory.id);
      setSelectedCategory(null);
      handleCloseModal();
    }
  };

  const handleToggleActive = async (category: QuestionCategory, isActive: boolean) => {
    await toggleStatus(category.id);
    if (selectedCategory?.id === category.id) {
      setSelectedCategory({ ...category, is_active: isActive });
    }
    addToast(
      `Category ${!isActive ? 'activated' : 'deactivated'} successfully`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Question Categories
          </h1>
          <p className="text-slate-500 mt-1">Manage question categories for evaluation templates</p>
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
          {hasPermission('question-categories.create') && (
            <Button
              variant="gradient"
              gradient="from-cyan-500 to-teal-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={handleOpenCreate}
            >
              Add Category
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
              Search Category
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search... (e.g., category name)"
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No categories match your search' : 'No categories found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new category to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {categories.map((category, index) => (
                        <DropdownItem
                          key={category.id}
                          category={category}
                          isSelected={selectedCategory?.id === category.id}
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
                  {!isLoading && categories.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{categories.length} result{categories.length !== 1 ? 's' : ''}</span>
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

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Search</Button>
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  loadCategories(1);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        </div>
      )}

      {/* Category Card Grid */}
      {!isLoading && categories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {categories.map((category) => (
            <QuestionCategoryCard
              key={category.id}
              category={category}
              onClick={() => handleSelect(category)}
              onEdit={hasPermission('question-categories.edit') ? handleOpenEdit : undefined}
              onDelete={hasPermission('question-categories.delete') ? handleOpenDelete : undefined}
              onToggleActive={hasPermission('question-categories.edit') ? handleToggleActive : undefined}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedCategory && (
        <DetailPanel
          category={selectedCategory}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Empty state */}
      {!isLoading && categories.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No categories yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Get started by creating your first question category. Categories group questions by topic.
              </p>
              {hasPermission('question-categories.create') && (
                <div className="mt-6">
                  <Button
                    variant="gradient"
                    gradient="from-cyan-500 to-teal-500"
                    onClick={handleOpenCreate}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    Create Category
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
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} categories
            <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchCategories({ page: pagination.currentPage - 1, per_page: 100, filters: buildFilters() })}
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
                onClick={() => fetchCategories({ page, per_page: 100, filters: buildFilters() })}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchCategories({ page: pagination.currentPage + 1, per_page: 100, filters: buildFilters() })}
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
      <CategoryFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingCategory(null); }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        editingCategory={editingCategory}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader title="Delete Category" onClose={handleCloseModal} />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingCategory?.name}</strong>? This action cannot be undone.
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
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-cyan-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Import Categories</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file with the correct format</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV file</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-cyan-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Export Categories</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map((format) => (
                  <button key={format} onClick={() => handleExportFormatSelect(format)} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your categories</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hasPermission('question-categories.create') && (
                  <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-cyan-600">Import</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                  </button>
                )}
                {hasPermission('question-categories.view') && (
                  <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-teal-600">Export</h3>
                    <p className="text-sm text-slate-500 mt-1">Download categories</p>
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

export default QuestionCategoriesPage;
