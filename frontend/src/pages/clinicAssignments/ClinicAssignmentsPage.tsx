import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { ClinicAssignmentForm, ClinicAssignmentCard } from '../../components/features/clinicAssignments';
import { useClinicAssignmentStore } from '../../stores/clinicAssignmentStore';
import { useToast } from '../../components/ui/toast';
import type { ClinicAssignment, ClinicAssignmentCreateInput, ClinicAssignmentFilters } from '../../types/clinicAssignment';
import { CLINIC_ASSIGNMENT_STATUS_OPTIONS } from '../../types/clinicAssignment';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface DropdownItemProps {
  assignment: ClinicAssignment;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (assignment: ClinicAssignment) => void;
  onEdit: (assignment: ClinicAssignment) => void;
  onDelete: (assignment: ClinicAssignment) => void;
  onToggleActive: (assignment: ClinicAssignment, isActive: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  assignment,
  isSelected,
  isHighlighted,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(assignment)}
    >
      <div className={`
        shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xs
        transition-colors duration-200
        ${isSelected
          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20'
          : 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-700'
        }
      `}>
        {(assignment.name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '—'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
            {assignment.name}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(assignment, !assignment.is_active); }}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
              ${assignment.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {assignment.is_active ? 'Active' : 'Inactive'}
          </button>
        </div>
        {assignment.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{assignment.description}</p>
        )}
      </div>

      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleActive(assignment, !assignment.is_active); }}
          className={`
            p-1.5 rounded-lg transition-colors
            ${assignment.is_active
              ? 'text-emerald-500 hover:bg-emerald-50'
              : 'text-gray-400 hover:bg-gray-100'
            }
          `}
          title={assignment.is_active ? 'Deactivate' : 'Activate'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {assignment.is_active
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            }
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(assignment); }}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(assignment); }}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

interface DetailPanelProps {
  assignment: ClinicAssignment;
  onEdit: (assignment: ClinicAssignment) => void;
  onDelete: (assignment: ClinicAssignment) => void;
  onToggleActive: (assignment: ClinicAssignment, isActive: boolean) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  assignment,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
            {(assignment.name.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '—'}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{assignment.name}</h2>
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full
                ${assignment.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
                }
              `}>
                {assignment.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {assignment.description && (
              <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleActive(assignment, !assignment.is_active)}
            className={`
              text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
              ${assignment.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {assignment.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(assignment)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(assignment)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Created</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Updated</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {assignment.updated_at ? new Date(assignment.updated_at).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Status</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {assignment.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export const ClinicAssignmentsPage: React.FC = () => {
  const {
    assignments,
    isLoading,
    isImporting,
    error,
    pagination,
    fetchAssignments,
    createAssignment,
    updateAssignment,
    toggleAssignmentStatus,
    deleteAssignment,
    clearError,
    exportAssignments,
    importAssignments,
  } = useClinicAssignmentStore();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<ClinicAssignment | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<ClinicAssignment | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<ClinicAssignment | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback((): ClinicAssignmentFilters => {
    const filters: ClinicAssignmentFilters = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== '') filters.is_active = statusFilter;
    return filters;
  }, [searchQuery, statusFilter]);

  const loadAssignments = useCallback(async (page: number = 1) => {
    await fetchAssignments({ page, per_page: 100, filters: buildFilters() });
  }, [fetchAssignments, buildFilters]);

  useEffect(() => {
    loadAssignments(1);
  }, [loadAssignments]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssignments = assignments;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadAssignments(1);
    setDropdownOpen(true);
  };

  const handleSelect = (assignment: ClinicAssignment) => {
    setSelectedAssignment(assignment);
    setDropdownOpen(false);
    setSearchQuery(assignment.name);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredAssignments.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredAssignments[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (assignment: ClinicAssignment) => {
    setEditingAssignment(assignment);
    setShowFormModal(true);
    setShowDeleteModal(false);
  };

  const handleOpenDelete = (assignment: ClinicAssignment) => {
    setDeletingAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingAssignment(null);
    setDeletingAssignment(null);
  };

  const handleSubmit = async (data: ClinicAssignmentCreateInput) => {
    if (editingAssignment) {
      await updateAssignment(editingAssignment.id, data);
      addToast('Clinic assignment updated successfully', 'success');
    } else {
      await createAssignment(data);
      addToast('Clinic assignment created successfully', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (deletingAssignment) {
      await deleteAssignment(deletingAssignment.id);
      addToast('Clinic assignment deleted successfully', 'success');
      if (selectedAssignment?.id === deletingAssignment.id) {
        setSelectedAssignment(null);
        setSearchQuery('');
      }
      handleCloseModal();
    }
  };

  const handleToggleActive = async (assignment: ClinicAssignment, _isActive: boolean) => {
    await toggleAssignmentStatus(assignment.id);
    if (selectedAssignment?.id === assignment.id) {
      setSelectedAssignment({ ...assignment, is_active: !assignment.is_active });
    }
    addToast(
      `Clinic assignment ${!assignment.is_active ? 'activated' : 'deactivated'}`,
      'success'
    );
  };

  const handleClearSelection = () => {
    setSelectedAssignment(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleExport = async (format: ExportFormat = 'xlsx') => {
    try {
      const blob = await exportAssignments(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `clinic-assignments-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Clinic assignments exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export clinic assignments', 'error');
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
      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/v1/clinic-assignments/sample`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to download sample');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `clinic-assignments-sample-${timestamp}.xlsx`;
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
      const result = await importAssignments(file);
      if (result.success) {
        addToast(result.message || 'Clinic assignments imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import clinic assignments', 'error');
      }
    } catch {
      addToast('Failed to import clinic assignments', 'error');
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Clinic Assignments
          </h1>
          <p className="text-slate-500 mt-1">Search and manage clinic assignments</p>
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
            gradient="from-blue-500 to-cyan-500"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={handleOpenCreate}
          >
            Add Clinic Assignment
          </Button>
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
          <div ref={dropdownRef} className="flex-1 min-w-[280px] relative">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Search Clinic Assignment
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search... (e.g., Morning Shift)"
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

              {dropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredAssignments.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No clinic assignments match your search' : 'No clinic assignments found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new clinic assignment to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {filteredAssignments.map((assignment, index) => (
                        <DropdownItem
                          key={assignment.id}
                          assignment={assignment}
                          isSelected={selectedAssignment?.id === assignment.id}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleSelect}
                          onEdit={handleOpenEdit}
                          onDelete={handleOpenDelete}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  )}

                  {!isLoading && filteredAssignments.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{filteredAssignments.length} result{filteredAssignments.length !== 1 ? 's' : ''}</span>
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
              value={statusFilter === '' ? null : statusFilter}
              onChange={(val) => {
                if (val === null || val === '') setStatusFilter('');
                else if (typeof val === 'boolean') setStatusFilter(val);
                else setStatusFilter(val === 'true');
              }}
              options={CLINIC_ASSIGNMENT_STATUS_OPTIONS.map((opt) => ({
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
            {(searchQuery || statusFilter !== '') && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setSelectedAssignment(null);
                  loadAssignments(1);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Card Grid */}
      {!isLoading && assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment) => (
            <ClinicAssignmentCard
              key={assignment.id}
              assignment={assignment}
              onClick={() => handleSelect(assignment)}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedAssignment && (
        <DetailPanel
          assignment={selectedAssignment}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      {/* Empty state */}
      {!isLoading && assignments.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No clinic assignments yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first clinic assignment.
              </p>
              <div className="mt-6">
                <Button
                  variant="gradient"
                  gradient="from-blue-500 to-cyan-500"
                  onClick={handleOpenCreate}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Create Clinic Assignment
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
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} clinic assignments
            <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => {
                fetchAssignments({ page: pagination.currentPage - 1, filters: buildFilters() });
              }}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              Previous
            </Button>
            {pagination.totalPages <= 7 ? (
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      fetchAssignments({ page, filters: buildFilters() });
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {[1, 2, '...', pagination.totalPages - 1, pagination.totalPages].map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={idx} className="px-2 text-gray-400">...</span>
                    );
                  }
                  return (
                    <Button
                      key={item}
                      variant={item === pagination.currentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => {
                        fetchAssignments({ page: item as number, filters: buildFilters() });
                      }}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => {
                fetchAssignments({ page: pagination.currentPage + 1, filters: buildFilters() });
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

      {/* Create/Edit Modal */}
      <Modal isOpen={showFormModal} onClose={handleCloseModal}>
        <ModalHeader
          title={editingAssignment ? 'Edit Clinic Assignment' : 'Create Clinic Assignment'}
          onClose={handleCloseModal}
        />
        <ModalContent>
          <ClinicAssignmentForm
            assignment={editingAssignment || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isLoading={isLoading}
          />
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader
          title="Delete Clinic Assignment"
          onClose={handleCloseModal}
        />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingAssignment?.name}</strong>? This action cannot be undone.
          </p>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Import Clinic Assignments</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-2m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file with the correct format</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Export Clinic Assignments</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleExportFormatSelect('csv')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">CSV</h3><p className="text-sm text-slate-500">Export as CSV</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('xlsx')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">XLSX</h3><p className="text-sm text-slate-500">Export as Excel</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('pdf')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
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
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your clinic assignment data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-blue-600">Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                </button>
                <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-cyan-600">Export</h3>
                  <p className="text-sm text-slate-500 mt-1">Download clinic assignment data</p>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ClinicAssignmentsPage;
