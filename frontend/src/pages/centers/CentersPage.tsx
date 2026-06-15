import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { CenterForm, CenterCard } from '../../components/features/centers';
import { useCenterStore } from '../../stores/centerStore';
import { useZoneStore } from '../../stores/zoneStore';
import { useToast } from '../../components/ui/toast';
import type { Center, CenterCreateInput, CenterClassification, CenterFilters } from '../../types/center';
import { CENTER_CLASSIFICATION_OPTIONS } from '../../types/center';
import type { ZoneFilters } from '../../types/zone';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { Staff } from '../../types/staff';
import { useAuthStore } from '../../stores/authStore';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ─── Searchable Dropdown Item ───────────────────────────────────────────────
interface DropdownItemProps {
  center: Center;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (center: Center) => void;
  onEdit: (center: Center) => void;
  onDelete: (center: Center) => void;
  onToggleActive: (center: Center, isActive: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  center,
  isSelected,
  isHighlighted,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const classificationLabels: Record<string, string> = {
    primary: 'Primary Health Center',
    secondary: 'Secondary Health Center',
    specialized: 'Specialized Center',
    community: 'Community Health Center',
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(center)}
    >
      {/* Icon Badge */}
      <div className={`
        shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm
        transition-colors duration-200
        ${isSelected
          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
          : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700'
        }
      `}>
        {center.code.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-orange-700' : 'text-gray-900'}`}>
            {center.name}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(center, !center.is_active); }}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
              ${center.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {center.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{center.code}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
          {center.zone && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {center.zone.name}
            </span>
          )}
          {center.classification && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {classificationLabels[center.classification] || center.classification}
            </span>
          )}
        </div>
      </div>

      {/* Actions (visible on hover or when selected) */}
      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {hasPermission('centers.activate') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(center, !center.is_active); }}
            className={`
              p-1.5 rounded-lg transition-colors
              ${center.is_active
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100'
              }
            `}
            title={center.is_active ? 'Deactivate' : 'Activate'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {center.is_active
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              }
            </svg>
          </button>
        )}
        {hasPermission('centers.edit') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(center); }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {hasPermission('centers.delete') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(center); }}
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
  center: Center;
  onEdit: (center: Center) => void;
  onDelete: (center: Center) => void;
  onToggleActive: (center: Center, isActive: boolean) => void;
  onViewStaff: (center: Center) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  center,
  onEdit,
  onDelete,
  onToggleActive,
  onViewStaff,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const classificationLabels: Record<string, string> = {
    primary: 'Primary Health Center',
    secondary: 'Secondary Health Center',
    specialized: 'Specialized Center',
    community: 'Community Health Center',
  };

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/25">
            {center.code.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{center.name}</h2>
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full
                ${center.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
                }
              `}>
                {center.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Code: {center.code}</p>
            {center.address && (
              <p className="text-sm text-gray-400 mt-1">{center.address}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('centers.activate') && (
            <button
              type="button"
              onClick={() => onToggleActive(center, !center.is_active)}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${center.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {center.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {hasPermission('centers.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(center)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewStaff(center)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          >
            View Staff
          </Button>
          {hasPermission('centers.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(center)}
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
        {/* Zone */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Zone</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {center.zone ? center.zone.name : '—'}
          </p>
          {center.zone && (
            <p className="text-xs text-gray-400 mt-0.5">{center.zone.code}</p>
          )}
        </div>

        {/* Classification */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Classification</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {classificationLabels[center.classification] || center.classification}
          </p>
        </div>

        {/* Staff Count */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Staff</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {center.staff_count ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">assigned members</p>
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
            {center.created_at ? new Date(center.created_at).toLocaleDateString() : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {center.created_at ? new Date(center.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      {(center.phone || center.email) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm text-gray-500">
          {center.phone && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {center.phone}
            </span>
          )}
          {center.email && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {center.email}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export const CentersPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const {
    centers,
    isLoading,
    isImporting,
    error,
    pagination,
    fetchCenters,
    createCenter,
    updateCenter,
    updateCenterStatus,
    deleteCenter,
    clearError,
    exportCenters,
    importCenters,
  } = useCenterStore();

  const { fetchZones, zones: zoneList } = useZoneStore();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<number | ''>('');
  const [classificationFilter, setClassificationFilter] = useState<CenterClassification | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Center | null>(null);
  const [deletingCenter, setDeletingCenter] = useState<Center | null>(null);
  const [showStaffListModal, setShowStaffListModal] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingStaffList, setLoadingStaffList] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback((): CenterFilters => {
    const filters: CenterFilters = {};
    if (searchQuery) filters.search = searchQuery;
    if (zoneFilter) filters.zone_id = zoneFilter;
    if (classificationFilter) filters.classification = classificationFilter as CenterClassification;
    return filters;
  }, [searchQuery, zoneFilter, classificationFilter]);

  const loadCenters = useCallback(async (page: number = 1) => {
    await fetchCenters({ page, per_page: 100, filters: buildFilters() });
  }, [fetchCenters, buildFilters]);

  useEffect(() => {
    loadCenters(1);
  }, [loadCenters]);

  useEffect(() => {
    const loadZones = async () => {
      const zoneFilters: ZoneFilters = {};
      await fetchZones({ filters: zoneFilters });
    };
    loadZones();
  }, [fetchZones]);

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
      const blob = await exportCenters(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `centers-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Centers exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export centers', 'error');
    }
  };

  const handleExportFormatSelect = (format: ExportFormat) => {
    handleExport(format);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/templates/centers-sample.xlsx';
    link.download = 'centers-sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Sample template downloaded', 'success');
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
      const result = await importCenters(file);
      if (result.success) {
        addToast(result.message || 'Centers imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import centers', 'error');
      }
    } catch {
      addToast('Failed to import centers', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadCenters(1);
    setDropdownOpen(true);
  };

  const handleSelect = (center: Center) => {
    setSelectedCenter(center);
    setDropdownOpen(false);
    setSearchQuery(center.name);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, centers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(centers[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCenter(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleOpenCreate = () => {
    setEditingCenter(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (center: Center) => {
    setEditingCenter(center);
    setShowFormModal(true);
  };

  const handleOpenDelete = (center: Center) => {
    setDeletingCenter(center);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingCenter(null);
    setDeletingCenter(null);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleSubmit = async (data: CenterCreateInput) => {
    if (editingCenter) {
      await updateCenter(editingCenter.id, data);
    } else {
      await createCenter(data);
    }
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (deletingCenter) {
      await deleteCenter(deletingCenter.id);
      setSelectedCenter(null);
      handleCloseModal();
    }
  };

  const handleToggleActive = async (center: Center, isActive: boolean) => {
    await updateCenterStatus(center.id, isActive);
    if (selectedCenter?.id === center.id) {
      setSelectedCenter({ ...center, is_active: isActive });
    }
  };

  const handleViewStaff = async (center: Center) => {
    setShowStaffListModal(true);
    setLoadingStaffList(true);
    setStaffList([]);
    try {
      const response = await apiClient.get<{ data: Staff[] }>(API_ENDPOINTS.staff.byCenter(center.id));
      setStaffList(response.data);
    } catch {
      addToast('Failed to load staff list', 'error');
    } finally {
      setLoadingStaffList(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Health Centers
          </h1>
          <p className="text-slate-500 mt-1">Manage and monitor all PHC centers</p>
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
          {hasPermission('centers.create') && (
            <Button
              variant="gradient"
              gradient="from-orange-500 to-amber-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={handleOpenCreate}
            >
              Add Center
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
              Search Center
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search... (e.g., center name)"
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    </div>
                  ) : centers.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No centers match your search' : 'No centers found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new center to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {centers.map((center, index) => (
                        <DropdownItem
                          key={center.id}
                          center={center}
                          isSelected={selectedCenter?.id === center.id}
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
                  {!isLoading && centers.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{centers.length} result{centers.length !== 1 ? 's' : ''}</span>
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

          {/* Zone Filter */}
          <div className="w-44">
            <SearchableCombobox
              value={zoneFilter || null}
              onChange={(val) => setZoneFilter(typeof val === 'number' ? val : '')}
              options={zoneList.map((z) => ({ value: z.id, label: z.name }))}
              placeholder="Filter by zone..."
              noSelectionLabel="All Zones"
              clearable={false}
            />
          </div>

          {/* Classification Filter */}
          <div className="w-44">
            <SearchableCombobox
              value={classificationFilter || null}
              onChange={(val) => setClassificationFilter(val ? val as CenterClassification : '')}
              options={CENTER_CLASSIFICATION_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              placeholder="Filter by classification..."
              noSelectionLabel="All Classifications"
              clearable={false}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="outline">Search</Button>
            {(searchQuery || zoneFilter || classificationFilter) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setZoneFilter('');
                  setClassificationFilter('');
                  setSelectedCenter(null);
                  loadCenters(1);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      )}

      {/* Centers Card Grid */}
      {!isLoading && centers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((center) => (
            <CenterCard
              key={center.id}
              center={center}
              onClick={() => handleSelect(center)}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedCenter && (
        <DetailPanel
          center={selectedCenter}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleActive={handleToggleActive}
          onViewStaff={handleViewStaff}
        />
      )}

      {/* Empty state */}
      {!isLoading && centers.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No centers yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first health center.
              </p>
              {hasPermission('centers.create') && (
                <div className="mt-6">
                  <Button
                    variant="gradient"
                    gradient="from-orange-500 to-amber-500"
                    onClick={handleOpenCreate}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    Create Center
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
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} centers
            <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchCenters({ page: pagination.currentPage - 1, filters: buildFilters() })}
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
                onClick={() => fetchCenters({ page, filters: buildFilters() })}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchCenters({ page: pagination.currentPage + 1, filters: buildFilters() })}
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
      <Modal isOpen={showFormModal} onClose={handleCloseModal}>
        <ModalHeader title={editingCenter ? 'Edit Center' : 'Create Center'} onClose={handleCloseModal} />
        <ModalContent>
          <CenterForm
            center={editingCenter || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isLoading={isLoading}
            zones={zoneList}
          />
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader title="Delete Center" onClose={handleCloseModal} />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingCenter?.name}</strong>? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>Delete</Button>
        </ModalFooter>
      </Modal>

      {/* Staff List Modal */}
      <Modal isOpen={showStaffListModal} onClose={() => setShowStaffListModal(false)} size="lg">
        <ModalHeader title={`Staff at ${selectedCenter?.name || 'Center'}`} onClose={() => setShowStaffListModal(false)} />
        <ModalContent>
          {loadingStaffList ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" /></div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No staff assigned to this center.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {staffList.map((staff) => (
                <div key={staff.id} className="flex items-center gap-3 py-3">
                  {/* Avatar initial circle */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {staff.full_name?.charAt(0) || '?'}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{staff.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {[staff.professional?.name, staff.department?.name].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    staff.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {staff.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowStaffListModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Import/Export Data Modal */}
      <Modal isOpen={showDataModal} onClose={handleCloseDataModal} size="lg">
        <div className="p-6">
          {showImportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-orange-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Import Centers</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-amber-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Export Centers</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                {(['csv', 'xlsx', 'pdf'] as ExportFormat[]).map((format) => (
                  <button key={format} onClick={() => handleExportFormatSelect(format)} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-300 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your center data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-orange-600">Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                </button>
                <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-amber-600">Export</h3>
                  <p className="text-sm text-slate-500 mt-1">Download center data</p>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CentersPage;
