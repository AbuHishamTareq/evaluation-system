import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { useTemplateStore } from '../../stores/templateStore';
import { useQuestionStore } from '../../stores/questionStore';
import { useToast } from '../../components/ui/toast';
import type { EvaluationTemplate, TemplateCreateInput, TemplateFilters } from '../../types/evaluation';
import type { Question } from '../../types/question';

const SCHEDULE_OPTIONS = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'custom', label: 'Custom' },
];

// ─── Template Row ───────────────────────────────────────────────────────────
interface TemplateRowProps {
  template: EvaluationTemplate;
  onSelect: (template: EvaluationTemplate) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TemplateRow: React.FC<TemplateRowProps> = ({ template, onSelect, onToggle, onDelete }) => {
  const questionCount = template.questions?.length ?? 0;

  return (
    <div
      className="flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/50 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-800">{template.name}</p>
          <p className="text-sm text-slate-500">
            {questionCount} question{questionCount !== 1 ? 's' : ''} • {template.schedule_type.replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(template.id); }}
          className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
            template.is_active
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {template.is_active ? 'Active' : 'Inactive'}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Detail Panel ───────────────────────────────────────────────────────────
interface DetailPanelProps {
  template: EvaluationTemplate;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ template, onToggle, onDelete }) => {
  const questions = template.questions ?? [];

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {template.description && (
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(template.id)}
          >
            {template.is_active ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(template.id)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Schedule</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{template.schedule_type.replace('_', ' ')}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Questions</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">{questions.length}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Total Score</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">{template.total_score}</p>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Questions ({questions.length})</h3>
          <div className="space-y-2">
            {questions.sort((a, b) => a.order - b.order).map((tq) => (
              <div key={tq.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">
                    {tq.order}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tq.question.question_text}</p>
                    <p className="text-xs text-gray-500 capitalize">{tq.question.question_type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-gray-900">Weight: {tq.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Create/Edit Template Modal ─────────────────────────────────────────────
interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TemplateCreateInput) => void;
  isLoading: boolean;
  editingTemplate: EvaluationTemplate | null;
  questions: Question[];
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingTemplate,
  questions,
}) => {
  const [name, setName] = useState(() => editingTemplate?.name ?? '');
  const [description, setDescription] = useState(() => editingTemplate?.description ?? '');
  const [scheduleType, setScheduleType] = useState<'one_time' | 'monthly' | 'quarterly' | 'custom'>(
    () => editingTemplate?.schedule_type ?? 'one_time'
  );
  const [selectedQuestions, setSelectedQuestions] = useState<Array<{ question_id: number; weight: number }>>(
    () => editingTemplate?.questions?.map((q) => ({
      question_id: q.question_id,
      weight: q.weight,
    })) ?? []
  );
  const [availableQuestionId, setAvailableQuestionId] = useState('');

  const handleAddQuestion = () => {
    if (!availableQuestionId) return;
    const qId = parseInt(availableQuestionId);
    if (selectedQuestions.some((q) => q.question_id === qId)) return;

    setSelectedQuestions([...selectedQuestions, { question_id: qId, weight: 1 }]);
    setAvailableQuestionId('');
  };

  const handleRemoveQuestion = (questionId: number) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.question_id !== questionId));
  };

  const handleWeightChange = (questionId: number, weight: number) => {
    setSelectedQuestions(
      selectedQuestions.map((q) => (q.question_id === questionId ? { ...q, weight } : q))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSubmit({
      name,
      description: description || undefined,
      schedule_type: scheduleType,
      questions: selectedQuestions,
    });
  };

  const availableQuestions = questions.filter(
    (q) => !selectedQuestions.some((sq) => sq.question_id === q.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        onClose={onClose}
      />
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 2024 Evaluation"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as typeof scheduleType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                {SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={2}
              placeholder="Optional description..."
            />
          </div>

          {/* Question Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
            <div className="flex gap-2 mb-3">
              <select
                value={availableQuestionId}
                onChange={(e) => setAvailableQuestionId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select a question to add...</option>
                {availableQuestions.map((q) => (
                  <option key={q.id} value={q.id}>{q.question}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                disabled={!availableQuestionId}
              >
                Add
              </Button>
            </div>

            {selectedQuestions.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedQuestions.map((sq, index) => {
                  const question = questions.find((q) => q.id === sq.question_id);
                  return (
                    <div key={sq.question_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="w-6 h-6 rounded bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {question?.question || `Question #${sq.question_id}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Weight:</label>
                        <input
                          type="number"
                          min="1"
                          value={sq.weight}
                          onChange={(e) => handleWeightChange(sq.question_id, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(sq.question_id)}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient="from-teal-500 to-cyan-500"
              isLoading={isLoading}
              disabled={!name}
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export const TemplateBuilderPage: React.FC = () => {
  const {
    templates,
    isLoading,
    error,
    pagination,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateStatus,
    clearError,
  } = useTemplateStore();

  const { questions, fetchQuestions } = useQuestionStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EvaluationTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const buildFilters = useCallback((): TemplateFilters => {
    const filters: TemplateFilters = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== '') filters.is_active = statusFilter;
    return filters;
  }, [searchQuery, statusFilter]);

  const loadTemplates = useCallback(async (page: number = 1) => {
    await fetchTemplates({ page, per_page: 100, filters: buildFilters() });
  }, [fetchTemplates, buildFilters]);

  useEffect(() => {
    loadTemplates(1);
  }, [loadTemplates]);

  useEffect(() => {
    fetchQuestions({ per_page: 500 });
  }, [fetchQuestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTemplates(1);
  };

  const handleSelect = (template: EvaluationTemplate) => {
    setSelectedTemplate(template);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setShowFormModal(true);
  };

  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (data: TemplateCreateInput) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data);
      addToast('Template updated successfully', 'success');
    } else {
      await createTemplate(data);
      addToast('Template created successfully', 'success');
    }
    setShowFormModal(false);
    setEditingTemplate(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteTemplate(deletingId);
      addToast('Template deleted successfully', 'success');
      if (selectedTemplate?.id === deletingId) {
        setSelectedTemplate(null);
      }
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number) => {
    await toggleTemplateStatus(id);
    addToast('Template status updated', 'success');
  };

  const activeCount = templates.filter((t) => t.is_active).length;
  const inactiveCount = templates.filter((t) => !t.is_active).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Template Builder
          </h1>
          <p className="text-slate-500 mt-1">Create and manage evaluation templates</p>
        </div>
        <Button
          variant="gradient"
          gradient="from-teal-500 to-cyan-500"
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
          onClick={handleOpenCreate}
        >
          Create Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Active Templates</p>
              <p className="text-4xl font-bold mt-2">{activeCount}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm font-medium">Inactive Templates</p>
              <p className="text-4xl font-bold mt-2">{inactiveCount}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
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
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Search
            </label>
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          <div className="w-44">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Status
            </label>
            <select
              value={statusFilter === '' ? 'all' : statusFilter ? 'active' : 'inactive'}
              onChange={(e) => {
                const val = e.target.value;
                setStatusFilter(val === 'all' ? '' : val === 'active');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="outline">
              Search
            </Button>
            {(searchQuery || statusFilter !== '') && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setSelectedTemplate(null);
                  loadTemplates(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      )}

      {/* Templates List */}
      {!isLoading && templates.length > 0 && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-slate-100">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">Templates</h2>
              <p className="text-sm text-slate-500">Manage evaluation templates and their questions</p>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {templates.map((template) => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  onSelect={handleSelect}
                  onToggle={handleToggle}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedTemplate && (
        <DetailPanel
          template={selectedTemplate}
          onToggle={handleToggle}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No templates yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Create your first evaluation template to define the questions and scoring for evaluations.
              </p>
              <div className="mt-6">
                <Button
                  variant="gradient"
                  gradient="from-teal-500 to-cyan-500"
                  onClick={handleOpenCreate}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Create Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} templates
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchTemplates({ page: pagination.currentPage - 1, filters: buildFilters() })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchTemplates({ page: pagination.currentPage + 1, filters: buildFilters() })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <TemplateFormModal
        key={editingTemplate?.id ?? 'new'}
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingTemplate(null); }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        editingTemplate={editingTemplate}
        questions={questions}
      />

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingId(null); }}>
        <ModalHeader title="Delete Template" onClose={() => { setShowDeleteModal(false); setDeletingId(null); }} />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete this template? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default TemplateBuilderPage;
