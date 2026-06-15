import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input } from '../../components/ui/forms/Input';
import { Button } from '../../components/ui/buttons/Button';
import { Card } from '../../components/ui/cards/Card';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../components/ui/modals';
import { useToast } from '../../components/ui/toast';
import { useRoleStore } from '../../stores/roleStore';
import apiClient from '../../api/client';
import API_ENDPOINTS from '../../api/endpoints';
import type { Role, Permission } from '../../types/role';
import type { User } from '../../types/user';
import { useAuthStore } from '../../stores/authStore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface GroupedPermissions {
  [group: string]: Permission[];
}

/**
 * Group permissions by their module prefix (e.g., "staff", "centers", "evaluations").
 * The prefix is the part before the first dot.
 */
function groupPermissions(permissions: Permission[]): GroupedPermissions {
  const groups: GroupedPermissions = {};
  for (const perm of permissions) {
    const groupName = perm.name.includes('.') ? perm.name.split('.')[0] : 'other';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(perm);
  }
  // Sort groups alphabetically
  const sorted: GroupedPermissions = {};
  Object.keys(groups)
    .sort()
    .forEach((key) => {
      sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
  return sorted;
}

/**
 * Convert a permission name like "staff.create" into a user-friendly label like "Create Staff".
 */
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

/**
 * Capitalize first letter of a string.
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

// ─── Dropdown Item ───────────────────────────────────────────────────────────

interface DropdownItemProps {
  role: Role;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (role: Role) => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  role,
  isSelected,
  isHighlighted,
  onClick,
}) => {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={`
        group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500'
          : isHighlighted
            ? 'bg-slate-50'
            : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onClick(role)}
    >
      <div
        className={`
          shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm
          transition-colors duration-200
          ${isSelected
            ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/20'
            : 'bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
            {role.name}
          </span>
          {role.users_count !== undefined && role.users_count > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {role.users_count} user{role.users_count !== 1 ? 's' : ''}
            </span>
          )}
          {role.users_count === 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-400">
              Unused
            </span>
          )}
        </div>
        {role.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{role.description}</p>
        )}
      </div>
    </div>
  );
};

// ─── Permission Checkbox ─────────────────────────────────────────────────────

interface PermissionCheckboxProps {
  permission: Permission;
  checked: boolean;
  onChange: (permissionId: number, checked: boolean) => void;
}

const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  permission,
  checked,
  onChange,
}) => {
  const id = `perm-${permission.id}`;
  return (
    <label
      htmlFor={id}
      className={`
        flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150
        ${checked
          ? 'border-indigo-200 bg-indigo-50/50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
        }
      `}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(permission.id, e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-slate-800">
          {permissionLabel(permission.name)}
        </span>
        <span className="block text-xs text-slate-400 font-mono mt-0.5">{permission.name}</span>
        {permission.description && (
          <span className="block text-xs text-slate-500 mt-1">{permission.description}</span>
        )}
      </div>
    </label>
  );
};

// ─── Role Detail Panel ───────────────────────────────────────────────────────

interface RoleDetailPanelProps {
  role: Role;
  allPermissions: Permission[];
  selectedPermissionIds: number[];
  onPermissionChange: (permissionId: number, checked: boolean) => void;
  onSavePermissions: () => void;
  onUpdateRole: (data: { name: string; description?: string | null }) => void;
  onDeleteRole: () => void;
  savingPermissions: boolean;
  hasPerm: (perm: string) => boolean;
}

const RoleDetailPanel: React.FC<RoleDetailPanelProps> = ({
  role,
  allPermissions,
  selectedPermissionIds,
  onPermissionChange,
  onSavePermissions,
  onUpdateRole,
  onDeleteRole,
  savingPermissions,
  hasPerm,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(role.name);
  const [editDescription, setEditDescription] = useState(role.description || '');

  const groupedPermissions = groupPermissions(allPermissions);

  const handleSaveRole = () => {
    onUpdateRole({
      name: editName,
      description: editDescription || null,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(role.name);
    setEditDescription(role.description || '');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <Card variant="outlined" padding="md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                    Role Name
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter role description"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleSaveRole}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800">{role.name}</h2>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                    {role.guard_name}
                  </span>
                </div>
                {role.description && (
                  <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span>Users: {role.users_count ?? 0}</span>
                  <span>Permissions: {role.permissions?.length ?? 0}</span>
                  <span>Created: {new Date(role.created_at).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!isEditing && (
              <>
                {hasPerm('roles.edit') && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
                {hasPerm('roles.delete') && (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    }
                    onClick={onDeleteRole}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Permissions Section */}
      <Card variant="outlined" padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Permissions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedPermissionIds.length} of {allPermissions.length} permissions selected
            </p>
          </div>
          {hasPerm('roles.assign_permissions') && (
            <Button
              variant="gradient"
              gradient="from-indigo-500 to-blue-500"
              size="sm"
              onClick={onSavePermissions}
              disabled={savingPermissions}
            >
              {savingPermissions ? 'Saving...' : 'Save Permissions'}
            </Button>
          )}
        </div>

        {/* Group Select All */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              allPermissions.forEach((p) => {
                if (!selectedPermissionIds.includes(p.id)) {
                  onPermissionChange(p.id, true);
                }
              });
            }}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              allPermissions.forEach((p) => {
                if (selectedPermissionIds.includes(p.id)) {
                  onPermissionChange(p.id, false);
                }
              });
            }}
          >
            Deselect All
          </Button>
        </div>

        {Object.keys(groupedPermissions).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No permissions available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([group, perms]) => {
              const groupAllSelected = perms.every((p) => selectedPermissionIds.includes(p.id));
              const groupSomeSelected = perms.some((p) => selectedPermissionIds.includes(p.id));

              return (
                <div key={group}>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      {capitalize(group)}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newState = !groupAllSelected;
                        perms.forEach((p) => onPermissionChange(p.id, newState));
                      }}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                        groupAllSelected
                          ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          : groupSomeSelected
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {groupAllSelected ? 'All selected' : groupSomeSelected ? 'Partial' : 'Select all'}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {perms.map((perm) => (
                      <PermissionCheckbox
                        key={perm.id}
                        permission={perm}
                        checked={selectedPermissionIds.includes(perm.id)}
                        onChange={onPermissionChange}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Users Section ───────────────────────────────────────────────────────────

interface UsersSectionProps {
  _roleId: number;
  users: User[];
  loading?: boolean;
  onAssignUsers: () => void;
  onRemoveUser: (userId: string | number) => void;
}

const UsersSection: React.FC<UsersSectionProps> = ({ users, loading = false, onAssignUsers, onRemoveUser }) => {
  return (
    <Card variant="outlined" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Users</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {users.length} user{users.length !== 1 ? 's' : ''} assigned to this role
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
          onClick={onAssignUsers}
        >
          Assign Users
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <svg className="w-10 h-10 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="mt-2 text-sm text-slate-500">
            No users assigned to this role
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Assign Users" to add users to this role
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              {/* Avatar initial circle */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveUser(user.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove user from role"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ─── Assign Users Modal ──────────────────────────────────────────────────────

interface AssignUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: number;
  onAssigned: () => void;
}

const AssignUsersModal: React.FC<AssignUsersModalProps> = ({
  isOpen,
  onClose,
  roleId,
  onAssigned,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isOpen || !roleId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const [usersResponse, assignedResponse] = await Promise.all([
        apiClient.get<{ data: User[] }>(API_ENDPOINTS.users.list),
        apiClient.get<{ data: User[] }>(API_ENDPOINTS.roles.getUsers(roleId)),
      ]);
      const users = usersResponse.data || [];
      const assigned = assignedResponse.data || [];
      const assignedIds = assigned.map((u) => u.id);
      setAllUsers(users);
      setSelectedIds(assignedIds);
    } catch (err: any) {
      setFetchError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [isOpen, roleId]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSearchQuery('');
    }
  }, [isOpen, fetchData]);

  const filteredUsers = allUsers.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const toggleUser = (userId: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!roleId) return;
    setSaving(true);
    try {
      await apiClient.put(API_ENDPOINTS.roles.syncUsers(roleId), {
        user_ids: selectedIds,
      });
      onAssigned();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save user assignments';
      setFetchError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader title="Assign Users" onClose={onClose} />
      <ModalContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="mt-3 text-sm text-red-600">{fetchError}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchData}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>

            {/* Users list */}
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-10 h-10 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">
                  {searchQuery ? 'No users match your search' : 'No users found'}
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  return (
                    <label
                      key={user.id}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150
                        ${isSelected
                          ? 'border-indigo-200 bg-indigo-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-slate-800 truncate">
                          {user.name}
                        </span>
                        <span className="block text-xs text-slate-400 truncate">
                          {user.email}
                        </span>
                      </div>
                      {isSelected && (
                        <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Selection summary */}
            <div className="mt-3 text-xs text-slate-400 text-center">
              {selectedIds.length} of {allUsers.length} user{allUsers.length !== 1 ? 's' : ''} selected
            </div>
          </>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          gradient="from-indigo-500 to-blue-500"
          onClick={handleSave}
          disabled={loading || !!fetchError || saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// ─── Roles Page ──────────────────────────────────────────────────────────────

export const RolesPage: React.FC = () => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const {
    roles,
    allPermissions,
    isLoading,
    error,
    pagination,
    fetchRoles,
    fetchAllPermissions,
    createRole,
    updateRole,
    deleteRole,
    syncRolePermissions,
    clearError,
  } = useRoleStore();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Track selected permission IDs for the current role
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  // Users assigned to the selected role
  const [selectedRoleUsers, setSelectedRoleUsers] = useState<User[]>([]);
  const [loadingRoleUsers, setLoadingRoleUsers] = useState(false);

  const loadRoles = useCallback(async (page: number = 1, search?: string) => {
    await fetchRoles({ page, per_page: 100, search: (search ?? searchQuery) || undefined });
  }, [fetchRoles, searchQuery]);

  const fetchRoleUsers = useCallback(async (roleId: number) => {
    setLoadingRoleUsers(true);
    try {
      const response = await apiClient.get<{ data: User[] }>(API_ENDPOINTS.roles.getUsers(roleId));
      setSelectedRoleUsers(response.data || []);
    } catch {
      setSelectedRoleUsers([]);
    } finally {
      setLoadingRoleUsers(false);
    }
  }, []);

  const handleRemoveUser = async (userId: string | number) => {
    if (!selectedRole) return;
    try {
      const remainingIds = selectedRoleUsers
        .filter((u) => u.id !== userId)
        .map((u) => u.id);
      await apiClient.put(API_ENDPOINTS.roles.syncUsers(selectedRole.id), {
        user_ids: remainingIds,
      });
      setSelectedRoleUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast('User removed from role', 'success');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove user';
      addToast(message, 'error');
    }
  };

  useEffect(() => {
    loadRoles(1);
    fetchAllPermissions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a role is selected, populate selectedPermissionIds from its permissions
  useEffect(() => {
    if (selectedRole?.permissions) {
      setSelectedPermissionIds(selectedRole.permissions.map((p) => p.id));
    } else {
      setSelectedPermissionIds([]);
    }
  }, [selectedRole]);

  // When a role is selected, fetch its assigned users
  useEffect(() => {
    if (selectedRole) {
      fetchRoleUsers(selectedRole.id);
    } else {
      setSelectedRoleUsers([]);
    }
  }, [selectedRole, fetchRoleUsers]);

  const filteredRoles = roles;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHighlightedIndex(-1);
    loadRoles(1, searchQuery);
    setDropdownOpen(true);
  };

  const handleSelect = (role: Role) => {
    setSelectedRole(role);
    setDropdownOpen(false);
    setSearchQuery(role.name);
  };

  const handleClearSelection = () => {
    setSelectedRole(null);
    setSearchQuery('');
    loadRoles(1, '');
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredRoles.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredRoles[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      const newRole = await createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || null,
      });
      addToast('Role created successfully', 'success');
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setSelectedRole(newRole);
      setSearchQuery(newRole.name);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create role';
      addToast(message, 'error');
    }
  };

  const handleUpdateRole = async (data: { name: string; description?: string | null }) => {
    if (!selectedRole) return;
    try {
      const updated = await updateRole(selectedRole.id, data);
      setSelectedRole(updated);
      addToast('Role updated successfully', 'success');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update role';
      addToast(message, 'error');
    }
  };

  const handleDeleteRoleConfirm = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      addToast('Role deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedRole(null);
      setSearchQuery('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete role';
      addToast(message, 'error');
    }
  };

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setSelectedPermissionIds((prev) => {
      if (checked) {
        return prev.includes(permissionId) ? prev : [...prev, permissionId];
      }
      return prev.filter((id) => id !== permissionId);
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSavingPermissions(true);
    try {
      await syncRolePermissions(selectedRole.id, selectedPermissionIds);
      addToast('Permissions saved successfully', 'success');
      // Reload the selected role to get updated permissions
      const updatedRole = await useRoleStore.getState().fetchRole(selectedRole.id);
      if (updatedRole) setSelectedRole(updatedRole);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save permissions';
      addToast(message, 'error');
    } finally {
      setSavingPermissions(false);
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Left Panel — Roles List */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Roles
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {pagination.total} role{pagination.total !== 1 ? 's' : ''} found
            </p>
          </div>
          {hasPermission('roles.create') && (
            <Button
              variant="gradient"
              gradient="from-indigo-500 to-blue-500"
              size="sm"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              onClick={() => setShowCreateModal(true)}
            >
              Add Role
            </Button>
          )}
        </div>

        {/* Search */}
        <div ref={dropdownRef} className="relative">
          <form onSubmit={handleSearch}>
            <Input
              placeholder="Search roles..."
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
          </form>

          {dropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <svg className="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery ? 'No roles match your search' : 'No roles found'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {searchQuery ? 'Try a different search term' : 'Create a new role to get started'}
                  </p>
                </div>
              ) : (
                <div role="listbox" className="py-1">
                  {filteredRoles.map((role, index) => (
                    <DropdownItem
                      key={role.id}
                      role={role}
                      isSelected={selectedRole?.id === role.id}
                      isHighlighted={index === highlightedIndex}
                      onClick={handleSelect}
                    />
                  ))}
                </div>
              )}

              {!isLoading && filteredRoles.length > 0 && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                  <span>{filteredRoles.length} result{filteredRoles.length !== 1 ? 's' : ''}</span>
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

        {/* Role Cards — always show the full list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading && roles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">No roles yet</h3>
              <p className="mt-1 text-xs text-gray-500">
                Create a role to get started with access control
              </p>
            </div>
          ) : (
            roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role);
                  setSearchQuery(role.name);
                }}
                className="w-full text-left"
              >
                <DropdownItem
                  role={role}
                  isSelected={selectedRole?.id === role.id}
                  isHighlighted={false}
                  onClick={() => {}}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel — Role Details */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={clearError} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {selectedRole ? (
          <div className="space-y-6">
            <RoleDetailPanel
              role={selectedRole}
              allPermissions={allPermissions}
              selectedPermissionIds={selectedPermissionIds}
              onPermissionChange={handlePermissionChange}
              onSavePermissions={handleSavePermissions}
              onUpdateRole={handleUpdateRole}
              onDeleteRole={() => setShowDeleteModal(true)}
              savingPermissions={savingPermissions}
              hasPerm={hasPermission}
            />
            <UsersSection
              _roleId={selectedRole.id}
              users={selectedRoleUsers}
              loading={loadingRoleUsers}
              onAssignUsers={() => setShowAssignModal(true)}
              onRemoveUser={handleRemoveUser}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-600">Select a Role</h3>
              <p className="mt-1 text-sm text-slate-400">
                Search and select a role from the left panel to manage its permissions
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader title="Create Role" onClose={() => setShowCreateModal(false)} />
        <ModalContent>
          <p className="text-sm text-slate-500 mb-4">
            Add a new role for access control
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                Role Name
              </label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g., supervisor"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Optional description of this role"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              gradient="from-indigo-500 to-blue-500"
              onClick={handleCreateRole}
              disabled={!newRoleName.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalHeader title="Delete Role" onClose={() => setShowDeleteModal(false)} />
        <ModalContent>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>?
            This action cannot be undone.
          </p>
          {selectedRole && selectedRole.users_count && selectedRole.users_count > 0 && (
            <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              This role is currently assigned to {selectedRole.users_count} user
              {selectedRole.users_count !== 1 ? 's' : ''}. Deleting it will remove the role
              from those users.
            </p>
          )}
        </ModalContent>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRoleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Role'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Assign Users Modal */}
      <AssignUsersModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        roleId={selectedRole?.id ?? 0}
        onAssigned={() => {
          if (selectedRole) fetchRoleUsers(selectedRole.id);
        }}
      />
    </div>
  );
};

export default RolesPage;
