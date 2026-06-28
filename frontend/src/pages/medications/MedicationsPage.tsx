import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { Card } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Label } from '../../components/ui/forms/Label';
import { MedicationCard } from '../../components/features/medications';
import { useMedicationStore } from '../../stores/medicationStore';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../components/ui/toast';
import type { Medication, MedicationCreateInput } from '../../types/medication';

// ─── Searchable Dropdown Item ───────────────────────────────────────────────
interface DropdownItemProps {
  medication: Medication;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (medication: Medication) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
  onToggleActive: (medication: Medication, isActive: boolean) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'High Alert': 'bg-red-100 text-red-700',
  'Controlled': 'bg-amber-100 text-amber-700',
  'Antibiotic': 'bg-purple-100 text-purple-700',
  'Vaccine': 'bg-blue-100 text-blue-700',
  'IV Fluid': 'bg-cyan-100 text-cyan-700',
};

const getCategoryColor = (category: string | null): string => {
  if (!category) return 'bg-slate-100 text-slate-600';
  return CATEGORY_COLORS[category] || 'bg-slate-100 text-slate-600';
};

const DropdownItem: React.FC<DropdownItemProps> = ({
  medication,
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
          ? 'bg-gradient-to-r from-violet-50 to-blue-50 border-l-4 border-violet-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(medication)}
    >
      {/* Icon Badge */}
      <div className={`
        shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm
        transition-colors duration-200
        ${isSelected
          ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-500/20'
          : 'bg-gradient-to-br from-violet-100 to-blue-100 text-violet-700'
        }
      `}>
        {medication.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-violet-700' : 'text-gray-900'}`}>
            {medication.name}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(medication, !medication.is_active); }}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
              ${medication.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {medication.is_active ? 'Active' : 'Inactive'}
          </button>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(medication.category)}`}>
            {medication.category || '—'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {[medication.strength, medication.form, medication.unit].filter(Boolean).join(' · ') || '—'}
        </p>
      </div>

      {/* Actions (visible on hover or when selected) */}
      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {hasPermission('medications.edit') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(medication); }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {hasPermission('medications.delete') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(medication); }}
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
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
  onToggleActive: (medication: Medication, isActive: boolean) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  medication,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/25">
            {medication.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{medication.name}</h2>
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full
                ${medication.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
                }
              `}>
                {medication.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(medication.category)}`}>
                {medication.category || '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('medications.edit') && (
            <button
              type="button"
              onClick={() => onToggleActive(medication, !medication.is_active)}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${medication.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {medication.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {hasPermission('medications.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(medication)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
          {hasPermission('medications.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(medication)}
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
        {/* Strength */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Strength</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {medication.strength || '—'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Form</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {medication.form || '—'}
          </p>
        </div>

        {/* Unit */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Unit</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {medication.unit || '—'}
          </p>
        </div>

        {/* Linked PHCs */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Linked PHCs</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {medication.phc_medications_count ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">associated centers</p>
        </div>
      </div>

      {/* Created date */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Created {medication.created_at ? new Date(medication.created_at).toLocaleDateString() : '—'}
        </span>
      </div>
    </Card>
  );
};

export const MedicationsPage: React.FC = () => {
  const medications = useMedicationStore((s) => s.medications);
  const isLoading = useMedicationStore((s) => s.isLoading);
  const pagination = useMedicationStore((s) => s.pagination);
  const isImporting = useMedicationStore((s) => s.isImporting);
  const fetchMedications = useMedicationStore((s) => s.fetchMedications);
  const createMedication = useMedicationStore((s) => s.createMedication);
  const updateMedication = useMedicationStore((s) => s.updateMedication);
  const deleteMedication = useMedicationStore((s) => s.deleteMedication);
  const exportMedications = useMedicationStore((s) => s.exportMedications);
  const importMedications = useMedicationStore((s) => s.importMedications);
  const downloadTemplate = useMedicationStore((s) => s.downloadTemplate);
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<MedicationCreateInput>({
    name: '', strength: '', form: '', unit: '', category: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MedicationCreateInput, string>>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback((): Record<string, any> => {
    const filters: Record<string, any> = {};
    if (searchQuery) filters.search = searchQuery;
    if (categoryFilter) filters.category = categoryFilter;
    return filters;
  }, [searchQuery, categoryFilter]);

  const loadMedications = useCallback(async (page: number = 1) => {
    await fetchMedications({ page, per_page: 10, filters: buildFilters() });
  }, [fetchMedications, buildFilters]);

  useEffect(() => {
    loadMedications(1);
  }, [loadMedications]);

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

  // ── Derived Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: pagination.total,
    active: pagination.activeCount,
    highAlert: pagination.highAlertCount,
    categories: pagination.categoriesCount,
  }), [pagination.total, pagination.activeCount, pagination.highAlertCount, pagination.categoriesCount]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadMedications(1);
    setDropdownOpen(true);
  };

  const handleSelect = (medication: Medication) => {
    setSelectedMedication(medication);
    setDropdownOpen(false);
    setSearchQuery(medication.name);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, medications.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(medications[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedMedication(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const openCreateModal = () => {
    setEditingMedication(null);
    setFormData({ name: '', strength: '', form: '', unit: '', category: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication);
    setFormData({
      name: medication.name,
      strength: medication.strength || '',
      form: medication.form || '',
      unit: medication.unit || '',
      category: medication.category || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof MedicationCreateInput, string>> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingMedication) {
        await updateMedication(editingMedication.id, formData);
        addToast('Medication updated successfully', 'success');
      } else {
        await createMedication(formData);
        addToast('Medication created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch {
      addToast('Operation failed', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedication(id);
      addToast('Medication deleted successfully', 'success');
      setSelectedMedication(null);
      setDeleteConfirm(null);
    } catch {
      addToast('Failed to delete medication', 'error');
    }
  };

  const handleToggleActive = async (medication: Medication, isActive: boolean) => {
    try {
      await updateMedication(medication.id, { is_active: isActive });
      if (selectedMedication?.id === medication.id) {
        setSelectedMedication({ ...medication, is_active: isActive });
      }
      addToast(`Medication ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch {
      addToast('Failed to update medication status', 'error');
    }
  };

  // ── Import/Export Handlers ──────────────────────────────────────────────────
  const handleExport = async (format: string = 'xlsx') => {
    try {
      const blob = await exportMedications(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `medications-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Medications exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export medications', 'error');
    }
  };

  const handleExportFormatSelect = (format: string) => {
    handleExport(format);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSample = async () => {
    try {
      const blob = await downloadTemplate();
      if (blob) {
        const now = new Date().toISOString().replace(/:/g, '-');
        const filename = `medications-sample-${now}.xlsx`;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast(`Sample template downloaded at ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`, 'success');
      }
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
      const result = await importMedications(file);
      if (result.success) {
        addToast(result.message || 'Medications imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import medications', 'error');
      }
    } catch {
      addToast('Failed to import medications', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedication(null);
  };

  const handleOpenDelete = (medication: Medication) => {
    setDeleteConfirm(medication.id);
  };

  // ── Options ─────────────────────────────────────────────────────────────────
  const CATEGORY_OPTIONS = [
    { value: 'High Alert', label: 'High Alert' },
    { value: 'Controlled', label: 'Controlled' },
    { value: 'Regular', label: 'Regular' },
    { value: 'Antibiotic', label: 'Antibiotic' },
    { value: 'Vaccine', label: 'Vaccine' },
    { value: 'IV Fluid', label: 'IV Fluid' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
            Medications
          </h1>
          <p className="text-slate-500 mt-1">Manage pharmaceutical inventory and medication catalog</p>
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
          <Button
            variant="gradient"
            gradient="from-violet-500 to-blue-500"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={openCreateModal}
          >
            Add Medication
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Medications */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium">Total Medications</p>
              <p className="text-4xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-violet-100">
            <span>Formulary catalog items</span>
          </div>
        </div>

        {/* Active */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active</p>
              <p className="text-4xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-100">
            <span>Currently available stock</span>
          </div>
        </div>

        {/* High Alert */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">High Alert</p>
              <p className="text-4xl font-bold mt-2">{stats.highAlert}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-rose-100">
            <span>Requires special monitoring</span>
          </div>
        </div>

        {/* Categories */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Categories</p>
              <p className="text-4xl font-bold mt-2">{stats.categories}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-100">
            <span>Distinct classifications</span>
          </div>
        </div>
      </div>

      {/* ── Content Glass Card ─────────────────────────────────────────────── */}
      <div className="glass rounded-3xl p-8 border border-white/30">
        {isLoading && medications.length === 0 ? (
          /* ── Loading State ─────────────────────────────────────────── */
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : medications.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────── */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Medication Catalog</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Start building your pharmaceutical inventory by adding your first medication.
            </p>
            <Button
              variant="gradient"
              gradient="from-violet-500 to-blue-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={openCreateModal}
            >
              Create Your First Medication
            </Button>
          </div>
        ) : (
          /* ── Content Area ─────────────────────────────────────────── */
          <>
            {/* Search + Filter Card */}
            <Card variant="outlined" padding="md" className="mb-6">
              <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                {/* Searchable Dropdown */}
                <div ref={dropdownRef} className="flex-1 min-w-[280px] relative">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                    Search Medication
                  </label>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      placeholder="Type to search... (e.g., medication name)"
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
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                          </div>
                        ) : medications.length === 0 ? (
                          <div className="text-center py-8 px-4">
                            <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-500">
                              {searchQuery ? 'No medications match your search' : 'No medications found'}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              {searchQuery ? 'Try a different search term' : 'Create a new medication to get started'}
                            </p>
                          </div>
                        ) : (
                          <div role="listbox" className="py-1">
                            {medications.map((medication, index) => (
                              <DropdownItem
                                key={medication.id}
                                medication={medication}
                                isSelected={selectedMedication?.id === medication.id}
                                isHighlighted={index === highlightedIndex}
                                onClick={handleSelect}
                                onEdit={openEditModal}
                                onDelete={handleOpenDelete}
                                onToggleActive={handleToggleActive}
                              />
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        {!isLoading && medications.length > 0 && (
                          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                            <span>{medications.length} result{medications.length !== 1 ? 's' : ''}</span>
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

                {/* Category Filter */}
                <div className="w-44">
                  <SearchableCombobox
                    value={categoryFilter || null}
                    onChange={(val) => setCategoryFilter(val ? val as string : '')}
                    options={CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
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
                        setSelectedMedication(null);
                        loadMedications(1);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </form>
            </Card>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {medications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onClick={() => handleSelect(medication)}
                  onEdit={openEditModal}
                  onDelete={handleOpenDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>

            {/* Detail Panel */}
            {selectedMedication && (
              <div className="mt-6">
                <DetailPanel
                  medication={selectedMedication}
                  onEdit={openEditModal}
                  onDelete={handleOpenDelete}
                  onToggleActive={handleToggleActive}
                />
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} medications
                  <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => fetchMedications({ page: pagination.currentPage - 1, per_page: 10, filters: buildFilters() })}
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
                      onClick={() => fetchMedications({ page, per_page: 10, filters: buildFilters() })}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => fetchMedications({ page: pagination.currentPage + 1, per_page: 10, filters: buildFilters() })}
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
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
        <ModalHeader
          title={editingMedication ? 'Edit Medication' : 'Add Medication'}
          onClose={handleCloseModal}
        />
        <ModalContent>
          <div className="space-y-4">
            <div>
              <Label required>Medication Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sterile Water"
                error={formErrors.name}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Strength</Label>
                <Input
                  value={formData.strength || ''}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="e.g., 5 - 10 CC"
                />
              </div>
              <div>
                <Label>Form</Label>
                <Input
                  value={formData.form || ''}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  placeholder="e.g., Injection, Tablet"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Input
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., Ampule, Vial"
                />
              </div>
              <div>
                <Label>Category</Label>
                <SearchableCombobox
                  value={formData.category || ''}
                  onChange={(val) => setFormData({ ...formData, category: (val as string) || '' })}
                  options={CATEGORY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  placeholder="Select category..."
                  noSelectionLabel="No category"
                  clearable
                />
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient="from-violet-500 to-blue-500"
            onClick={handleSubmit}
          >
            {editingMedication ? 'Save Changes' : 'Create Medication'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Import/Export Data Modal ──────────────────────────────────────── */}
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
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-violet-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Import Medications</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV</p></div>
                </button>
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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Export Medications</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                {(['csv', 'xlsx', 'pdf'] as const).map((format) => (
                  <button key={format} onClick={() => handleExportFormatSelect(format)} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your medication data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-violet-600">Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                </button>
                <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600">Export</h3>
                  <p className="text-sm text-slate-500 mt-1">Download medication data</p>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} size="sm">
        <ModalHeader title="Delete Medication" onClose={() => setDeleteConfirm(null)} />
        <ModalContent>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-800 font-medium">Are you sure?</p>
              <p className="text-slate-500 text-sm mt-1">
                This action cannot be undone. The medication will be permanently removed from the catalog.
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete Medication
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MedicationsPage;
