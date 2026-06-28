import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { useTemplateStore } from '../../stores/templateStore';
import { useQuestionStore } from '../../stores/questionStore';
import { useQuestionSubCategoryStore } from '../../stores/questionSubCategoryStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/toast';
import type { EvaluationTemplate, TemplateCreateInput, TemplateFilters } from '../../types/evaluation';
import type { Question, QuestionType, QuestionOption } from '../../types/question';

const SCHEDULE_OPTIONS = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'custom', label: 'Custom' },
];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Rating' },
];

// ─── Template Card ──────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: EvaluationTemplate;
  onSelect: (template: EvaluationTemplate) => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, onToggle, onDelete }) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const questionCount = template.questions?.length ?? 0;

  return (
    <div
      onClick={() => onSelect(template)}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient top accent */}
      <div className="h-2 bg-gradient-to-r from-teal-500 to-cyan-500" />

      {/* Status badge - clickable for toggle if permitted, otherwise plain badge */}
      <div className="absolute top-4 right-4 z-10">
        {hasPermission('templates.toggle') ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(template.id); }}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
              template.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {template.is_active ? 'Active' : 'Inactive'}
          </button>
        ) : (
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              template.is_active
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {template.is_active ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Gradient icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>

        {/* Template name */}
        <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
          {template.name}
        </h3>

        {/* Description snippet */}
        {template.description && (
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}

        {/* Metadata footer */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="capitalize">{template.schedule_type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Action buttons - visible on hover */}
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex-1" />
          {hasPermission('templates.delete') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}
            >
              Delete
            </Button>
          )}
        </div>
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
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const questions = template.questions ?? [];

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in overflow-hidden">
      {/* Gradient accent line at top */}
      <div className="h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 -mx-6 -mt-6 mb-6" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-800">{template.name}</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {template.description && (
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{template.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasPermission('templates.toggle') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(template.id)}
            >
              {template.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          {hasPermission('templates.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(template.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats row — 4 icon + metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {/* Schedule */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Schedule</p>
              <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">{template.schedule_type.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Questions</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{questions.length}</p>
            </div>
          </div>
        </div>

        {/* Total Score */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Score</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{template.total_score}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 ${
                template.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions section */}
      {questions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Questions ({questions.length})
            </h3>
          </div>
          <div className="space-y-3">
            {questions.sort((a, b) => a.order - b.order).map((tq) => (
              <div
                key={tq.id}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Drag handle visual */}
                <div className="flex flex-col gap-0.5 text-slate-300 cursor-grab shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                </div>

                {/* Order number in gradient circle */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                  {tq.order}
                </div>

                {/* Question text + type */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{tq.question.question_text}</p>
                  <p className="text-xs text-slate-500 capitalize mt-0.5">{tq.question.question_type.replace('_', ' ')}</p>
                </div>

                {/* Weight badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg shrink-0">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-700">W:{tq.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty questions state */}
      {questions.length === 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-center py-8 px-4">
            <div className="w-14 h-14 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">No questions yet</p>
            <p className="text-xs text-slate-400 mt-1">Questions will appear here once added to this template.</p>
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
  categories: Array<{ id: number; name: string }>;
}

const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  editingTemplate,
  questions,
  categories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'one_time' | 'monthly' | 'quarterly' | 'custom'>('one_time');
  const [selectedQuestions, setSelectedQuestions] = useState<Array<{ question_id: number; weight: number; is_medication_check?: boolean }>>([]);
  const [availableQuestionId, setAvailableQuestionId] = useState('');

  // ─── Tab state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'pick' | 'import' | 'create'>('pick');

  // ─── New questions state (Create New tab) ───────────────────────────────
  const [newQuestions, setNewQuestions] = useState<Array<{
    tempId: string;
    question_text: string;
    question_type: QuestionType;
    options: QuestionOption[] | null;
    description: string | null;
    weight: number;
    is_medication_check?: boolean;
  }>>([]);

  // ─── Import from Category state ─────────────────────────────────────────
  const [importCategoryId, setImportCategoryId] = useState<number | null>(null);
  const [importSubCategoryId, setImportSubCategoryId] = useState<number | null>(null);

  // ─── Reset form when modal opens ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (editingTemplate) {
      setName(editingTemplate.name);
      setDescription(editingTemplate.description ?? '');
      setScheduleType(editingTemplate.schedule_type);
      setSelectedQuestions(
        editingTemplate.questions?.map((q) => ({
          question_id: q.question_id,
          weight: q.weight,
          is_medication_check: q.is_medication_check ?? false,
        })) ?? []
      );
    } else {
      setName('');
      setDescription('');
      setScheduleType('one_time');
      setSelectedQuestions([]);
      setNewQuestions([]);
      setAvailableQuestionId('');
      setActiveTab('pick');
      setImportCategoryId(null);
      setImportSubCategoryId(null);
      setCreateQuestionText('');
      setCreateQuestionType('text');
      setCreateCategoryId(null);
      setCreateDescription('');
      setCreateWeight(1);
      setCreateOptions([]);
    }
  }, [editingTemplate, isOpen]);
  const subCategories = useQuestionSubCategoryStore((s) => s.subCategories);
  const fetchSubCategories = useQuestionSubCategoryStore((s) => s.fetchSubCategories);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (importCategoryId) {
      fetchSubCategories({ filters: { question_category_id: importCategoryId } });
    }
  }, [importCategoryId, fetchSubCategories]);

  const filteredSubCategories = importCategoryId
    ? subCategories.filter((sc) => sc.question_category_id === importCategoryId)
    : [];

  // ─── Create New question form state ─────────────────────────────────────
  const [createQuestionText, setCreateQuestionText] = useState('');
  const [createQuestionType, setCreateQuestionType] = useState<QuestionType>('text');
  const [createCategoryId, setCreateCategoryId] = useState<number | null>(null);
  const [createDescription, setCreateDescription] = useState('');
  const [createWeight, setCreateWeight] = useState(1);
  const [createOptions, setCreateOptions] = useState<QuestionOption[]>([]);

  // ─── Pick Existing handlers ─────────────────────────────────────────────
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

  // ─── Import from Category handlers ──────────────────────────────────────
  const questionsInSelectedCategory = useMemo(() => {
    if (importSubCategoryId) {
      return questions.filter(
        (q) => q.sub_category_id === importSubCategoryId &&
          !selectedQuestions.some((sq) => sq.question_id === q.id)
      );
    }
    if (importCategoryId) {
      return questions.filter(
        (q) => q.category_id === importCategoryId &&
          !selectedQuestions.some((sq) => sq.question_id === q.id)
      );
    }
    return [];
  }, [questions, selectedQuestions, importCategoryId, importSubCategoryId]);

  const handleImportAllQuestions = () => {
    const toAdd = questionsInSelectedCategory.map((q) => ({
      question_id: q.id,
      weight: 1,
    }));
    setSelectedQuestions([...selectedQuestions, ...toAdd]);
  };

  // ─── Create New handlers ────────────────────────────────────────────────
  const handleAddNewQuestion = () => {
    if (!createQuestionText.trim()) return;

    const tempId = `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setNewQuestions([
      ...newQuestions,
      {
        tempId,
        question_text: createQuestionText.trim(),
        question_type: createQuestionType,
        options: createOptions.length > 0 ? createOptions : null,
        description: createDescription.trim() || null,
        weight: createWeight,
      },
    ]);

    // Reset form
    setCreateQuestionText('');
    setCreateQuestionType('text');
    setCreateCategoryId(null);
    setCreateDescription('');
    setCreateWeight(1);
    setCreateOptions([]);
  };

  const handleRemoveNewQuestion = (tempId: string) => {
    setNewQuestions(newQuestions.filter((nq) => nq.tempId !== tempId));
  };

  const handleNewQuestionWeightChange = (tempId: string, weight: number) => {
    setNewQuestions(
      newQuestions.map((nq) => (nq.tempId === tempId ? { ...nq, weight } : nq))
    );
  };

  const handleAddOption = () => {
    setCreateOptions([...createOptions, { label: '', value: '' }]);
  };

  const handleRemoveOption = (idx: number) => {
    setCreateOptions(createOptions.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, label: string) => {
    const newOptions = [...createOptions];
    newOptions[idx] = {
      label,
      value: label.toLowerCase().replace(/\s+/g, '_'),
    };
    setCreateOptions(newOptions);
  };

  const showOptionsEditor = createQuestionType === 'select' || createQuestionType === 'radio' || createQuestionType === 'checkbox';

  // ─── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onSubmit({
      name,
      description: description || undefined,
      schedule_type: scheduleType,
      questions: selectedQuestions.map((q, i) => ({
        question_id: q.question_id,
        weight: q.weight,
        order: i + 1,
        is_medication_check: q.is_medication_check ?? false,
      })),
      new_questions: newQuestions.map((nq) => ({
        question_text: nq.question_text,
        question_type: nq.question_type,
        options: nq.options,
        description: nq.description,
        weight: nq.weight,
        is_medication_check: nq.is_medication_check ?? false,
      })),
    });
  };

  const availableQuestions = questions.filter(
    (q) => !selectedQuestions.some((sq) => sq.question_id === q.id)
  );

  const allItems = useMemo(() => {
    const items: Array<{
      key: string;
      type: 'existing' | 'new';
      question_id?: number;
      tempId?: string;
      question_text: string;
      question_type: string;
      weight: number;
    }> = [];

    selectedQuestions.forEach((sq) => {
      const q = questions.find((qq) => qq.id === sq.question_id);
      items.push({
        key: `existing_${sq.question_id}`,
        type: 'existing',
        question_id: sq.question_id,
        question_text: q?.question_text || `Question #${sq.question_id}`,
        question_type: q?.question_type || 'unknown',
        weight: sq.weight,
      });
    });

    newQuestions.forEach((nq) => {
      items.push({
        key: `new_${nq.tempId}`,
        type: 'new',
        tempId: nq.tempId,
        question_text: nq.question_text,
        question_type: nq.question_type,
        weight: nq.weight,
      });
    });

    return items;
  }, [selectedQuestions, newQuestions, questions]);

  const totalWeight = allItems.reduce((sum, item) => sum + item.weight, 0);

  const gradientSegments = [
    'from-teal-400 to-teal-500',
    'from-cyan-400 to-cyan-500',
    'from-teal-500 to-cyan-500',
    'from-emerald-400 to-teal-500',
    'from-cyan-500 to-blue-500',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        onClose={onClose}
      />
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <Card variant="outlined" padding="none" className="overflow-hidden">
            <CardHeader
              title="Basic Information"
              subtitle="Set up the template details and schedule type."
            />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Q1 2024 Evaluation"
                    required
                  />
                </div>
                <div>
                  <SearchableCombobox
                    label="Schedule Type"
                    value={scheduleType}
                    onChange={(val) => setScheduleType(val as typeof scheduleType)}
                    options={SCHEDULE_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))}
                    clearable={false}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all resize-y"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Questions */}
          <Card variant="outlined" padding="none" className="overflow-hidden">
            <CardHeader
              title="Questions"
              subtitle="Select and configure questions for this template."
            />
            <CardContent className="space-y-4">
              {/* ─── Tab Navigation ──────────────────────────────────── */}
              <div className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('pick')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'pick'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Pick Existing
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'import'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import from Category
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === 'create'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New
                </button>
              </div>

              {/* ─── Tab: Pick Existing ──────────────────────────────── */}
              {activeTab === 'pick' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <SearchableCombobox
                      value={availableQuestionId || null}
                      onChange={(val) => setAvailableQuestionId(val ? String(val) : '')}
                      options={availableQuestions.map(q => ({ value: String(q.id), label: q.question_text }))}
                      placeholder="Select a question to add..."
                      noSelectionLabel="Select a question to add..."
                      clearable
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddQuestion}
                      disabled={!availableQuestionId}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}

              {/* ─── Tab: Import from Category ──────────────────────── */}
              {activeTab === 'import' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SearchableCombobox
                      label="Category"
                      value={importCategoryId}
                      onChange={(val) => {
                        setImportCategoryId(val as number | null);
                        setImportSubCategoryId(null);
                      }}
                      options={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      placeholder="Select a category..."
                      noSelectionLabel="Select a category..."
                      clearable
                    />
                    <SearchableCombobox
                      label="Sub Category"
                      value={importSubCategoryId}
                      onChange={(val) => setImportSubCategoryId(val as number | null)}
                      options={filteredSubCategories.map((sc) => ({
                        value: sc.id,
                        label: sc.name,
                      }))}
                      placeholder={importCategoryId ? 'Select a sub-category...' : 'Select category first...'}
                      noSelectionLabel="All sub-categories"
                      clearable
                      disabled={!importCategoryId}
                    />
                  </div>

                  {/* Question count + Add All button */}
                  {importCategoryId && (
                    <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-teal-800">
                            {questionsInSelectedCategory.length} question{questionsInSelectedCategory.length !== 1 ? 's' : ''} available
                          </p>
                          <p className="text-xs text-teal-600">
                            {importSubCategoryId
                              ? `From selected sub-category`
                              : `From ${categories.find((c) => c.id === importCategoryId)?.name || 'selected category'}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="gradient"
                        gradient="from-teal-500 to-cyan-500"
                        size="sm"
                        onClick={handleImportAllQuestions}
                        disabled={questionsInSelectedCategory.length === 0}
                      >
                        Add All {questionsInSelectedCategory.length} Question{questionsInSelectedCategory.length !== 1 ? 's' : ''}
                      </Button>
                    </div>
                  )}

                  {!importCategoryId && (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">Select a category to import questions</p>
                      <p className="text-xs text-slate-400 mt-0.5">You can optionally filter by sub-category.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tab: Create New ─────────────────────────────────── */}
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Question Text <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={createQuestionText}
                      onChange={(e) => setCreateQuestionText(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all resize-y"
                      rows={3}
                      placeholder="Enter the question text..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SearchableCombobox
                      label="Question Type"
                      value={createQuestionType}
                      onChange={(val) => {
                        setCreateQuestionType(val as QuestionType);
                        if (!['select', 'radio', 'checkbox'].includes(val as string)) {
                          setCreateOptions([]);
                        }
                      }}
                      options={TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                      clearable={false}
                    />
                    <SearchableCombobox
                      label="Category (optional)"
                      value={createCategoryId}
                      onChange={(val) => setCreateCategoryId(val as number | null)}
                      options={categories.map((cat) => ({
                        value: cat.id,
                        label: cat.name,
                      }))}
                      placeholder="Select a category..."
                      noSelectionLabel="No category"
                      clearable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
                    <textarea
                      value={createDescription}
                      onChange={(e) => setCreateDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition-all resize-y"
                      rows={2}
                      placeholder="Optional description..."
                    />
                  </div>

                  {/* Options editor (conditional) */}
                  {showOptionsEditor && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700">Options</label>
                      </div>
                      {createOptions.length === 0 ? (
                        <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">
                          <svg className="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="mt-2 text-sm text-slate-500">No options defined yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {createOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2 group">
                              <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                {idx + 1}
                              </div>
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                placeholder={`Option ${idx + 1} label`}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(idx)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remove option"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 text-sm font-medium text-slate-500 hover:text-teal-600 transition-all duration-200 w-full"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Option
                      </button>
                    </div>
                  )}

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Weight</label>
                    <input
                      type="number"
                      min={1}
                      value={createWeight}
                      onChange={(e) => setCreateWeight(parseInt(e.target.value) || 1)}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="gradient"
                    gradient="from-teal-500 to-cyan-500"
                    onClick={handleAddNewQuestion}
                    disabled={!createQuestionText.trim()}
                    className="w-full"
                  >
                    Add to Template
                  </Button>
                </div>
              )}

              {/* ─── Combined Weight Preview ─────────────────────────── */}
              {allItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Weight Distribution</span>
                    <span className="text-xs font-medium text-slate-500">Total: {totalWeight}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    {allItems.map((item, i) => {
                      const pct = totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0;
                      return (
                        <div
                          key={item.key}
                          className={`h-full bg-gradient-to-r ${gradientSegments[i % gradientSegments.length]} transition-all duration-300`}
                          style={{ width: `${pct}%` }}
                          title={`${item.question_text}: ${pct.toFixed(0)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── Combined Questions List ─────────────────────────── */}
              {allItems.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allItems.map((item, index) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-shadow"
                    >
                      {/* Order number in gradient circle */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {index + 1}
                      </div>

                      {/* Question text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {item.question_text}
                          </p>
                          {item.type === 'new' && (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">
                          {item.question_type.replace(/_/g, ' ')}
                        </p>
                      </div>

                      {/* Weight control */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 font-medium">Weight:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.weight}
                          onChange={(e) => {
                            if (item.type === 'existing' && item.question_id) {
                              handleWeightChange(item.question_id, parseInt(e.target.value) || 1);
                            } else if (item.type === 'new' && item.tempId) {
                              handleNewQuestionWeightChange(item.tempId, parseInt(e.target.value) || 1);
                            }
                          }}
                          className="w-16 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                        />
                      </div>

                      {/* Medication check toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer group shrink-0">
                        <input
                          type="checkbox"
                          checked={
                            item.type === 'existing'
                              ? selectedQuestions.find((q) => q.question_id === item.question_id)?.is_medication_check ?? false
                              : newQuestions.find((nq) => nq.tempId === item.tempId)?.is_medication_check ?? false
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (item.type === 'existing' && item.question_id) {
                              setSelectedQuestions((prev) =>
                                prev.map((q) =>
                                  q.question_id === item.question_id ? { ...q, is_medication_check: checked } : q
                                )
                              );
                            } else if (item.type === 'new' && item.tempId) {
                              setNewQuestions((prev) =>
                                prev.map((nq) =>
                                  nq.tempId === item.tempId ? { ...nq, is_medication_check: checked } : nq
                                )
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-[11px] text-slate-400 group-hover:text-teal-600 transition-colors whitespace-nowrap">
                          Med Check
                        </span>
                      </label>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (item.type === 'existing' && item.question_id) {
                            handleRemoveQuestion(item.question_id);
                          } else if (item.type === 'new' && item.tempId) {
                            handleRemoveNewQuestion(item.tempId);
                          }
                        }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty questions state in modal */}
              {allItems.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">No questions selected</p>
                  <p className="text-xs text-slate-400 mt-0.5">Pick existing questions, import from a category, or create new ones.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full-width gradient submit button */}
          <Button
            type="submit"
            variant="gradient"
            gradient="from-teal-500 to-cyan-500"
            isLoading={isLoading}
            disabled={!name}
            className="w-full py-3 text-base"
          >
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Dropdown Item ──────────────────────────────────────────────────────────────
interface TplDropdownItemProps {
  template: EvaluationTemplate;
  isHighlighted: boolean;
  onClick: (template: EvaluationTemplate) => void;
}

const TplDropdownItem: React.FC<TplDropdownItemProps> = ({
  template,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      role="option"
      onClick={() => onClick(template)}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isHighlighted ? 'bg-teal-50' : 'hover:bg-teal-50'}
      `}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
        {template.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">
            {template.name}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            template.is_active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {template.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
            {template.schedule_type.replace('_', ' ')}
          </span>
          {template.description && (
            <span className="text-xs text-gray-500 line-clamp-1">{template.description}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export const TemplateBuilderPage: React.FC = () => {
  const templates = useTemplateStore((s) => s.templates);
  const isLoading = useTemplateStore((s) => s.isLoading);
  const error = useTemplateStore((s) => s.error);
  const pagination = useTemplateStore((s) => s.pagination);
  const fetchTemplates = useTemplateStore((s) => s.fetchTemplates);
  const createTemplate = useTemplateStore((s) => s.createTemplate);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);
  const toggleTemplateStatus = useTemplateStore((s) => s.toggleTemplateStatus);
  const clearError = useTemplateStore((s) => s.clearError);

  const questions = useQuestionStore((s) => s.questions);
  const fetchQuestions = useQuestionStore((s) => s.fetchQuestions);
  const categories = useQuestionStore((s) => s.categories);
  const fetchCategories = useQuestionStore((s) => s.fetchCategories);
  const { addToast } = useToast();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    fetchCategories();
  }, [fetchQuestions, fetchCategories]);

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

  const handleDropdownSelect = (template: EvaluationTemplate) => {
    setSelectedTemplate(template);
    setSearchQuery(template.name);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, templates.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleDropdownSelect(templates[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

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
        {hasPermission('templates.create') && (
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
        )}
      </div>

      {/* Stats section - compact side-by-side cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider">Active Templates</p>
              <p className="text-3xl font-bold mt-1.5">{activeCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group p-5 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-xs font-medium uppercase tracking-wider">Inactive Templates</p>
              <p className="text-3xl font-bold mt-1.5">{inactiveCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-100 transition-colors">
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
            <div ref={dropdownRef} className="relative">
              <Input
                ref={inputRef}
                placeholder="Search templates..."
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
              />

              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No templates match your search' : 'No templates found'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {templates.map((tpl, index) => (
                        <TplDropdownItem
                          key={tpl.id}
                          template={tpl}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleDropdownSelect}
                        />
                      ))}
                    </div>
                  )}

                  {!isLoading && templates.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{templates.length} result{templates.length !== 1 ? 's' : ''}</span>
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

          <SearchableCombobox
            label="Status"
            value={statusFilter === '' ? 'all' : statusFilter ? 'active' : 'inactive'}
            onChange={(val) => {
              setStatusFilter(val === 'all' ? '' : val === 'active');
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            clearable={false}
            className="w-44"
          />

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

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden animate-pulse">
              <div className="h-2 bg-gradient-to-r from-teal-500/30 to-cyan-500/30" />
              <div className="p-5">
                <div className="w-12 h-12 rounded-xl bg-slate-200 mb-4" />
                <div className="h-5 w-3/4 bg-slate-200 rounded-md mb-2" />
                <div className="h-4 w-full bg-slate-100 rounded-md mb-1.5" />
                <div className="h-4 w-2/3 bg-slate-100 rounded-md mb-4" />
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="h-4 w-20 bg-slate-200 rounded-md" />
                    <div className="h-4 w-16 bg-slate-200 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && templates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelect}
              onToggle={handleToggle}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedTemplate && (
        <DetailPanel
          template={selectedTemplate}
          onToggle={handleToggle}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Empty State */}
      {!isLoading && templates.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/[0.04] via-cyan-500/[0.04] to-slate-50 border border-slate-200/60">
          {/* Decorative background orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-500/10 to-teal-500/10 blur-3xl" />

          <div className="relative text-center py-16 px-6">
            {/* Illustration icon */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center shadow-inner">
              <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>

            <h3 className="mt-5 text-xl font-bold text-slate-800">No templates yet</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Create your first evaluation template to define questions, set scoring weights, and schedule evaluations for your team.
            </p>
            {hasPermission('templates.create') && (
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
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-100 rounded-xl px-5 py-4">
          <p className="text-sm text-slate-500">
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
        categories={categories}
      />

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingId(null); }}>
        <ModalHeader title="Delete Template" onClose={() => { setShowDeleteModal(false); setDeletingId(null); }} />
        <ModalContent>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Delete Template</p>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
            </div>
          </div>
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
