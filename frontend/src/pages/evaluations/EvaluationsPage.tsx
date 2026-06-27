import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { useAuthStore } from '../../stores/authStore';
import { useEvaluationStore } from '../../stores/evaluationStore';
import { useTemplateStore } from '../../stores/templateStore';
import { useCenterStore } from '../../stores/centerStore';
import { useStaffStore } from '../../stores/staffStore';
import { useToast } from '../../components/ui/toast';
import type { Evaluation, EvaluationFilters, EvaluationCreateInput } from '../../types/evaluation';
import type { CenterFilters } from '../../types/center';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-600';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'archived':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const getStatusLabel = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// ─── Evaluation Row ─────────────────────────────────────────────────────────
interface EvaluationRowProps {
  evaluation: Evaluation;
  onSelect: (evaluation: Evaluation) => void;
  onSubmit: (id: number) => void;
  onDelete: (id: number) => void;
}

const EvaluationRow: React.FC<EvaluationRowProps> = ({ evaluation, onSelect, onSubmit, onDelete }) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const percentage = evaluation.percentage ?? 0;
  const scoreColor = percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div
      className="flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(evaluation)}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-slate-800">
            {evaluation.center?.name || `Evaluation #${evaluation.id}`}
          </p>
          <p className="text-sm text-slate-500">
            {evaluation.template?.name || 'No template'}
            {evaluation.staff && ` • ${evaluation.staff.first_name} ${evaluation.staff.last_name}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {evaluation.percentage !== null && (
          <div className="text-right">
            <p className={`text-lg font-bold ${scoreColor}`}>{percentage}%</p>
            <p className="text-xs text-slate-400">Score</p>
          </div>
        )}
        <span className={`px-3 py-1 ${getStatusBadge(evaluation.status)} text-xs font-medium rounded-full`}>
          {getStatusLabel(evaluation.status)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {evaluation.status === 'draft' && hasPermission('evaluations.submit') && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSubmit(evaluation.id); }}
              className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Submit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
          {hasPermission('evaluations.delete') && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(evaluation.id); }}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Detail Panel ───────────────────────────────────────────────────────────
interface DetailPanelProps {
  evaluation: Evaluation;
  onSubmit: (id: number) => void;
  onDelete: (id: number) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ evaluation, onSubmit, onDelete }) => {
  const navigate = useNavigate();
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const percentage = evaluation.percentage ?? 0;
  const scoreColor = percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {evaluation.center?.name || `Evaluation #${evaluation.id}`}
              </h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(evaluation.status)}`}>
                {getStatusLabel(evaluation.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{evaluation.template?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(evaluation.status === 'draft' || evaluation.status === 'in_progress') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/evaluations/${evaluation.id}/take`)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              {evaluation.status === 'draft' ? 'Start' : 'Continue'}
            </Button>
          )}
          {evaluation.status === 'draft' && hasPermission('evaluations.submit') && (
            <Button
              variant="gradient"
              gradient="from-emerald-500 to-teal-500"
              size="sm"
              onClick={() => onSubmit(evaluation.id)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Submit
            </Button>
          )}
          {hasPermission('evaluations.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(evaluation.id)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Center</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">{evaluation.center?.name || '—'}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Staff</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {evaluation.staff ? `${evaluation.staff.first_name} ${evaluation.staff.last_name}` : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Score</span>
          </div>
          <p className={`text-lg font-bold mt-1 ${scoreColor}`}>
            {evaluation.percentage !== null ? `${percentage}%` : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Created</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {evaluation.created_at ? new Date(evaluation.created_at).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {evaluation.notes && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Notes</h3>
          <p className="text-sm text-gray-700">{evaluation.notes}</p>
        </div>
      )}

      {evaluation.answers && evaluation.answers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Answers ({evaluation.answers.length})</h3>
          <div className="space-y-2">
            {evaluation.answers.map((answer) => {
              const qType = answer.question?.question_type;
              const storedValue = qType === 'radio'
                ? (answer.answer_yes_no ?? answer.answer_multiple_choice ?? '')
                : qType === 'select'
                  ? (answer.answer_multiple_choice ?? '')
                  : qType === 'rating'
                    ? (answer.answer_rating != null ? `${answer.answer_rating} / 5` : '')
                    : (answer.answer_text ?? '');
              const options = (answer.question?.options ?? []) as Array<{ label?: string; value?: string }>;
              const opt = options.find((o) => o.value === storedValue);
              const answerText = opt?.label ?? storedValue;

              return (
                <div key={answer.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {answer.question?.question_text || `Question #${answer.question_id}`}
                      </p>
                      {answerText && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Answer:</span> {answerText}
                        </p>
                      )}
                      {answer.comment && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Note:</span> {answer.comment}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {answer.score ?? '—'} / {answer.max_score ?? '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Create Evaluation Modal ────────────────────────────────────────────────
interface CreateEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EvaluationCreateInput) => void;
  isLoading: boolean;
  templates: Array<{ id: number; name: string }>;
  centers: Array<{ id: number; name: string }>;
  staff: Array<{ id: number; first_name: string; last_name: string }>;
}

const CreateEvaluationModal: React.FC<CreateEvaluationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  templates,
  centers,
  staff,
}) => {
  const [templateId, setTemplateId] = useState('');
  const [centerId, setCenterId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || !centerId) return;

    onSubmit({
      template_id: parseInt(templateId),
      phc_center_id: parseInt(centerId),
      staff_id: staffId ? parseInt(staffId) : null,
      evaluator_id: useAuthStore.getState().user?.id ?? 0,
      notes: notes || undefined,
    });
  };

  const handleReset = () => {
    setTemplateId('');
    setCenterId('');
    setStaffId('');
    setNotes('');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); handleReset(); }}>
      <ModalHeader title="Create Evaluation" onClose={onClose} />
      <ModalContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <SearchableCombobox
              id="template-select"
              value={templateId}
              onChange={(val) => setTemplateId(val as string)}
              options={templates.map((t) => ({ value: String(t.id), label: t.name }))}
              label="Template *"
              placeholder="Select a template"
              required
              clearable={false}
            />
          </div>

          <div>
            <SearchableCombobox
              id="center-select"
              value={centerId}
              onChange={(val) => setCenterId(val as string)}
              options={centers.map((c) => ({ value: String(c.id), label: c.name }))}
              label="Center *"
              placeholder="Select a center"
              required
              clearable={false}
            />
          </div>

          <div>
            <SearchableCombobox
              id="staff-select"
              value={staffId || null}
              onChange={(val) => setStaffId(val === null ? '' : String(val))}
              options={staff.map((s) => ({ value: String(s.id), label: `${s.first_name} ${s.last_name}` }))}
              label="Staff (Optional)"
              placeholder="No staff assigned"
              noSelectionLabel="No staff assigned"
              clearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
              placeholder="Add any notes about this evaluation..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient="from-emerald-500 to-teal-500"
              isLoading={isLoading}
              disabled={!templateId || !centerId}
            >
              Create Evaluation
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
};

// ─── Dropdown Item ──────────────────────────────────────────────────────────────
interface EvalDropdownItemProps {
  evaluation: Evaluation;
  isHighlighted: boolean;
  onClick: (evaluation: Evaluation) => void;
}

const EvalDropdownItem: React.FC<EvalDropdownItemProps> = ({
  evaluation,
  isHighlighted,
  onClick,
}) => {
  const percentage = evaluation.percentage ?? 0;
  const statusBadge = evaluation.status === 'completed'
    ? 'bg-emerald-100 text-emerald-700'
    : evaluation.status === 'in_progress'
      ? 'bg-blue-100 text-blue-700'
      : evaluation.status === 'archived'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <div
      role="option"
      onClick={() => onClick(evaluation)}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isHighlighted ? 'bg-emerald-50' : 'hover:bg-emerald-50'}
      `}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">
            {evaluation.center?.name || `Evaluation #${evaluation.id}`}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge}`}>
            {evaluation.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {evaluation.template?.name || 'No template'}
          {evaluation.percentage !== null && ` • ${percentage}% score`}
        </p>
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export const EvaluationsPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const {
    evaluations,
    isLoading,
    error,
    pagination,
    fetchEvaluations,
    deleteEvaluation,
    submitEvaluation,
    clearError,
  } = useEvaluationStore();

  const { templates, fetchTemplates, fetchActiveTemplates } = useTemplateStore();
  const { centers, fetchCenters } = useCenterStore();
  const { staff: staffList, fetchStaff } = useStaffStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const buildFilters = useCallback((): EvaluationFilters => {
    const filters: EvaluationFilters = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter) filters.status = statusFilter as EvaluationFilters['status'];
    return filters;
  }, [searchQuery, statusFilter]);

  const loadEvaluations = useCallback(async (page: number = 1) => {
    await fetchEvaluations({ page, per_page: 100, filters: buildFilters() });
  }, [fetchEvaluations, buildFilters]);

  useEffect(() => {
    loadEvaluations(1);
  }, [loadEvaluations]);

  useEffect(() => {
    fetchActiveTemplates();
  }, [fetchActiveTemplates]);

  useEffect(() => {
    const loadCenters = async () => {
      const centerFilters: CenterFilters = {};
      await fetchCenters({ filters: centerFilters });
    };
    loadCenters();
  }, [fetchCenters]);

  useEffect(() => {
    fetchTemplates({ per_page: 100 });
  }, [fetchTemplates]);

  useEffect(() => {
    fetchStaff({ per_page: 100 });
  }, [fetchStaff]);

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

  const handleDropdownSelect = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setSearchQuery(evaluation.center?.name || `Evaluation #${evaluation.id}`);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, evaluations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleDropdownSelect(evaluations[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvaluations(1);
  };

  const handleSelect = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
  };

  const handleSubmit = async (id: number) => {
    await submitEvaluation(id);
    addToast('Evaluation submitted successfully', 'success');
    if (selectedEvaluation?.id === id) {
      setSelectedEvaluation(null);
    }
  };

  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteEvaluation(deletingId);
      addToast('Evaluation deleted successfully', 'success');
      if (selectedEvaluation?.id === deletingId) {
        setSelectedEvaluation(null);
      }
      setShowDeleteModal(false);
      setDeletingId(null);
    }
  };

  const handleCreateSubmit = async (data: EvaluationCreateInput) => {
    // We need to use the store directly
    const { createEvaluation } = useEvaluationStore.getState();
    await createEvaluation(data);
    addToast('Evaluation created successfully', 'success');
    setShowCreateModal(false);
  };

  // Stats
  const activeCount = evaluations.filter((e) => e.status === 'in_progress').length;
  const completedCount = evaluations.filter((e) => e.status === 'completed').length;
  const draftCount = evaluations.filter((e) => e.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Evaluations
          </h1>
          <p className="text-slate-500 mt-1">Create and manage evaluation cycles</p>
        </div>
        {hasPermission('evaluations.create') && (
          <Button
            variant="gradient"
            gradient="from-emerald-500 to-teal-500"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={() => setShowCreateModal(true)}
          >
            Create Evaluation
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">In Progress</p>
              <p className="text-4xl font-bold mt-2">{activeCount}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Completed</p>
              <p className="text-4xl font-bold mt-2">{completedCount}</p>
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
              <p className="text-slate-100 text-sm font-medium">Draft</p>
              <p className="text-4xl font-bold mt-2">{draftCount}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            <div ref={dropdownRef} className="relative">
              <Input
                ref={inputRef}
                placeholder="Search by center name..."
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : evaluations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No evaluations match your search' : 'No evaluations found'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {evaluations.map((evalItem, index) => (
                        <EvalDropdownItem
                          key={evalItem.id}
                          evaluation={evalItem}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleDropdownSelect}
                        />
                      ))}
                    </div>
                  )}

                  {!isLoading && evaluations.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{evaluations.length} result{evaluations.length !== 1 ? 's' : ''}</span>
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

          <div className="w-44">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Status
            </label>
            <SearchableCombobox
              value={statusFilter || null}
              onChange={(val) => setStatusFilter(val === null ? '' : String(val))}
              options={STATUS_OPTIONS.filter((o) => o.value !== '').map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Filter by status..."
              noSelectionLabel="All Statuses"
              clearable={false}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="outline">
              Search
            </Button>
            {(searchQuery || statusFilter) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setSelectedEvaluation(null);
                  loadEvaluations(1);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}

      {/* Evaluations List */}
      {!isLoading && evaluations.length > 0 && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-slate-100">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">Evaluation Cycles</h2>
              <p className="text-sm text-slate-500">Track progress of all evaluations</p>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {evaluations.map((eval_) => (
                <EvaluationRow
                  key={eval_.id}
                  evaluation={eval_}
                  onSelect={handleSelect}
                  onSubmit={handleSubmit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedEvaluation && (
        <DetailPanel
          evaluation={selectedEvaluation}
          onSubmit={handleSubmit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Empty state */}
      {!isLoading && evaluations.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No evaluations yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first evaluation. Evaluations help assess center performance and compliance.
              </p>
              <div className="mt-6">
                <Button
                  variant="gradient"
                  gradient="from-emerald-500 to-teal-500"
                  onClick={() => setShowCreateModal(true)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Create Evaluation
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
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} evaluations
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchEvaluations({ page: pagination.currentPage - 1, filters: buildFilters() })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchEvaluations({ page: pagination.currentPage + 1, filters: buildFilters() })}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateEvaluationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isLoading}
        templates={templates}
        centers={centers}
        staff={staffList}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingId(null); }}>
        <ModalHeader title="Delete Evaluation" onClose={() => { setShowDeleteModal(false); setDeletingId(null); }} />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete this evaluation? This action cannot be undone.
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

export default EvaluationsPage;
