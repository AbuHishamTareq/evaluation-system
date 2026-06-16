import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { useQuestionStore } from '../../stores';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/toast';
import { QuestionCard } from '../../components/features/questions';
import type { Question, QuestionCreateInput, QuestionUpdateInput, QuestionType, QuestionCategory } from '../../types';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Rating' },
];

// ─── Question Form Modal ─────────────────────────────────────────────────────
interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionCreateInput | QuestionUpdateInput) => void;
  isLoading: boolean;
  editingQuestion: Question | null;
  categories: QuestionCategory[];
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingQuestion,
  categories,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [description, setDescription] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('text');
  const [categoryId, setCategoryId] = useState('');
  const [weight, setWeight] = useState(1);
  const [maxScore, setMaxScore] = useState(10);
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [optionsText, setOptionsText] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.question_text);
      setDescription(editingQuestion.description ?? '');
      setQuestionType(editingQuestion.question_type);
      setCategoryId(String(editingQuestion.category_id));
      setWeight(editingQuestion.weight);
      setMaxScore(editingQuestion.max_score);
      setIsRequired(editingQuestion.is_required);
      setIsActive(editingQuestion.is_active);
      setOptionsText(editingQuestion.options ? JSON.stringify(editingQuestion.options, null, 2) : '');
    } else {
      setQuestionText('');
      setDescription('');
      setQuestionType('text');
      setCategoryId('');
      setWeight(1);
      setMaxScore(10);
      setIsRequired(false);
      setIsActive(true);
      setOptionsText('');
    }
  }, [editingQuestion, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !categoryId) return;

    let options = null;
    if (optionsText.trim()) {
      try {
        options = JSON.parse(optionsText);
      } catch {
        return;
      }
    }

    const data = {
      question_text: questionText,
      description: description || null,
      question_type: questionType,
      category_id: parseInt(categoryId),
      weight,
      max_score: maxScore,
      is_required: isRequired,
      is_active: isActive,
      options,
    };

    onSubmit(data);
  };

  const showOptionsEditor = questionType === 'select' || questionType === 'radio' || questionType === 'checkbox';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader title={editingQuestion ? 'Edit Question' : 'Create Question'} onClose={onClose} />
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              required
              placeholder="Enter the question text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Optional description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SearchableCombobox
                label="Type *"
                value={questionType}
                onChange={(val) => setQuestionType(val as QuestionType)}
                options={TYPE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                required
                clearable={false}
                className="w-full"
              />
            </div>

            <div>
              <SearchableCombobox
                label="Category *"
                value={categoryId || null}
                onChange={(val) => setCategoryId(val ? String(val) : '')}
                options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
                placeholder="Select a category"
                noSelectionLabel="Select a category"
                required
                clearable
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {showOptionsEditor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (JSON array of `{`"label", "value"`}`)
              </label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder={JSON.stringify([{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }], null, 2)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="gradient"
              gradient="from-blue-500 to-cyan-500"
              isLoading={isLoading}
            >
              {editingQuestion ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Category Form Modal ─────────────────────────────────────────────────────
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; code: string; description?: string; order: number; is_active?: boolean }) => void;
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
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setCode(editingCategory.code);
      setDescription(editingCategory.description ?? '');
      setOrder(editingCategory.order);
      setIsActive(editingCategory.is_active);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setOrder(0);
      setIsActive(true);
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    onSubmit({ name, code, description: description || undefined, order, is_active: isActive });
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="gradient" gradient="from-blue-500 to-cyan-500" isLoading={isLoading}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export const QuestionsPage: React.FC = () => {
  const {
    questions,
    isLoading,
    error,
    pagination,
    categories,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    exportQuestions,
    importQuestions,
    downloadSample,
    clearError,
  } = useQuestionStore();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuestionCategory | null>(null);

  useEffect(() => {
    fetchQuestions({ per_page: 100 });
    fetchCategories();
  }, [fetchQuestions, fetchCategories]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions({
      page: 1,
      per_page: 100,
      search: searchQuery || undefined,
      category_id: categoryFilter ? parseInt(categoryFilter) : undefined,
      type: typeFilter || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setTypeFilter('');
    setSelectedQuestion(null);
    fetchQuestions({ page: 1, per_page: 100 });
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (question: Question) => {
    setEditingQuestion(question);
    setShowFormModal(true);
  };

  const handleFormSubmit = async (data: QuestionCreateInput | QuestionUpdateInput) => {
    if (editingQuestion) {
      await updateQuestion(editingQuestion.id, data as QuestionUpdateInput);
      addToast('Question updated successfully', 'success');
    } else {
      await createQuestion(data as QuestionCreateInput);
      addToast('Question created successfully', 'success');
    }
    setShowFormModal(false);
    setEditingQuestion(null);
  };

  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteQuestion(deletingId);
      addToast('Question deleted successfully', 'success');
      if (selectedQuestion?.id === deletingId) {
        setSelectedQuestion(null);
      }
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await importQuestions(file);
    addToast('Questions imported successfully', 'success');
    setShowImportOptions(false);
    setShowDataModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportFormatSelect = async (format: ExportFormat) => {
    try {
      await exportQuestions(format);
      addToast('Questions exported successfully', 'success');
      setShowExportOptions(false);
      setShowDataModal(false);
    } catch {
      addToast('Failed to export questions', 'error');
    }
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
      link.download = `questions-sample-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Sample template downloaded', 'success');
    } catch {
      addToast('Failed to download sample template', 'error');
    }
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleCategorySubmit = async (data: { name: string; code: string; description?: string; order: number }) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
      addToast('Category updated successfully', 'success');
    } else {
      await createCategory(data);
      addToast('Category created successfully', 'success');
    }
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleOpenEditCategory = (category: QuestionCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category? Questions assigned to it will lose their category.')) return;
    await deleteCategory(id);
    addToast('Category deleted successfully', 'success');
  };

  // Stats
  const totalCount = pagination.total;
  const activeCount = questions.filter((q) => q.is_active).length;
  const categoryCount = categories.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Questions
          </h1>
          <p className="text-slate-500 mt-1">Manage your evaluation question bank</p>
        </div>
        <div className="flex gap-2">
          {(hasPermission('questions.view') || hasPermission('questions.create')) && (
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
          {hasPermission('questions.create') && (
            <Button
              variant="gradient"
              gradient="from-blue-500 to-cyan-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={handleOpenCreate}
            >
              Add Question
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-500 font-medium">Total Questions</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            {totalCount}
          </p>
        </div>
        <div className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-500 font-medium">Categories</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            {categoryCount}
          </p>
        </div>
        <div className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-500 font-medium">Active</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            {activeCount}
          </p>
        </div>
        <div className="group p-5 rounded-2xl bg-white border border-slate-100 shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm text-slate-500 font-medium">Inactive</p>
          <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            {totalCount - activeCount}
          </p>
        </div>
      </div>

      {/* Categories Management */}
      {hasPermission('questions.view') && categories.length > 0 && (
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
            <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Categories ({categories.length})
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <span className="text-slate-700">{cat.name}</span>
                <span className="text-xs text-slate-400 ml-1">({cat.code})</span>
                {hasPermission('questions.edit') && (
                  <button
                    onClick={() => handleOpenEditCategory(cat)}
                    className="ml-1 p-0.5 text-slate-400 hover:text-blue-600"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                {hasPermission('questions.delete') && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-0.5 text-slate-400 hover:text-red-600"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {hasPermission('questions.create') && (
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </button>
            )}
          </div>
        </details>
      )}

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
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">Search</label>
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <SearchableCombobox
            label="Category"
            value={categoryFilter || null}
            onChange={(val) => setCategoryFilter(val ? String(val) : '')}
            options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
            placeholder="All Categories"
            noSelectionLabel="All Categories"
            clearable
            className="w-48"
          />
          <SearchableCombobox
            label="Type"
            value={typeFilter || null}
            onChange={(val) => setTypeFilter(val ? String(val) : '')}
            options={TYPE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
            placeholder="All Types"
            noSelectionLabel="All Types"
            clearable
            className="w-40"
          />
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Search</Button>
            {(searchQuery || categoryFilter || typeFilter) && (
              <Button type="button" variant="ghost" onClick={handleClearFilters}>Clear</Button>
            )}
          </div>
        </form>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Question Grid */}
      {!isLoading && questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onClick={() => setSelectedQuestion(selectedQuestion?.id === q.id ? null : q)}
              onEdit={hasPermission('questions.edit') ? () => handleOpenEdit(q) : undefined}
              onDelete={hasPermission('questions.delete') ? () => handleOpenDelete(q.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Selected Detail */}
      {!isLoading && selectedQuestion && (
        <Card variant="elevated" padding="lg" className="animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedQuestion.question_text}</h2>
              {selectedQuestion.description && (
                <p className="text-sm text-gray-500 mt-1">{selectedQuestion.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedQuestion.category && (
                  <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                    {selectedQuestion.category.name}
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {TYPE_OPTIONS.find((t) => t.value === selectedQuestion.question_type)?.label || selectedQuestion.question_type}
                </span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                  Weight: {selectedQuestion.weight}
                </span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                  Max Score: {selectedQuestion.max_score}
                </span>
                {selectedQuestion.is_required && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">Required</span>
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  selectedQuestion.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {selectedQuestion.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {hasPermission('questions.edit') && (
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(selectedQuestion)}>Edit</Button>
              )}
              {hasPermission('questions.delete') && (
                <Button variant="danger" size="sm" onClick={() => handleOpenDelete(selectedQuestion.id)}>Delete</Button>
              )}
            </div>
          </div>
          {selectedQuestion.options && selectedQuestion.options.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-500 mb-2">Options</h3>
              <div className="space-y-1">
                {selectedQuestion.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">
                      {idx + 1}
                    </span>
                    {opt.label} ({opt.value})
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && questions.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No questions yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Get started by creating your first question. Questions are used in evaluation templates.
              </p>
              {hasPermission('questions.create') && (
                <Button
                  variant="gradient"
                  gradient="from-blue-500 to-cyan-500"
                  className="mt-6"
                  onClick={handleOpenCreate}
                >
                  Add First Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} questions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchQuestions({ page: pagination.currentPage - 1, per_page: 100, search: searchQuery || undefined })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchQuestions({ page: pagination.currentPage + 1, per_page: 100, search: searchQuery || undefined })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Import/Export Data Modal */}
      <Modal isOpen={showDataModal} onClose={handleCloseDataModal} size="lg">
        <div className="p-6">
          {showImportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Import Questions</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file with the correct format</p></div>
                </button>
                <label className="cursor-pointer w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV file</p></div>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
                </label>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Export Questions</h2>
                <p className="text-slate-500 mt-2">Export your question bank</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleExportFormatSelect('csv')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">CSV</h3><p className="text-sm text-slate-500">Export as CSV</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('xlsx')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">XLSX</h3><p className="text-sm text-slate-500">Export as Excel</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('pdf')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">PDF</h3><p className="text-sm text-slate-500">Export as PDF</p></div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Import / Export Questions</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your question bank</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hasPermission('questions.create') && (
                  <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600">Import</h3>
                    <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                  </button>
                )}
                {hasPermission('questions.view') && (
                  <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 group-hover:text-cyan-600">Export</h3>
                    <p className="text-sm text-slate-500 mt-1">Download question bank</p>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Create / Edit Modal */}
      <QuestionFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingQuestion(null); }}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        editingQuestion={editingQuestion}
        categories={categories}
      />

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        onSubmit={handleCategorySubmit}
        isLoading={isLoading}
        editingCategory={editingCategory}
      />

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingId(null); }}>
        <ModalHeader title="Delete Question" onClose={() => { setShowDeleteModal(false); setDeletingId(null); }} />
        <ModalContent>
          <p className="text-gray-600">Are you sure you want to delete this question? This action cannot be undone.</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default QuestionsPage;
