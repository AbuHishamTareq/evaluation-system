import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { TemplateBuilderModal } from '../../components/features/medication-evaluations/TemplateBuilderModal';
import { useMedicationEvaluationTemplateStore } from '../../stores/medicationEvaluationTemplateStore';
import { useMedicationStore } from '../../stores/medicationStore';
import { useToast } from '../../components/ui/toast';
import { useAuthStore } from '../../stores/authStore';
import type { MedicationEvaluationTemplate } from '../../types/medicationEvaluation';

const getStatusBadge = (isActive: boolean) => {
  return isActive
    ? 'bg-red-100 text-red-700'
    : 'bg-slate-100 text-slate-600';
};

const getCriterionTypeBadge = (type: string) => {
  switch (type) {
    case 'number':
      return { bg: 'bg-blue-100 text-blue-700', label: 'Number' };
    case 'yes_no':
      return { bg: 'bg-purple-100 text-purple-700', label: 'Yes/No' };
    case 'yes_no_partial':
      return { bg: 'bg-amber-100 text-amber-700', label: 'Yes/No/Partial' };
    case 'text':
      return { bg: 'bg-slate-100 text-slate-700', label: 'Text' };
    default:
      return { bg: 'bg-slate-100 text-slate-700', label: type };
  }
};

// ─── Medication Template Card ──────────────────────────────────────────────
interface MedicationTemplateCardProps {
  template: MedicationEvaluationTemplate;
  onSelect: (template: MedicationEvaluationTemplate) => void;
  onDelete: (id: number) => void;
}

const MedicationTemplateCard: React.FC<MedicationTemplateCardProps> = ({
  template,
  onSelect,
  onDelete,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const criteriaCount = template.criteria?.length ?? 0;
  const medicationCount = template.medications?.length ?? 0;

  return (
    <div
      onClick={() => onSelect(template)}
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Gradient top accent */}
      <div className="h-2 bg-gradient-to-r from-red-500 to-amber-500" />

      {/* Status badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(template.is_active)}`}>
          {template.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="p-5">
        {/* Gradient icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-md mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>

        {/* Template name */}
        <h3 className="font-semibold text-slate-800 group-hover:text-red-600 transition-colors">
          {template.name}
        </h3>

        {/* Description */}
        {template.description && (
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}

        {/* Metadata footer */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{medicationCount} meds</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{criteriaCount} criteria</span>
          </div>
        </div>

        {/* Action buttons - visible on hover */}
        <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex-1" />
          {hasPermission('medication-eval-templates.delete') && (
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

// ─── Detail Panel ──────────────────────────────────────────────────────────
interface DetailPanelProps {
  template: MedicationEvaluationTemplate;
  onEdit: (template: MedicationEvaluationTemplate) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number) => void;
  medicationCount: number;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ template, onEdit, onDelete, onToggle, medicationCount }) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const criteria = template.criteria ?? [];
  const sortedCriteria = [...criteria].sort((a, b) => a.order - b.order);
  const medicationPivotCount = template.medications?.length ?? medicationCount;
  const totalScore = criteria.reduce((sum, c) => sum + Number(c.weight), 0);

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in overflow-hidden">
      {/* Gradient accent line at top */}
      <div className="h-1.5 bg-gradient-to-r from-red-500 to-amber-500 -mx-6 -mt-6 mb-6" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-800">{template.name}</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              template.is_active ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {template.description && (
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{template.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasPermission('medication-eval-templates.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(template.id)}
            >
              {template.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(template)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Edit
          </Button>
          {hasPermission('medication-eval-templates.delete') && (
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
        {/* Medications */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Medications</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{medicationPivotCount}</p>
            </div>
          </div>
        </div>

        {/* Criteria */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Criteria</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{criteria.length}</p>
            </div>
          </div>
        </div>

        {/* Total Score */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Score</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{totalScore}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-0.5 ${
                template.is_active ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {template.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria section */}
      {sortedCriteria.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Criteria ({sortedCriteria.length})
            </h3>
          </div>
          <div className="space-y-3">
            {sortedCriteria.map((criterion) => {
              const typeBadge = getCriterionTypeBadge(criterion.type);
              return (
                <div
                  key={criterion.id}
                  className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {/* Order number in gradient circle */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                    {criterion.order}
                  </div>

                  {/* Criterion name + type */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{criterion.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Weight badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg shrink-0">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-xs font-semibold text-amber-700">W:{Number(criterion.weight)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty criteria state */}
      {sortedCriteria.length === 0 && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-center py-8 px-4">
            <div className="w-14 h-14 mx-auto rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">No criteria yet</p>
            <p className="text-xs text-slate-400 mt-1">Criteria will appear here once added to this template.</p>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Searchable Dropdown Item ──────────────────────────────────────────────
interface DropdownItemProps {
  template: MedicationEvaluationTemplate;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (template: MedicationEvaluationTemplate) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  template,
  isSelected,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onClick(template)}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-red-50 border-l-4 border-red-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
        {template.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
            {template.name}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            template.is_active
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {template.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        {template.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{template.description}</p>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export const TemplatesPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const {
    templates,
    isLoading,
    pagination,
    fetchTemplates,
    deleteTemplate,
    toggleTemplateStatus,
  } = useMedicationEvaluationTemplateStore();

  const { medications, fetchMedications } = useMedicationStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<MedicationEvaluationTemplate | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MedicationEvaluationTemplate | null>(null);

  // Load medications for the count display
  useEffect(() => {
    fetchMedications({ per_page: 100, filters: { is_active: true } });
  }, [fetchMedications]);

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

  const loadTemplates = useCallback(async (page: number = 1) => {
    const filters: Record<string, unknown> = {};
    if (searchQuery) filters.search = searchQuery;
    await fetchTemplates({ page, per_page: 15, filters });
  }, [fetchTemplates, searchQuery]);

  useEffect(() => {
    loadTemplates(1);
  }, [loadTemplates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedTemplate(null);
    setHighlightedIndex(-1);
    loadTemplates(1);
    setDropdownOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id);
      addToast('Template deleted successfully', 'success');
      setShowDeleteConfirm(null);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    } catch {
      addToast('Failed to delete template', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const openEditModal = (template: MedicationEvaluationTemplate) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleToggle = async (id: number) => {
    await toggleTemplateStatus(id);
    // Also update local selectedTemplate state so the DetailPanel re-renders
    setSelectedTemplate((prev) =>
      prev?.id === id ? { ...prev, is_active: !prev.is_active } : prev
    );
    addToast('Template status updated', 'success');
  };

  const handleSelectTemplate = (template: MedicationEvaluationTemplate) => {
    setSelectedTemplate(template);
    setSearchQuery(template.name);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDropdownSelect = (template: MedicationEvaluationTemplate) => {
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

  const handleClearSelection = () => {
    setSelectedTemplate(null);
    setSearchQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTemplate(null);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
    loadTemplates(1);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSaved = () => {
    loadTemplates(pagination.currentPage);
  };

  // Count active medications from the catalog
  const activeMedicationCount = medications.filter((m) => m.is_active !== false).length;
  const activeTemplateCount = templates.filter((t) => t.is_active).length;
  const inactiveTemplateCount = templates.filter((t) => !t.is_active).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent">
            Medication Evaluation Templates
          </h1>
          <p className="text-slate-500 mt-1">Create and manage templates for medication evaluations</p>
        </div>
        {hasPermission('medication-eval-templates.create') && (
          <Button
            variant="gradient"
            gradient="from-red-500 to-amber-500"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={openCreateModal}
          >
            Create Template
          </Button>
        )}
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group p-5 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-medium uppercase tracking-wider">Active Templates</p>
              <p className="text-3xl font-bold mt-1.5">{activeTemplateCount}</p>
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
              <p className="text-3xl font-bold mt-1.5">{inactiveTemplateCount}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card variant="outlined" padding="md">
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          {/* Searchable Template Dropdown */}
          <div ref={dropdownRef} className="flex-1 min-w-[280px] relative">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Search Templates
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Search by name..."
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
                  ) : templates.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No templates match your search' : 'No templates found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new template to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {templates.map((t, index) => (
                        <DropdownItem
                          key={t.id}
                          template={t}
                          isSelected={selectedTemplate?.id === t.id}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleDropdownSelect}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
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

          <div className="flex gap-2">
            <Button type="submit" variant="outline">Search</Button>
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleClearFilters}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && templates.length > 0 && !selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <MedicationTemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
              onDelete={setShowDeleteConfirm}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedTemplate && (
        <DetailPanel
          template={selectedTemplate}
          onEdit={openEditModal}
          onDelete={setShowDeleteConfirm}
          onToggle={handleToggle}
          medicationCount={activeMedicationCount}
        />
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && !selectedTemplate && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No templates yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Create your first medication evaluation template to get started.
              </p>
              <div className="mt-6">
                <Button
                  variant="gradient"
                  gradient="from-red-500 to-amber-500"
                  onClick={openCreateModal}
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
      {!isLoading && pagination.totalPages > 1 && !selectedTemplate && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => {
                const filters: Record<string, unknown> = {};
                if (searchQuery) filters.search = searchQuery;
                fetchTemplates({ page: pagination.currentPage - 1, filters });
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => {
                const filters: Record<string, unknown> = {};
                if (searchQuery) filters.search = searchQuery;
                fetchTemplates({ page: pagination.currentPage + 1, filters });
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Template Builder Modal */}
      <TemplateBuilderModal
        isOpen={isModalOpen}
        editingTemplate={editingTemplate}
        onClose={handleCloseModal}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-800">Delete Template</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
