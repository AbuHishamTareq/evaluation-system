import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { SearchableCombobox } from '../../components/ui/forms/SearchableCombobox';
import { Button } from '../../components/ui/buttons/Button';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { StaffCard, StaffForm } from '../../components/features/staff';
import { useStaffStore } from '../../stores/staffStore';
import { useToast } from '../../components/ui/toast';
import { apiClient } from '../../api/client';
import { API_ENDPOINTS } from '../../api/endpoints';
import type { Staff, StaffFilters, DeactivationRecord } from '../../types/staff';
import { useAuthStore } from '../../stores/authStore';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface DropdownItemProps {
  staffMember: Staff;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (staffMember: Staff) => void;
  onEdit: (staffMember: Staff) => void;
  onDelete: (staffMember: Staff) => void;
  onToggleActive: (staffMember: Staff, isActive?: boolean) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  staffMember,
  isSelected,
  isHighlighted,
  onClick,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const initials = (staffMember.first_name?.charAt(0) || '') + (staffMember.last_name?.charAt(0) || '') || '—';

  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-l-4 border-violet-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(staffMember)}
    >
      <div className={`
        shrink-0 w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xs
        transition-colors duration-200
        ${isSelected
          ? 'bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20'
          : 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700'
        }
      `}>
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-violet-700' : 'text-gray-900'}`}>
            {staffMember.full_name || `${staffMember.first_name} ${staffMember.last_name}`}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(staffMember, !staffMember.is_active); }}
            className={`
              text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors cursor-pointer
              ${staffMember.is_active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : staffMember.deactivation_reason
                  ? DEACTIVATION_REASON_BADGES[staffMember.deactivation_reason]?.style || 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }
            `}
          >
            {staffMember.is_active
              ? 'Active'
              : staffMember.deactivation_reason
                ? DEACTIVATION_REASON_BADGES[staffMember.deactivation_reason]?.label || 'Inactive'
                : 'Inactive'
            }
          </button>
          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
            {staffMember.staff_id}
          </span>
        </div>
        {staffMember.email && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{staffMember.email}</p>
        )}
        {(staffMember.department?.name || staffMember.professional?.name) && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {[staffMember.department?.name, staffMember.professional?.name].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      <div className={`
        shrink-0 flex items-center gap-1 transition-opacity duration-200
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        {hasPermission('staff.edit') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleActive(staffMember, !staffMember.is_active); }}
            className={`
              p-1.5 rounded-lg transition-colors
              ${staffMember.is_active
                ? 'text-emerald-500 hover:bg-emerald-50'
                : 'text-gray-400 hover:bg-gray-100'
              }
            `}
            title={staffMember.is_active ? 'Deactivate' : 'Activate'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {staffMember.is_active
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              }
            </svg>
          </button>
        )}
        {hasPermission('staff.edit') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(staffMember); }}
            className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {hasPermission('staff.delete') && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(staffMember); }}
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

const DEACTIVATION_REASON_BADGES: Record<string, { label: string; style: string }> = {
  terminated: { label: 'Terminated', style: 'bg-red-100 text-red-700 hover:bg-red-200' },
  on_vacation: { label: 'On Vacation', style: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  resigned: { label: 'Resigned', style: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  transferred: { label: 'Transferred', style: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  sabbatical: { label: 'Sabbatical', style: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  suspended: { label: 'Suspended', style: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  other: { label: 'Other', style: 'bg-gray-100 text-gray-500 hover:bg-gray-200' },
};

interface DetailPanelProps {
  staffMember: Staff;
  onEdit: (staffMember: Staff) => void;
  onDelete: (staffMember: Staff) => void;
  onExportCv: (staffMember: Staff) => void;
  onToggleActive: (staffMember: Staff, isActive?: boolean) => void;
  onViewHistory: (staffMember: Staff) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  staffMember,
  onEdit,
  onDelete,
  onExportCv,
  onToggleActive,
  onViewHistory,
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const initials = (staffMember.first_name?.charAt(0) || '') + (staffMember.last_name?.charAt(0) || '') || '—';

  const employmentTypeLabel = (() => {
    switch (staffMember.employment_type) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'contract': return 'Contract';
      case 'temporary': return 'Temporary';
      default: return staffMember.employment_type;
    }
  })();

  const deactivationReasonLabel = staffMember.deactivation_reason
    ? DEACTIVATION_REASON_BADGES[staffMember.deactivation_reason] || { label: staffMember.deactivation_reason, style: 'bg-gray-100 text-gray-700' }
    : null;

  const dateDiff = (from: string, to: string): { years: number; months: number; days: number } => {
    const start = new Date(from);
    const end = new Date(to);
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) };
  };

  const formatDuration = (ymd: { years: number; months: number; days: number }): string => {
    const parts: string[] = [];
    if (ymd.years > 0) parts.push(`${ymd.years} year${ymd.years !== 1 ? 's' : ''}`);
    if (ymd.months > 0) parts.push(`${ymd.months} month${ymd.months !== 1 ? 's' : ''}`);
    if (ymd.days > 0) parts.push(`${ymd.days} day${ymd.days !== 1 ? 's' : ''}`);
    return parts.join(', ') || '0 days';
  };

  const isExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date(new Date().toISOString().split('T')[0]);
  };

  const formatDisplayDate = (date: string | null): string => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const calculateAge = (dateOfBirth: string | null): string | null => {
    if (!dateOfBirth) return null;
    const diff = dateDiff(dateOfBirth, new Date().toISOString().split('T')[0]);
    return `${diff.years} year${diff.years !== 1 ? 's' : ''}`;
  };

  const calculateExperience = (staff: Staff): string | null => {
    const today = new Date().toISOString().split('T')[0];
    let totalYears = 0, totalMonths = 0, totalDays = 0;
    let hasData = false;

    if (staff.experiences && staff.experiences.length > 0) {
      hasData = true;
      for (const exp of staff.experiences) {
        if (exp.from_date && exp.to_date) {
          const d = dateDiff(exp.from_date, exp.to_date);
          totalYears += d.years; totalMonths += d.months; totalDays += d.days;
        } else if (exp.from_date && exp.is_current) {
          const d = dateDiff(exp.from_date, today);
          totalYears += d.years; totalMonths += d.months; totalDays += d.days;
        }
      }
    }

    if (staff.hire_date) {
      hasData = true;
      const d = dateDiff(staff.hire_date, today);
      totalYears += d.years; totalMonths += d.months; totalDays += d.days;
    }

    if (!hasData) return null;

    // Normalize days → months → years
    totalMonths += Math.floor(totalDays / 30);
    totalDays %= 30;
    totalYears += Math.floor(totalMonths / 12);
    totalMonths %= 12;

    return formatDuration({ years: totalYears, months: totalMonths, days: totalDays });
  };

  const age = calculateAge(staffMember.date_of_birth);
  const experience = calculateExperience(staffMember);

  return (
    <Card variant="elevated" padding="lg" className="animate-in fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/25">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{staffMember.full_name || `${staffMember.first_name} ${staffMember.last_name}`}</h2>
              <span className={`
                text-xs font-semibold px-3 py-1 rounded-full
                ${staffMember.is_active
                  ? 'bg-emerald-100 text-emerald-700'
                  : deactivationReasonLabel
                    ? deactivationReasonLabel.style
                    : 'bg-gray-100 text-gray-500'
                }
              `}>
                {staffMember.is_active
                  ? 'Active'
                  : deactivationReasonLabel
                    ? deactivationReasonLabel.label
                    : 'Inactive'
                }
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-slate-400">{staffMember.staff_id}</span>
              {staffMember.email && (
                <span className="text-sm text-gray-500">{staffMember.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('staff.edit') && (
            <button
              type="button"
              onClick={() => onToggleActive(staffMember, !staffMember.is_active)}
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${staffMember.is_active
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }
              `}
            >
              {staffMember.is_active ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {hasPermission('staff.edit') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(staffMember)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
          {hasPermission('staff.export_cv') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportCv(staffMember)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              }
            >
              Export CV
            </Button>
          )}
          {hasPermission('staff.view_history') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(staffMember)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              History
            </Button>
          )}
          {hasPermission('staff.delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(staffMember)}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Mobile</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {staffMember.mobile || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">PHC Center</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {staffMember.center?.name || staffMember.phc_center_id || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Department</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {staffMember.department?.name || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Role Name</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {staffMember.professional?.name || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Clinic Assignment</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {staffMember.clinic_assignment?.name || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Employment Type</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {employmentTypeLabel}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Age</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {age !== null ? age : '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Nationality</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {staffMember.nationality || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wide">Experience</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {experience !== null ? experience : '—'}
          </p>
        </div>

        {staffMember.team_code_id && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide">Team Based Code</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-mono font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-lg border border-violet-200">
                {staffMember.team_code?.code || `#${staffMember.team_code_id}`}
              </span>
              {staffMember.team_code?.role && (
                <span className="text-sm font-medium text-gray-700 capitalize bg-gray-100 px-2.5 py-1 rounded-lg">
                  {staffMember.team_code.role.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        )}

        {staffMember.scfhs_registration_no && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide">SCFHS Registration</span>
              {staffMember.scfhs_expiry_date && (
                <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isExpired(staffMember.scfhs_expiry_date)
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isExpired(staffMember.scfhs_expiry_date) ? 'Invalid' : 'Valid'}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">{staffMember.scfhs_registration_no}</p>
            <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
              <span>Issued: {formatDisplayDate(staffMember.scfhs_issue_date)}</span>
              <span>Expires: {formatDisplayDate(staffMember.scfhs_expiry_date)}</span>
            </div>
            {staffMember.scfhs_expiry_date && !isExpired(staffMember.scfhs_expiry_date) && (
              <p className="text-xs text-slate-500 mt-1">
                Remaining: {formatDuration(dateDiff(new Date().toISOString().split('T')[0], staffMember.scfhs_expiry_date))}
              </p>
            )}
            {staffMember.scfhs_expiry_date && isExpired(staffMember.scfhs_expiry_date) && (
              <p className="text-xs text-rose-500 mt-1">
                Expired
              </p>
            )}
          </div>
        )}

        {staffMember.malpractice_insurance_no && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wide">Malpractice Insurance</span>
              {staffMember.malpractice_expiry_date && (
                <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isExpired(staffMember.malpractice_expiry_date)
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {isExpired(staffMember.malpractice_expiry_date) ? 'Invalid' : 'Valid'}
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 mt-1">{staffMember.malpractice_insurance_no}</p>
            <div className="flex gap-3 mt-1.5 text-xs text-slate-500">
              <span>Issued: {formatDisplayDate(staffMember.malpractice_issue_date)}</span>
              <span>Expires: {formatDisplayDate(staffMember.malpractice_expiry_date)}</span>
            </div>
            {staffMember.malpractice_expiry_date && !isExpired(staffMember.malpractice_expiry_date) && (
              <p className="text-xs text-slate-500 mt-1">
                Remaining: {formatDuration(dateDiff(new Date().toISOString().split('T')[0], staffMember.malpractice_expiry_date))}
              </p>
            )}
            {staffMember.malpractice_expiry_date && isExpired(staffMember.malpractice_expiry_date) && (
              <p className="text-xs text-rose-500 mt-1">
                Expired
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export const StaffPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const {
    staff,
    isLoading,
    isImporting,
    error,
    pagination,
    fetchStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
    clearError,
    exportStaff,
    downloadSample,
    importStaff,
  } = useStaffStore();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);

  // Deactivation modal state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatingStaff, setDeactivatingStaff] = useState<Staff | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('other');
  const [deactivationNotes, setDeactivationNotes] = useState('');
  const [showTerminatedConfirm, setShowTerminatedConfirm] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [reactivatingStaff, setReactivatingStaff] = useState<Staff | null>(null);
  const [reactivationNotes, setReactivationNotes] = useState('');

  // Deactivation history modal state
  const [showDeactivationHistory, setShowDeactivationHistory] = useState(false);
  const [deactivationHistory, setDeactivationHistory] = useState<DeactivationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildFilters = useCallback((): StaffFilters => {
    const filters: StaffFilters = {};
    if (searchQuery) filters.search = searchQuery;
    if (statusFilter !== '') filters.is_active = statusFilter;
    return filters;
  }, [searchQuery, statusFilter]);

  const loadStaff = useCallback(async (page: number = 1) => {
    await fetchStaff({ page, per_page: 100, filters: buildFilters() });
  }, [fetchStaff, buildFilters]);

  useEffect(() => {
    loadStaff(1);
  }, [loadStaff]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStaff = staff;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadStaff(1);
    setDropdownOpen(true);
  };

  const handleSelect = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setDropdownOpen(false);
    setSearchQuery(staffMember.full_name || `${staffMember.first_name} ${staffMember.last_name}`);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredStaff.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredStaff[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowFormModal(true);
    setShowDeleteModal(false);
  };

  const handleOpenDelete = (staffMember: Staff) => {
    setDeletingStaff(staffMember);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDeleteModal(false);
    setEditingStaff(null);
    setDeletingStaff(null);
  };

  const handleSubmit = async (data: any, files: { photo: File | null; documents: File[] }) => {
    let staffId: number;
    try {
      if (editingStaff) {
        const updated = await updateStaff(editingStaff.id, data);
        staffId = editingStaff.id;
        if (selectedStaff?.id === editingStaff.id) {
          setSelectedStaff(updated);
        }
        addToast('Staff member updated successfully', 'success');
      } else {
        const result = await createStaff(data);
        staffId = result.id;
        addToast('Staff member created successfully', 'success');
      }

      if (files.photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', files.photo);
        await apiClient.post(API_ENDPOINTS.staff.uploadPhoto(staffId), photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (files.documents.length > 0) {
        const docFormData = new FormData();
        files.documents.forEach((doc) => docFormData.append('documents[]', doc));
        await apiClient.post(API_ENDPOINTS.staff.uploadDocuments(staffId), docFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await fetchStaff();

      handleCloseModal();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save staff member';
      addToast(message, 'error');
    }
  };

  const handleDelete = async () => {
    if (deletingStaff) {
      await deleteStaff(deletingStaff.id);
      addToast('Staff member deleted successfully', 'success');
      if (selectedStaff?.id === deletingStaff.id) {
        setSelectedStaff(null);
        setSearchQuery('');
      }
      handleCloseModal();
    }
  };

  const DEACTIVATION_REASONS = [
    { value: 'terminated', label: 'Terminated' },
    { value: 'on_vacation', label: 'On Vacation' },
    { value: 'resigned', label: 'Resigned' },
    { value: 'sabbatical', label: 'Sabbatical' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'other', label: 'Other' },
  ];

  const handleToggleActive = (staffMember: Staff) => {
    if (staffMember.is_active) {
      // Deactivating — show reason modal
      setDeactivatingStaff(staffMember);
      setDeactivationReason('other');
      setDeactivationNotes('');
      setShowTerminatedConfirm(false);
      setShowDeactivateModal(true);
      return;
    }
    // Reactivating — show reason modal
    setReactivatingStaff(staffMember);
    setReactivationNotes('');
    setShowReactivateModal(true);
  };

  const performToggleActive = async (staffMember: Staff, reason?: string, notes?: string, reactivationNotes?: string) => {
    const data = reason
      ? { deactivation_reason: reason, deactivation_notes: notes }
      : reactivationNotes
        ? { reactivation_notes: reactivationNotes }
        : undefined;
    await toggleStaffStatus(staffMember.id, data);
    if (selectedStaff?.id === staffMember.id) {
      setSelectedStaff({ ...staffMember, is_active: !staffMember.is_active });
    }
    addToast(
      `Staff member ${!staffMember.is_active ? 'activated' : 'deactivated'}`,
      'success'
    );
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingStaff) return;

    // If "Terminated" is selected, require secondary confirmation
    if (deactivationReason === 'terminated' && !showTerminatedConfirm) {
      setShowTerminatedConfirm(true);
      return;
    }

    performToggleActive(deactivatingStaff, deactivationReason, deactivationNotes);
    setShowDeactivateModal(false);
    setDeactivatingStaff(null);
    setShowTerminatedConfirm(false);
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateModal(false);
    setDeactivatingStaff(null);
    setShowTerminatedConfirm(false);
  };

  const handleConfirmReactivate = () => {
    if (!reactivatingStaff) return;
    performToggleActive(reactivatingStaff, undefined, undefined, reactivationNotes);
    setShowReactivateModal(false);
    setReactivatingStaff(null);
    setReactivationNotes('');
  };

  const handleCancelReactivate = () => {
    setShowReactivateModal(false);
    setReactivatingStaff(null);
    setReactivationNotes('');
  };

  const handleViewHistory = async (staffMember: Staff) => {
    setShowDeactivationHistory(true);
    setLoadingHistory(true);
    setDeactivationHistory([]);
    try {
      const response = await apiClient.get<DeactivationRecord[] | { data: DeactivationRecord[] }>(API_ENDPOINTS.staff.deactivations(staffMember.id));
      const data = Array.isArray(response) ? response : response.data ?? [];
      setDeactivationHistory(data);
    } catch {
      addToast('Failed to load deactivation history', 'error');
      setDeactivationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExportCv = useCallback((staffMember: Staff) => {
    const formatDate = (d: string | null) => {
      if (!d) return '—';
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const empTypeLabel = (() => {
      switch (staffMember.employment_type) {
        case 'full_time': return 'Full Time';
        case 'part_time': return 'Part Time';
        case 'contract': return 'Contract';
        case 'temporary': return 'Temporary';
        default: return staffMember.employment_type;
      }
    })();

    const age = staffMember.date_of_birth
      ? (() => {
          const today = new Date();
          const dob = new Date(staffMember.date_of_birth!);
          let y = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) y--;
          return `${y} years`;
        })()
      : '—';

    const escape = (str: string | null | undefined) => {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    const degreesHtml = staffMember.educational_degrees?.length
      ? staffMember.educational_degrees.map(d => `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${escape(d.name)}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${escape(d.pivot?.institution) || '—'}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align: center;">${d.pivot?.year_obtained ?? '—'}</td>
        </tr>`).join('')
      : '<tr><td colspan="3" style="padding: 6px 10px; border: 1px solid #ddd; text-align: center; color: #999;">No degrees recorded</td></tr>';

    const expHtml = staffMember.experiences?.length
      ? staffMember.experiences.map(e => `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${escape(e.company)}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${escape(e.position) || '—'}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align: center;">${formatDate(e.from_date)} – ${e.is_current ? 'Present' : formatDate(e.to_date)}</td>
        </tr>`).join('')
      : '<tr><td colspan="3" style="padding: 6px 10px; border: 1px solid #ddd; text-align: center; color: #999;">No experience recorded</td></tr>';

    const certHtml = staffMember.certifications?.length
      ? staffMember.certifications.map(c => `
        <tr>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${escape(c.name)}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd;">${escape(c.issuing_organization) || '—'}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align: center;">${formatDate(c.issue_date)}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align: center;">${c.expiry_date ? formatDate(c.expiry_date) : '—'}</td>
          <td style="padding: 6px 10px; border: 1px solid #ddd; text-align: center;">${escape(c.credential_id) || '—'}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" style="padding: 6px 10px; border: 1px solid #ddd; text-align: center; color: #999;">No certifications recorded</td></tr>';

    const cvHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV — ${escape(staffMember.full_name)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; font-size: 11px; color: #1e293b; padding: 28px 36px; line-height: 1.6; }
    .header { padding-bottom: 12px; margin-bottom: 18px; border-bottom: 1px solid #e2e8f0; }
    .header h1 { font-size: 20px; color: #0f172a; margin: 0 0 2px 0; font-weight: 700; letter-spacing: 0.3px; }
    .header .staff-id { font-size: 10px; color: #64748b; margin: 0 0 6px 0; }
    .header .accent-bar { height: 3px; background: #0d9488; width: 48px; margin: 0 0 8px 0; }
    .header .contact-row { font-size: 10px; color: #475569; }
    .section { margin-bottom: 16px; }
    .section-title { font-size: 11px; font-weight: 700; color: #0f766e; background: #f0fdfa; padding: 5px 9px; margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.7px; }
    table.details { width: 100%; border-collapse: collapse; }
    table.details td { padding: 3px 7px; vertical-align: top; }
    table.details .label { font-weight: 600; color: #475569; width: 140px; white-space: nowrap; }
    table.details .value { color: #1e293b; }
    table.data-table { width: 100%; border-collapse: collapse; margin-top: 3px; }
    table.data-table th { background: #0d9488; color: #fff; padding: 5px 8px; text-align: left; font-size: 8.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
    table.data-table td { padding: 4px 8px; border-bottom: 1px solid #e2e8f0; font-size: 9.5px; }
    table.data-table tr:nth-child(even) td { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; font-size: 9px; font-weight: 600; border-radius: 4px; }
    .badge-active { background: #d1fae5; color: #065f46; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }
    .badge-valid { background: #d1fae5; color: #065f46; }
    .badge-expired { background: #fef3c7; color: #92400e; }
    .badge-na { color: #94a3b8; font-style: italic; font-weight: 400; }
    .footer { margin-top: 22px; padding-top: 9px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 8.5px; color: #94a3b8; }
    .print-date { text-align: right; font-size: 8.5px; color: #94a3b8; }
    @media print { body { padding: 18px 28px; } }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: flex-start;" class="header">
    <div>
      <h1>${escape(staffMember.full_name)}</h1>
      <div class="staff-id">Employee ID: ${escape(staffMember.employee_id || staffMember.staff_id || '')}</div>
      <div class="accent-bar"></div>
      <div class="contact-row">
        ${staffMember.email ? `Email: ${escape(staffMember.email)}` : ''}${staffMember.email && (staffMember.phone || staffMember.mobile) ? ' &nbsp;|&nbsp; ' : ''}
        ${staffMember.phone ? `Phone: ${escape(staffMember.phone)}` : ''}${staffMember.phone && staffMember.mobile ? ' &nbsp;|&nbsp; ' : ''}
        ${staffMember.mobile ? `Mobile: ${escape(staffMember.mobile)}` : ''}
      </div>
    </div>
    <div class="print-date">
      Printed: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Personal Information</div>
    <table class="details">
      <tr><td class="label">Date of Birth</td><td class="value">${formatDate(staffMember.date_of_birth)}</td></tr>
      <tr><td class="label">Age</td><td class="value">${age}</td></tr>
      <tr><td class="label">National ID</td><td class="value">${escape(staffMember.national_id) || '—'}</td></tr>
      <tr><td class="label">Gender</td><td class="value">${escape(staffMember.gender) || '—'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Professional Information</div>
    <table class="details">
      <tr><td class="label">PHC Center</td><td class="value">${escape(staffMember.center?.name) || '—'}</td></tr>
      <tr><td class="label">Department</td><td class="value">${escape(staffMember.department?.name) || '—'}</td></tr>
      <tr><td class="label">Role Name</td><td class="value">${escape(staffMember.professional?.name) || '—'}</td></tr>
      <tr><td class="label">Clinic Assignment</td><td class="value">${escape(staffMember.clinic_assignment?.name) || '—'}</td></tr>
      <tr><td class="label">Employment Type</td><td class="value"><span class="badge badge-active">${empTypeLabel}</span></td></tr>
      <tr><td class="label">Hire Date</td><td class="value">${formatDate(staffMember.hire_date)}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">SCFHS Registration</div>
    <table class="details">
      <tr><td class="label">Registration No.</td><td class="value">${escape(staffMember.scfhs_registration_no) || '<span class="badge-na">N/A</span>'}</td></tr>
      <tr><td class="label">Issue Date</td><td class="value">${formatDate(staffMember.scfhs_issue_date)}</td></tr>
      <tr><td class="label">Expiry Date</td><td class="value">${formatDate(staffMember.scfhs_expiry_date)}</td></tr>
      <tr><td class="label">Status</td><td class="value">${staffMember.scfhs_registration_no ? (staffMember.scfhs_expiry_date && new Date(staffMember.scfhs_expiry_date) < new Date(new Date().toISOString().split('T')[0]) ? '<span class="badge badge-expired">Expired</span>' : '<span class="badge badge-valid">Valid</span>') : '<span class="badge-na">N/A</span>'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Malpractice Insurance</div>
    <table class="details">
      <tr><td class="label">Policy No.</td><td class="value">${escape(staffMember.malpractice_insurance_no) || '<span class="badge-na">N/A</span>'}</td></tr>
      <tr><td class="label">Issue Date</td><td class="value">${formatDate(staffMember.malpractice_issue_date)}</td></tr>
      <tr><td class="label">Expiry Date</td><td class="value">${formatDate(staffMember.malpractice_expiry_date)}</td></tr>
      <tr><td class="label">Status</td><td class="value">${staffMember.malpractice_insurance_no ? (staffMember.malpractice_expiry_date && new Date(staffMember.malpractice_expiry_date) < new Date(new Date().toISOString().split('T')[0]) ? '<span class="badge badge-expired">Expired</span>' : '<span class="badge badge-valid">Valid</span>') : '<span class="badge-na">N/A</span>'}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Educational Degrees</div>
    <table class="data-table">
      <thead><tr><th>Degree</th><th>Institution</th><th style="text-align:center;">Year</th></tr></thead>
      <tbody>${degreesHtml}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Work Experience</div>
    <table class="data-table">
      <thead><tr><th>Company</th><th>Position</th><th style="text-align:center;">Period</th></tr></thead>
      <tbody>${expHtml}</tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Certifications</div>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Organization</th><th style="text-align:center;">Issue Date</th><th style="text-align:center;">Expiry Date</th><th style="text-align:center;">Credential ID</th></tr></thead>
      <tbody>${certHtml}</tbody>
    </table>
  </div>

  <div class="footer">
    PHC Evaluation System — Staff CV — Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Please allow pop-ups to export CV', 'error');
      return;
    }
    printWindow.document.write(cvHtml);
    printWindow.document.close();
    printWindow.focus();
    // Delay print to allow fonts/styles to render
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, [addToast]);

  const handleClearSelection = () => {
    setSelectedStaff(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleExport = async (format: ExportFormat = 'xlsx') => {
    try {
      const blob = await exportStaff(format);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `staff-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        addToast('Staff exported successfully', 'success');
        setShowDataModal(false);
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    } catch {
      addToast('Failed to export staff', 'error');
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
      const blob = await downloadSample();
      if (!blob) {
        addToast('Failed to download sample template', 'error');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `staff-sample-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Sample template downloaded', 'success');
    } catch (err) {
      console.error('Failed to download sample template:', err);
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
      const result = await importStaff(file);
      if (result.success) {
        addToast(result.message || 'Staff imported successfully', 'success');
      } else {
        addToast(result.message || 'Failed to import staff', 'error');
      }
    } catch {
      addToast('Failed to import staff', 'error');
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Staff
          </h1>
          <p className="text-slate-500 mt-1">Search and manage staff directory</p>
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
          {hasPermission('staff.create') && (
            <Button
              variant="gradient"
              gradient="from-violet-500 to-purple-500"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={handleOpenCreate}
            >
              Add Staff
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
          <div ref={dropdownRef} className="flex-1 min-w-[280px] relative">
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Search Staff
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Type to search... (e.g., John Doe)"
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600"></div>
                    </div>
                  ) : filteredStaff.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery ? 'No staff match your search' : 'No staff found'}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {searchQuery ? 'Try a different search term' : 'Create a new staff member to get started'}
                      </p>
                    </div>
                  ) : (
                    <div role="listbox" className="py-1">
                      {filteredStaff.map((staffMember, index) => (
                        <DropdownItem
                          key={staffMember.id}
                          staffMember={staffMember}
                          isSelected={selectedStaff?.id === staffMember.id}
                          isHighlighted={index === highlightedIndex}
                          onClick={handleSelect}
                          onEdit={handleOpenEdit}
                          onDelete={handleOpenDelete}
                          onToggleActive={handleToggleActive}
                        />
                      ))}
                    </div>
                  )}

                  {!isLoading && filteredStaff.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                      <span>{filteredStaff.length} result{filteredStaff.length !== 1 ? 's' : ''}</span>
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
              options={[
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' },
              ]}
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
                  setSelectedStaff(null);
                  loadStaff(1);
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      )}

      {/* Card Grid (hidden when detail panel is open) */}
      {!isLoading && staff.length > 0 && !selectedStaff && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((staffMember) => (
            <StaffCard
              key={staffMember.id}
              staff={staffMember}
              isSelected={false}
              onClick={() => handleSelect(staffMember)}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {!isLoading && selectedStaff && (
        <DetailPanel
          staffMember={selectedStaff}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onExportCv={handleExportCv}
          onToggleActive={handleToggleActive}
          onViewHistory={handleViewHistory}
        />
      )}

      {/* Empty state */}
      {!isLoading && staff.length === 0 && !selectedStaff && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No staff members yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by adding your first staff member. Staff are the core of the evaluation system.
              </p>
              {hasPermission('staff.create') && (
                <div className="mt-6">
                  <Button
                    variant="gradient"
                    gradient="from-violet-500 to-purple-500"
                    onClick={handleOpenCreate}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    Add Staff
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination (hidden when detail panel is open) */}
      {!isLoading && pagination.totalPages > 1 && !selectedStaff && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} staff
            <span className="ml-2 text-gray-400">(Page {pagination.currentPage} of {pagination.totalPages})</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 1}
              onClick={() => {
                fetchStaff({ page: pagination.currentPage - 1, filters: buildFilters() });
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
                      fetchStaff({ page, filters: buildFilters() });
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
                        fetchStaff({ page: item as number, filters: buildFilters() });
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
                fetchStaff({ page: pagination.currentPage + 1, filters: buildFilters() });
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
      <Modal isOpen={showFormModal} onClose={handleCloseModal} size="xl">
        <ModalHeader
          title={editingStaff ? 'Edit Staff Member' : 'Create Staff Member'}
          onClose={handleCloseModal}
        />
        <ModalContent>
          <StaffForm
            staff={editingStaff || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isLoading={isLoading}
          />
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={handleCloseModal}>
        <ModalHeader
          title="Delete Staff Member"
          onClose={handleCloseModal}
        />
        <ModalContent>
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deletingStaff?.full_name || `${deletingStaff?.first_name} ${deletingStaff?.last_name}`}</strong>? This action cannot be undone.
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

      {/* Reactivation Reason Modal */}
      <Modal isOpen={showReactivateModal} onClose={handleCancelReactivate}>
        <ModalHeader
          title="Reactivate Staff Member"
          onClose={handleCancelReactivate}
        />
        <ModalContent>
          <div className="space-y-5">
            <p className="text-gray-600">
              Reactivate{' '}
              <strong>{reactivatingStaff?.full_name || `${reactivatingStaff?.first_name} ${reactivatingStaff?.last_name}`}</strong>
              ? Please provide a reason for reactivation:
            </p>

            <div>
              <label htmlFor="reactivation_notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Reactivation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reactivation_notes"
                rows={3}
                value={reactivationNotes}
                onChange={(e) => setReactivationNotes(e.target.value)}
                placeholder="e.g. Returned from sabbatical, completed suspension period, etc."
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCancelReactivate}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmReactivate}
            disabled={!reactivationNotes.trim()}
          >
            Confirm Reactivation
          </Button>
        </ModalFooter>
      </Modal>

      {/* Deactivation Reason Modal */}
      <Modal isOpen={showDeactivateModal} onClose={handleCancelDeactivate}>
        <ModalHeader
          title="Deactivate Staff Member"
          onClose={handleCancelDeactivate}
        />
        <ModalContent>
          <div className="space-y-5">
            <p className="text-gray-600">
              Please select a reason for deactivating{' '}
              <strong>{deactivatingStaff?.full_name || `${deactivatingStaff?.first_name} ${deactivatingStaff?.last_name}`}</strong>:
            </p>

            {/* Reason radio buttons */}
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">Deactivation Reason</legend>
              <div className="space-y-2">
                {DEACTIVATION_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-150
                      ${deactivationReason === reason.value
                        ? 'border-violet-500 bg-violet-50/50 ring-1 ring-violet-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                      ${reason.value === 'terminated'
                        ? 'data-[terminated=true]:border-red-400 data-[terminated=true]:bg-red-50/50'
                        : ''
                      }
                    `}
                    data-terminated={reason.value === 'terminated' ? 'true' : undefined}
                  >
                    <input
                      type="radio"
                      name="deactivation_reason"
                      value={reason.value}
                      checked={deactivationReason === reason.value}
                      onChange={() => {
                        setDeactivationReason(reason.value);
                        if (reason.value !== 'terminated') {
                          setShowTerminatedConfirm(false);
                        }
                      }}
                      className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{reason.label}</span>
                      {reason.value === 'terminated' && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Requires Confirmation
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Secondary confirmation for terminated */}
            {showTerminatedConfirm && deactivationReason === 'terminated' && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-800">Confirm Termination</p>
                    <p className="text-sm text-red-600 mt-1">
                      Are you sure you want to mark <strong>{deactivatingStaff?.full_name || `${deactivatingStaff?.first_name} ${deactivatingStaff?.last_name}`}</strong> as <strong>Terminated</strong>? This action will permanently deactivate their account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional notes */}
            <div>
              <label htmlFor="deactivation_notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                id="deactivation_notes"
                rows={3}
                value={deactivationNotes}
                onChange={(e) => setDeactivationNotes(e.target.value)}
                placeholder="Any additional details about this deactivation..."
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={handleCancelDeactivate}>
            Cancel
          </Button>
          <Button
            variant={deactivationReason === 'terminated' ? 'danger' : 'primary'}
            onClick={handleConfirmDeactivate}
          >
            {showTerminatedConfirm && deactivationReason === 'terminated'
              ? 'Yes, Confirm Termination'
              : 'Confirm Deactivation'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Import/Export Data Modal */}
      <Modal isOpen={showDataModal} onClose={handleCloseDataModal} size="lg">
        <div className="p-6">
          {showImportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowImportOptions(false)} className="flex items-center text-slate-600 hover:text-violet-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Import Staff</h2>
                <p className="text-slate-500 mt-2">Upload a file or download the sample template</p>
              </div>
              <div className="space-y-4">
                <button onClick={handleDownloadSample} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Download Sample Template</h3><p className="text-sm text-slate-500">Get a template file with the correct format</p></div>
                </button>
                <button onClick={handleImportClick} disabled={isImporting} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 flex items-center gap-4 disabled:opacity-50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">Upload File</h3><p className="text-sm text-slate-500">Select Excel or CSV file</p></div>
                </button>
              </div>
            </>
          ) : showExportOptions ? (
            <>
              <div className="flex items-center mb-6">
                <button onClick={() => setShowExportOptions(false)} className="flex items-center text-slate-600 hover:text-purple-600 transition-colors">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              </div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Export Staff</h2>
                <p className="text-slate-500 mt-2">Select your preferred export format</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => handleExportFormatSelect('csv')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">CSV</h3><p className="text-sm text-slate-500">Export as CSV</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('xlsx')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">XLSX</h3><p className="text-sm text-slate-500">Export as Excel</p></div>
                </button>
                <button onClick={() => handleExportFormatSelect('pdf')} className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  <div className="text-left"><h3 className="text-base font-semibold text-slate-700">PDF</h3><p className="text-sm text-slate-500">Export as PDF</p></div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Import / Export Data</h2>
                <p className="text-slate-500 mt-2">Choose an action to manage your staff data</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowImportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-violet-600">Import</h3>
                  <p className="text-sm text-slate-500 mt-1">Upload Excel or CSV</p>
                </button>
                <button onClick={() => setShowExportOptions(true)} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 group-hover:text-purple-600">Export</h3>
                  <p className="text-sm text-slate-500 mt-1">Download staff data</p>
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Deactivation History Modal */}
      <Modal isOpen={showDeactivationHistory} onClose={() => setShowDeactivationHistory(false)} size="lg">
        <ModalHeader
          title="Deactivation History"
          onClose={() => setShowDeactivationHistory(false)}
        />
        <ModalContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : deactivationHistory.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-gray-500">No deactivation history recorded</p>
              <p className="mt-1 text-xs text-gray-400">This staff member has no deactivation or reactivation records.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deactivationHistory.map((record: DeactivationRecord, index: number) => {
                const reasonInfo = record.deactivation_reason
                  ? DEACTIVATION_REASON_BADGES[record.deactivation_reason] || { label: record.deactivation_reason, style: 'bg-gray-100 text-gray-700' }
                  : null;

                return (
                  <div
                    key={record.id || index}
                    className="relative bg-white border border-slate-200 rounded-xl p-5 transition-all hover:border-slate-300 hover:shadow-sm"
                  >
                    {/* Timeline connector */}
                    {index < deactivationHistory.length - 1 && (
                      <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-slate-200" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="shrink-0 w-3 h-3 mt-1.5 rounded-full bg-violet-500 ring-4 ring-violet-100" />

                      <div className="flex-1 min-w-0">
                        {/* Header row: reason badge + dates */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          {reasonInfo && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${reasonInfo.style}`}>
                              {reasonInfo.label}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            Deactivated: {record.deactivated_at ? new Date(record.deactivated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </span>
                          <span className="text-xs text-slate-400">
                            Reactivated: {record.reactivated_at
                              ? new Date(record.reactivated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : <span className="text-amber-600 font-medium">Not yet reactivated</span>
                            }
                          </span>
                        </div>

                        {/* Deactivation notes */}
                        {record.deactivation_notes && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-slate-500 mb-1">Deactivation Notes</p>
                            <p className="text-sm text-gray-700 bg-slate-50 rounded-lg px-3 py-2">{record.deactivation_notes}</p>
                          </div>
                        )}

                        {/* Reactivation notes */}
                        {record.reactivation_notes && (
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">Reactivation Notes</p>
                            <p className="text-sm text-gray-700 bg-emerald-50 rounded-lg px-3 py-2">{record.reactivation_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeactivationHistory(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default StaffPage;
