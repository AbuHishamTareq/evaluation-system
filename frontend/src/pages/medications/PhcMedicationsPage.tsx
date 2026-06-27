import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/buttons/Button';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { Card } from '../../components/ui/cards/Card';
import { PhcMedicationCard } from '../../components/features/medications';
import { usePhcMedicationStore } from '../../stores/phcMedicationStore';
import { useMedicationStore } from '../../stores/medicationStore';
import { useCenterStore } from '../../stores/centerStore';
import { useToast } from '../../components/ui/toast';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Input } from '../../components/ui/forms/Input';
import { Label } from '../../components/ui/forms/Label';
import type { PhcMedication, PhcMedicationCreateInput } from '../../types/medication';
import type { Center } from '../../types/center';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ─── Phc Detail Panel ───────────────────────────────────────────────────────
interface PhcDetailPanelProps {
  item: PhcMedication;
  onEdit: (item: PhcMedication) => void;
  onDelete: (id: number) => void;
  onToggleActive: (item: PhcMedication, isActive: boolean) => void;
}

const PhcDetailPanel: React.FC<PhcDetailPanelProps> = ({
  item,
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-rose-500/25">
            {item.medication?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">
                {item.medication?.name || 'Unknown Medication'}
              </h2>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                item.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {item.is_active ? 'Active' : 'Inactive'}
              </span>
              {item.medication?.category && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {item.medication.category}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {item.medication?.strength || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('medications.edit') && (
            <button
              type="button"
              onClick={() => onToggleActive(item, !item.is_active)}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${item.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {item.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {hasPermission('medications.edit') && (
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
          {hasPermission('medications.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(item.id)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Unlink
            </Button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        {/* Recommended Quantity */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Recommended Qty</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {item.recommended_quantity}
          </p>
        </div>

        {/* Current Stock */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Current Stock</span>
          </div>
          <p className={`text-sm font-semibold mt-1 ${
            item.current_stock !== null && item.current_stock < item.recommended_quantity
              ? 'text-red-600'
              : 'text-gray-900'
          }`}>
            {item.current_stock !== null ? item.current_stock : '—'}
          </p>
        </div>

        {/* Allocation Location */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Location</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {item.allocation_location || '—'}
          </p>
        </div>

        {/* Notes */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Notes</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {item.notes || '—'}
          </p>
        </div>
      </div>

      {/* Created date */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Created {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
        </span>
      </div>
    </Card>
  );
};

// ─── Dropdown Item ──────────────────────────────────────────────────────────────
interface MedDropdownItemProps {
  item: PhcMedication;
  isHighlighted: boolean;
  onClick: (item: PhcMedication) => void;
}

const MedDropdownItem: React.FC<MedDropdownItemProps> = ({
  item,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      role="option"
      onClick={() => onClick(item)}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isHighlighted ? 'bg-rose-50' : 'hover:bg-rose-50'}
      `}
    >
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
        {item.medication?.name?.charAt(0).toUpperCase() || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-900">
            {item.medication?.name || 'Unknown Medication'}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            item.is_active
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {item.is_active ? 'Active' : 'Inactive'}
          </span>
          {item.medication?.category && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {item.medication.category}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {item.medication?.strength || '—'}
        </p>
      </div>
    </div>
  );
};

export const PhcMedicationsPage: React.FC = () => {
  const { items, isLoading, isImporting, fetchByCenter, create, update, remove, importMedications, exportMedications, downloadTemplate, pagination, extraMeta, error } = usePhcMedicationStore();
  const { medications, fetchMedications } = useMedicationStore();
  const { centers, fetchCenters } = useCenterStore();
  const { addToast } = useToast();

  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [medDropdownOpen, setMedDropdownOpen] = useState(false);
  const [medHighlightedIndex, setMedHighlightedIndex] = useState(-1);
  const medDropdownRef = useRef<HTMLDivElement>(null);
  const medInputRef = useRef<HTMLInputElement>(null);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhcMedication | null>(null);
  const [formData, setFormData] = useState<PhcMedicationCreateInput>({
    phc_center_id: 0,
    medication_id: 0,
    recommended_quantity: 0,
    current_stock: null,
    allocation_location: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PhcMedicationCreateInput, string>>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<PhcMedication | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [allLinkedMedicationIds, setAllLinkedMedicationIds] = useState<number[]>([]);

  useEffect(() => {
    fetchMedications({ per_page: 10000 });
    fetchCenters({ per_page: 10000 });
  }, []);

  // ── Derived Stats (from server-side extraMeta) ─────────────────────────────
  const stats = useMemo(() => ({
    totalLinked: extraMeta.total_linked,
    totalRecommendedQty: extraMeta.total_recommended_qty,
    stockBelowRecommended: extraMeta.stock_below_recommended,
    uniqueLocations: extraMeta.unique_locations,
  }), [extraMeta]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const buildFilters = useCallback(() => {
    const hasFilters = searchQuery || locationFilter;
    if (!hasFilters) return undefined;
    return {
      search: searchQuery || undefined,
      allocation_location: locationFilter || undefined,
    };
  }, [searchQuery, locationFilter]);

  // Debounced auto-search on filter changes
  useEffect(() => {
    if (!selectedCenter) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchByCenter(selectedCenter.id, 1, buildFilters());
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, locationFilter, selectedCenter, fetchByCenter, buildFilters]);

  // Close medication dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (medDropdownRef.current && !medDropdownRef.current.contains(e.target as Node)) {
        setMedDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMedDropdownSelect = (item: PhcMedication) => {
    setSearchQuery(item.medication?.name || '');
    setMedDropdownOpen(false);
    setMedHighlightedIndex(-1);
  };

  const handleMedDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!medDropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMedHighlightedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMedHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && medHighlightedIndex >= 0) {
      e.preventDefault();
      handleMedDropdownSelect(items[medHighlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMedDropdownOpen(false);
    }
  };

  const handleCenterChange = async (center: Center | null) => {
    setSelectedCenter(center);
    setSelectedItem(null);
    setSearchQuery('');
    setLocationFilter('');
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (center) {
      fetchByCenter(center.id, 1);
      // Fetch all linked medication IDs for the combobox filter
      try {
        const response = await apiClient.get<{ data: PhcMedication[] }>(
          `/api/v1/phc-medications/by-center/${center.id}?per_page=10000`
        );
        setAllLinkedMedicationIds(response.data.map((m) => m.medication_id));
      } catch {
        setAllLinkedMedicationIds([]);
      }
    } else {
      setAllLinkedMedicationIds([]);
    }
  };

  const handleSelect = (item: PhcMedication) => {
    setSelectedItem(item);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (selectedCenter) fetchByCenter(selectedCenter.id, 1, buildFilters());
  };

  const handleToggleActive = async (item: PhcMedication, isActive: boolean) => {
    try {
      await update(item.id, { is_active: isActive });
      addToast(`PHC medication ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      setSelectedItem({ ...item, is_active: isActive });
      if (selectedCenter) fetchByCenter(selectedCenter.id, pagination.currentPage, buildFilters());
    } catch {
      addToast('Failed to update PHC medication status', 'error');
    }
  };

  const openAddModal = async () => {
    if (!selectedCenter) {
      addToast('Please select a PHC first', 'warning');
      return;
    }
    // Refresh linked medication IDs for the combobox filter
    try {
      const response = await apiClient.get<{ data: PhcMedication[] }>(
        `/api/v1/phc-medications/by-center/${selectedCenter.id}?per_page=10000`
      );
      setAllLinkedMedicationIds(response.data.map((m) => m.medication_id));
    } catch {
      setAllLinkedMedicationIds([]);
    }
    setEditingItem(null);
    setFormData({
      phc_center_id: selectedCenter.id,
      medication_id: 0,
      recommended_quantity: 0,
      current_stock: null,
      allocation_location: '',
      notes: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: PhcMedication) => {
    setEditingItem(item);
    setFormData({
      phc_center_id: item.phc_center_id,
      medication_id: item.medication_id,
      recommended_quantity: item.recommended_quantity,
      current_stock: item.current_stock,
      allocation_location: item.allocation_location || '',
      notes: item.notes || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof PhcMedicationCreateInput, string>> = {};
    if (!formData.medication_id) errors.medication_id = 'Medication is required';
    if (!formData.recommended_quantity || formData.recommended_quantity <= 0) {
      errors.recommended_quantity = 'Quantity must be greater than 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (editingItem) {
        await update(editingItem.id, formData);
        addToast('PHC medication updated successfully', 'success');
      } else {
        await create(formData);
        addToast('Medication linked successfully', 'success');
      }
      setIsModalOpen(false);
      if (selectedCenter) fetchByCenter(selectedCenter.id, pagination.currentPage, buildFilters());
    } catch {
      addToast('Operation failed', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove(id);
      addToast('Medication unlinked successfully', 'success');
      setSelectedItem(null);
      setDeleteConfirm(null);
      if (selectedCenter) fetchByCenter(selectedCenter.id, pagination.currentPage, buildFilters());
    } catch {
      addToast('Failed to unlink medication', 'error');
    }
  };

  // ── Import/Export Handlers ──────────────────────────────────────────────────
  const handleExport = async (format: ExportFormat = 'xlsx') => {
    try {
      const blob = await exportMedications(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `phc-medications-export-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('PHC medications exported successfully', 'success');
      }
    } catch {
      addToast('Failed to export PHC medications', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
        addToast(result.message || 'PHC medications imported successfully', 'success');
        if (selectedCenter) fetchByCenter(selectedCenter.id, pagination.currentPage, buildFilters());
      } else {
        addToast(result.message || 'Failed to import PHC medications', 'error');
      }
    } catch {
      addToast('Failed to import PHC medications', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadSample = async () => {
    try {
      const blob = await downloadTemplate();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `phc-medications-template-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Template downloaded successfully', 'success');
      }
    } catch {
      addToast('Failed to download template', 'error');
    }
  };

  const handleExportFormatSelect = (format: ExportFormat) => {
    handleExport(format);
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const availableMedications = medications.filter(
    (m) => !allLinkedMedicationIds.includes(m.id)
  );

  const LOCATION_OPTIONS = [
    { value: 'Crash Cart', label: 'Crash Cart' },
    { value: 'Emergency Bag', label: 'Emergency Bag' },
    { value: 'Medication Room', label: 'Medication Room' },
    { value: 'Refrigerator', label: 'Refrigerator' },
    { value: 'Controlled Substance Cabinet', label: 'Controlled Substance Cabinet' },
    { value: 'Anesthesia Tray', label: 'Anesthesia Tray' },
    { value: 'ICU Cart', label: 'ICU Cart' },
    { value: 'Ward Stock', label: 'Ward Stock' },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
            PHC Medications
          </h1>
          <p className="text-slate-500 mt-1">Manage medication allocations across primary health centers</p>
        </div>
        <div className="flex items-center gap-2">
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
            gradient="from-rose-500 to-red-500"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={openAddModal}
          >
            Link Medication
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Linked Medications */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Linked Medications</p>
              <p className="text-4xl font-bold mt-2">{stats.totalLinked}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-rose-100">
            <span>Allocated to this PHC</span>
          </div>
        </div>

        {/* Total Recommended Quantity */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Recommended Qty</p>
              <p className="text-4xl font-bold mt-2">{stats.totalRecommendedQty}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-pink-100">
            <span>Total supply needed</span>
          </div>
        </div>

        {/* Stock Below Recommended */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Low Stock Items</p>
              <p className="text-4xl font-bold mt-2">{stats.stockBelowRecommended}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-rose-100">
            <span>Below recommended levels</span>
          </div>
        </div>

        {/* Allocation Locations */}
        <div className="group p-6 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Locations</p>
              <p className="text-4xl font-bold mt-2">{stats.uniqueLocations}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-100">
            <span>Allocation destinations</span>
          </div>
        </div>
      </div>

      {/* ── Content Glass Card ─────────────────────────────────────────────── */}
      <div className="glass rounded-3xl p-8 border border-white/30">
        {/* PHC Center Selector */}
        <div className="max-w-md mb-6">
          <Label required>Select PHC Center</Label>
          <SearchableCombobox
            value={selectedCenter?.id || null}
            onChange={(val) => {
              const center = centers.find((c) => c.id === val) || null;
              handleCenterChange(center);
            }}
            options={centers.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            }))}
            placeholder="Search PHC centers..."
            noSelectionLabel="Select a center"
          />
        </div>

        {!selectedCenter ? (
          /* ── Empty State: No PHC Selected ──────────────────────────── */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-4 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Select a PHC Center</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Choose a primary health center from the dropdown above to view and manage its linked medications.
            </p>
          </div>
        ) : items.length === 0 && !isLoading ? (
          /* ── Empty State: No Linked Medications ────────────────────── */
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Medications Linked</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              This PHC center doesn't have any medications linked yet. Start by linking a medication to this center.
            </p>
            <Button
              variant="gradient"
              gradient="from-rose-500 to-red-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={openAddModal}
            >
              Link Your First Medication
            </Button>
          </div>
        ) : (
          selectedItem ? (
            /* ── Detail Panel View (card grid hidden) ────────────── */
            <>
              {/* Back button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-rose-600 transition-colors mb-6"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all linked medications
              </button>

              <PhcDetailPanel
                item={selectedItem}
                onEdit={openEditModal}
                onDelete={(id) => setDeleteConfirm(id)}
                onToggleActive={handleToggleActive}
              />
            </>
          ) : (
            /* ── Card Grid View ─────────────────────────────────── */
            <>
              {/* Search + Filter Card */}
              <Card variant="outlined" padding="md" className="mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                  {/* Search input */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                      Search Medication
                    </label>
                    <div ref={medDropdownRef} className="relative">
                      <Input
                        ref={medInputRef}
                        placeholder="Search by medication name..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setMedDropdownOpen(true);
                        }}
                        onFocus={() => { setMedHighlightedIndex(-1); setMedDropdownOpen(true); }}
                        onKeyDown={handleMedDropdownKeyDown}
                        leftIcon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        }
                      />

                      {medDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto">
                          {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
                            </div>
                          ) : items.length === 0 ? (
                            <div className="text-center py-8 px-4">
                              <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <p className="mt-2 text-sm text-gray-500">
                                {searchQuery ? 'No medications match your search' : 'No medications available'}
                              </p>
                            </div>
                          ) : (
                            <div role="listbox" className="py-1">
                              {items.map((medItem, index) => (
                                <MedDropdownItem
                                  key={medItem.id}
                                  item={medItem}
                                  isHighlighted={index === medHighlightedIndex}
                                  onClick={handleMedDropdownSelect}
                                />
                              ))}
                            </div>
                          )}

                          {!isLoading && items.length > 0 && (
                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                              <span>{items.length} result{items.length !== 1 ? 's' : ''}</span>
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

                  {/* Location Filter */}
                  <div className="w-44">
                    <SearchableCombobox
                      value={locationFilter || null}
                      onChange={(val) => setLocationFilter(val ? val as string : '')}
                      options={LOCATION_OPTIONS}
                      placeholder="Filter by location..."
                      noSelectionLabel="All Locations"
                      clearable={false}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button type="submit" variant="outline">Search</Button>
                    {(searchQuery || locationFilter) && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                          setSearchQuery('');
                          setLocationFilter('');
                        }}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </form>
              </Card>

              {/* Error banner */}
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Loading overlay (when refreshing data) */}
              {isLoading && items.length > 0 && (
                <div className="flex items-center justify-center py-8 mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-5 h-5 animate-spin text-rose-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading medications...</span>
                  </div>
                </div>
              )}

              {/* Card Grid - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {items.map((item) => (
                  <PhcMedicationCard
                    key={item.id}
                    item={item}
                    onClick={() => handleSelect(item)}
                    onEdit={openEditModal}
                    onDelete={(id) => setDeleteConfirm(id)}
                  />
                ))}
              </div>

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
                      onClick={() => {
                        const newPage = pagination.currentPage - 1;
                        if (selectedCenter) fetchByCenter(selectedCenter.id, newPage, buildFilters());
                      }}
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
                        onClick={() => {
                          if (selectedCenter) fetchByCenter(selectedCenter.id, page, buildFilters());
                        }}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.currentPage >= pagination.totalPages}
                      onClick={() => {
                        const newPage = pagination.currentPage + 1;
                        if (selectedCenter) fetchByCenter(selectedCenter.id, newPage, buildFilters());
                      }}
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
          )
        )}
      </div>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader
          title={editingItem ? 'Edit PHC Medication' : 'Link Medication'}
          onClose={() => setIsModalOpen(false)}
        />
        <ModalContent>
          <div className="space-y-4">
            <div>
              <Label required>Medication</Label>
              {editingItem ? (
                <p className="text-sm font-medium text-slate-700 py-2">
                  {items.find((i) => i.id === editingItem.id)?.medication?.name || '-'}
                </p>
              ) : (
                <SearchableCombobox
                  value={formData.medication_id || null}
                  onChange={(val) => setFormData({ ...formData, medication_id: (val as number) || 0 })}
                  options={availableMedications.map((m) => ({
                    value: m.id,
                    label: `${m.name}${m.strength ? ` ${m.strength}` : ''}${m.form ? ` - ${m.form}` : ''}`,
                  }))}
                  placeholder="Search medications..."
                  error={formErrors.medication_id}
                  noSelectionLabel="Select medication"
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label required>Recommended Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.recommended_quantity || ''}
                  onChange={(e) => setFormData({ ...formData, recommended_quantity: parseFloat(e.target.value) || 0 })}
                  error={formErrors.recommended_quantity}
                />
              </div>
              <div>
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_stock ?? ''}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label>Allocation Location</Label>
              <SearchableCombobox
                key={editingItem?.id || 'new'}
                value={formData.allocation_location || ''}
                onChange={(val) => setFormData({ ...formData, allocation_location: (val as string) || '' })}
                options={LOCATION_OPTIONS}
                placeholder="Select location..."
                noSelectionLabel="No location"
                clearable
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient="from-rose-500 to-red-500"
            onClick={handleSubmit}
          >
            {editingItem ? 'Save Changes' : 'Link Medication'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Import/Export Data Modal ────────────────────────────────────────── */}
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
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-rose-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">Import PHC Medications</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-rose-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">Export PHC Medications</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map((format) => (
                  <button key={format} onClick={() => handleExportFormatSelect(format)} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-red-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your PHC medication data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-rose-600">Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                </button>
                <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-red-500 hover:bg-red-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-red-600">Export</h3>
                  <p className="text-sm text-slate-500 mt-1">Download PHC medication data</p>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal isOpen={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)} size="sm">
        <ModalHeader title="Unlink Medication" onClose={() => setDeleteConfirm(null)} />
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
                This will unlink the medication from this PHC center. The medication will remain in the catalog.
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
            Unlink Medication
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PhcMedicationsPage;
