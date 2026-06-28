import React, { useEffect, useState, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Card, CardContent } from '../../components/ui/cards/Card';
import { useRoleStore } from '../../stores/roleStore';
import type { Permission } from '../../types/role';

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface GroupedPermissions {
  [group: string]: Permission[];
}

function groupPermissions(permissions: Permission[]): GroupedPermissions {
  const groups: GroupedPermissions = {};
  for (const perm of permissions) {
    const groupName = perm.name.includes('.') ? perm.name.split('.')[0] : 'other';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(perm);
  }
  const sorted: GroupedPermissions = {};
  Object.keys(groups)
    .sort()
    .forEach((key) => {
      sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
  return sorted;
}

function permissionLabel(name: string): string {
  const parts = name.split('.');
  if (parts.length < 2) return name;
  const action = parts.pop()!;
  const subject = parts.join(' ');
  const actionLabel = action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const subjectLabel = subject
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return `${actionLabel} ${subjectLabel}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

// ─── Permissions Page ────────────────────────────────────────────────────────

export const PermissionsPage: React.FC = () => {
  const allPermissions = useRoleStore((s) => s.allPermissions);
  const isLoading = useRoleStore((s) => s.isLoading);
  const error = useRoleStore((s) => s.error);
  const fetchAllPermissions = useRoleStore((s) => s.fetchAllPermissions);
  const clearError = useRoleStore((s) => s.clearError);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllPermissions();
  }, [fetchAllPermissions]);

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

  const groupedPermissions = groupPermissions(allPermissions);

  const filteredGroups = Object.entries(groupedPermissions).reduce<GroupedPermissions>(
    (acc, [group, perms]) => {
      const filtered = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (filtered.length > 0) {
        acc[group] = filtered;
      }
      return acc;
    },
    {}
  );

  const totalPermissions = allPermissions.length;

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, allPermissions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      setSearchQuery(allPermissions[highlightedIndex].name);
      setDropdownOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Permissions
          </h1>
          <p className="text-slate-500 mt-1">
            {totalPermissions} permission{totalPermissions !== 1 ? 's' : ''} — Read-only view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div ref={dropdownRef} className="relative">
            <Input
              ref={inputRef}
              placeholder="Search permissions..."
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
              className="w-64"
            />

            {dropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                  </div>
                ) : allPermissions.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">
                      {searchQuery ? 'No permissions match your search' : 'No permissions found'}
                    </p>
                  </div>
                ) : (
                  <div role="listbox" className="py-1">
                    {allPermissions.map((perm, index) => {
                      const groupName = perm.name.includes('.') ? perm.name.split('.')[0] : 'other';
                      return (
                        <div
                          key={perm.id}
                          role="option"
                          onClick={() => {
                            setSearchQuery(perm.name);
                            setDropdownOpen(false);
                            setHighlightedIndex(-1);
                          }}
                          className={`
                            group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
                            ${index === highlightedIndex ? 'bg-amber-50' : 'hover:bg-amber-50'}
                          `}
                        >
                          <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-900">
                                {perm.name.split('.').pop()!.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} {groupName !== 'other' ? groupName.replace(/_/g, ' ') : ''}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                {groupName}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 font-mono">{perm.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isLoading && allPermissions.length > 0 && (
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                    <span>{allPermissions.length} result{allPermissions.length !== 1 ? 's' : ''}</span>
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
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">Read-only view</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Permissions are managed via the <code className="bg-amber-100 px-1 py-0.5 rounded">php artisan permissions:sync</code> command.
            This page provides a read-only reference of all available permissions in the system.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      )}

      {/* Permissions List */}
      {!isLoading && Object.keys(filteredGroups).length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {searchQuery ? 'No permissions match your search' : 'No permissions found'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Run php artisan permissions:sync to populate permissions'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && Object.keys(filteredGroups).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filteredGroups).map(([group, perms]) => (
            <Card key={group} variant="outlined" padding="md">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">{capitalize(group)}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {perms.length} permission{perms.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
                        Permission Key
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
                        Label
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {perms.map((perm) => (
                      <tr key={perm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <code className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                            {perm.name}
                          </code>
                        </td>
                        <td className="py-2.5 px-3 text-sm text-slate-700 font-medium">
                          {permissionLabel(perm.name)}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-slate-500">
                          {perm.description || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
