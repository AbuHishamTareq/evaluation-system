import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { ZoneCard, ZoneForm } from '../../components/features/zones';
import { useZoneStore } from '../../stores/zoneStore';
import { useToast } from '../../components/ui/toast';
import type { Zone, ZoneCreateInput, ZoneLevel, ZoneFilters } from '../../types/zone';
import { ZONE_LEVEL_OPTIONS } from '../../types/zone';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// ─── Searchable Dropdown Item ───────────────────────────────────────────────
interface DropdownItemProps {
  zone: Zone;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (zone: Zone) => void;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  zone,
  isSelected,
  isHighlighted,
  onClick,
  onEdit,
  onDelete,
}) => {
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
      onClick={() => onClick(zone)}
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
        {zone.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-cyan-700' : 'text-gray-900'}`}>
            {zone.name}
          </span>
          <span className={`
            text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700
          `}>
            {zone.level}
          </span>
        </div>
        {zone.code && (
          <p className="text-xs text-gray-500 mt-0.5">{zone.code}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
          {zone.parent && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {zone.parent.name}
            </span>
          )}
          {zone.children_count !== undefined && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {zone.children_count} children
            </span>
          )}
        </div>
      </div>

      {/* Actions (visible on hover or when selected) */}
      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(zone); }}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(zone); }}
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

// ─── Detail Panel ───────────────────────────────────────────────────────────
interface DetailPanelProps {
  zone: Zone;
  onEdit: (zone: Zone) => void;
  onDelete: (zone: Zone) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  zone,
  onEdit,
  onDelete,
}) => {
  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
            {zone.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{zone.name}</h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-100 text-cyan-700">
                {zone.level}
              </span>
            </div>
            {zone.code && (
              <p className="text-sm text-gray-500 mt-1">Code: {zone.code}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(zone)}
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
            onClick={() => onDelete(zone)}
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

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        {/* Parent Zone */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Parent</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {zone.parent ? zone.parent.name : '—'}
          </p>
        </div>

        {/* Children Count */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Children</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {zone.children_count ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">sub-zones</p>
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
            {zone.created_at ? new Date(zone.created_at).toLocaleDateString() : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {zone.created_at ? new Date(zone.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>

        {/* Updated */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Updated</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {zone.updated_at ? new Date(zone.updated_at).toLocaleDateString() : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {zone.updated_at ? new Date(zone.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </p>
        </div>
      </div>

      {zone.description && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
          <p className="text-sm text-gray-700">{zone.description}</p>
        </div>
      )}
    </Card>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export const ZonesPage: React.FC = () => {
  const {
    zones,
    isLoading,
    isImporting,
    error,
    pagination,
    fetchZones,
    createZone,
    updateZone,
    deleteZone,
    fetchZoneTree,
    clearError,
    exportZones,
    importZones,
  } = useZoneStore();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<ZoneLevel | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);
  const [parentZones, setParentZones] = useState<Zone[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback((): ZoneFilters => {
    const filters: ZoneFilters = {};
    if (searchQuery) filters.search = searchQuery;
    if (levelFilter) filters.level = levelFilter;
    return filters;
  }, [searchQuery, levelFilter]);

  const loadZones = useCallback(async (page: number = 1) => {
    await fetchZones({ page, per_page: 100, filters: buildFilters() });
  }, [fetchZones, buildFilters]);

  const loadParentZones = useCallback(async () => {
    try {
      const tree = await fetchZoneTree() as unknown;
      if (Array.isArray(tree)) {
        setParentZones(tree);
      } else if (tree && typeof tree === 'object' && 'data' in tree && Array.isArray((tree as { data: unknown }).data)) {
        setParentZones((tree as { data: Zone[] }).data);
      } else {
        setParentZones([]);
      }
    } catch {
      setParentZones([]);
    }
  }, [fetchZoneTree]);

  useEffect(() => {
    loadZones(1);
  }, [loadZones]);

  useEffect(() => {
    loadParentZones();
  }, [loadParentZones]);

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
      const blob = await exportZones(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `zones-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Zones exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export zones', 'error');
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
    link.href = '/templates/zones-sample.xlsx';
    link.download = 'zones-sample.xlsx';
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
      const result = await importZones(file);
      if (result.success) {
        addToast(result.message || 'Zones imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import zones', 'error');
      }
    } catch {
      addToast('Failed to import zones', 'error');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadZones(1);
    setDropdownOpen(true);
  };

  const handleSelect = (zone: Zone) => {
    setSelectedZone(zone);
    setDropdownOpen(false);
    setSearchQuery(zone.name);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, zones.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(zones[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedZone(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleOpenCreate = () => {
    setEditingZone(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (zone: Zone) => {
    setEditingZone(zone);
    setShowFormModal(true);
    setShowDeleteModal(false);
  };

  const handleOpenDelete = (zone: Zone) => {
    setDeletingZone(zone);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingZone(null);
    setDeletingZone(null);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
    setShowImportOptions(false);
    setShowExportOptions(false);
  };

  const handleSubmit = async (data: ZoneCreateInput) => {
    if (editingZone) {
      await updateZone(editingZone.id, data);
      addToast('Zone updated successfully', 'success');
    } else {
      await createZone(data);
      addToast('Zone created successfully', 'success');
    }
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (deletingZone) {
      await deleteZone(deletingZone.id);
      addToast('Zone deleted successfully', 'success');
      if (selectedZone?.id === deletingZone.id) {
        setSelectedZone(null);
        setSearchQuery('');
      }
      handleCloseModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Zone Management
          </h1>
          <p className="text-slate-500 mt-1">Search and manage regions, districts, and sub-districts</p>
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
            gradient="from-cyan-500 to-teal-500"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            onClick={handleOpenCreate}
          >
            Add Zone
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
          {/* Searchable Dropdown */}
          <div ref={dropdownRef} className="flex-1 min-w-[280px] relative">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Search Zone
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search... (e.g., zone name)"
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
                  ) : zones.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No zones match your search' : 'No zones found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new zone to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {zones.map((zone, index) => (
                        <DropdownItem
                          key={zone.id}
                          zone={zone}
                          isSelected={selectedZone?.id === zone.id}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleSelect}
                          onEdit={handleOpenEdit}
                          onDelete={handleOpenDelete}
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  {!isLoading && zones.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{zones.length} result{zones.length !== 1 ? 's' : ''}</span>
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

          {/* Level Filter */}
          <div className="w-44">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Level
            </label>
            <SearchableCombobox
              value={levelFilter || null}
              onChange={(val) => setLevelFilter(val ? val as ZoneLevel : '')}
              options={ZONE_LEVEL_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Filter by level..."
              noSelectionLabel="All Levels"
              clearable={false}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="outline">
              Search
            </Button>
            {(searchQuery || levelFilter) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setLevelFilter('');
                  setSelectedZone(null);
                  loadZones(1);
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

      {/* Zones Card Grid */}
      {!isLoading && zones.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              showChildren
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedZone && (
        <DetailPanel
          zone={selectedZone}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Empty state */}
      {!isLoading && zones.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No zones yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first zone. Zones help organize centers into regions, districts, and sub-districts.
              </p>
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
                  Create Zone
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
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} zones
            <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => fetchZones({ page: pagination.currentPage - 1, filters: buildFilters() })}
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
                    onClick={() => fetchZones({ page, filters: buildFilters() })}
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
                      <span key={idx} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={item}
                      variant={item === pagination.currentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => fetchZones({ page: item as number, filters: buildFilters() })}
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
              onClick={() => fetchZones({ page: pagination.currentPage + 1, filters: buildFilters() })}
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
          title={editingZone ? 'Edit Zone' : 'Create Zone'}
          onClose={handleCloseModal}
        />
        <ModalContent>
          <ZoneForm
            zone={editingZone || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isLoading={isLoading}
            parentZones={parentZones}
          />
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader
          title="Delete Zone"
          onClose={handleCloseModal}
        />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingZone?.name}</strong>? This action cannot be undone.
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
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-cyan-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Import Zones</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-teal-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Export Zones</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleExportFormatSelect('csv')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">CSV</h3><p className="text-sm text-slate-500">Export as CSV</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('xlsx')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">XLSX</h3><p className="text-sm text-slate-500">Export as Excel</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('pdf')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">PDF</h3><p className="text-sm text-slate-500">Export as PDF</p></div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your zone data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-cyan-600">Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                </button>
                <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-teal-600">Export</h3>
                  <p className="text-sm text-slate-500 mt-1">Download zone data</p>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ZonesPage;
