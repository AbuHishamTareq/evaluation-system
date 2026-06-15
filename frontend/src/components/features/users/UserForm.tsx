import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/forms/Input';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import type { User, UserRole, UserCreateInput } from '../../../types/user';

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'evaluator', label: 'Evaluator' },
  { value: 'staff', label: 'Staff' },
];

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setEmployeeId(user.employee_id || '');
      setRole(user.role || 'staff');
      setIsActive(user.is_active ?? true);
      setPassword('');
      setPasswordConfirmation('');
    } else {
      setName('');
      setEmail('');
      setEmployeeId('');
      setRole('staff');
      setIsActive(true);
      setPassword('');
      setPasswordConfirmation('');
    }
    setErrors({});
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditing && !password) {
      newErrors.password = 'Password is required';
    }

    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== passwordConfirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: UserCreateInput = {
      name: name.trim(),
      email: email.trim(),
      role,
      employee_id: employeeId.trim() || undefined,
      is_active: isActive,
    };

    if (password) {
      data.password = password;
      data.password_confirmation = passwordConfirmation;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center ring-1 ring-violet-200/50">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {isEditing ? 'Edit User' : 'Create User'}
              </h3>
              <p className="text-sm text-slate-500">
                {isEditing ? 'Update user account details' : 'Create a new user account'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-purple-400" />
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Basic Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-name" required>Name</Label>
                <Input
                  id="user-name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  error={errors.name}
                />
              </div>
              <div>
                <Label htmlFor="user-email" required>Email</Label>
                <Input
                  id="user-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  error={errors.email}
                />
              </div>
              <div>
                <Label htmlFor="user-employee-id">Employee ID</Label>
                <Input
                  id="user-employee-id"
                  name="employee_id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g., EMP-001"
                />
              </div>
              <div>
                <SearchableCombobox
                  id="user-role"
                  label="Role"
                  placeholder="Select role"
                  value={role}
                  options={ROLE_OPTIONS}
                  onChange={(val) => setRole(val as UserRole)}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Password */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-400 to-blue-400" />
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {isEditing ? 'Change Password (leave blank to keep current)' : 'Password'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="user-password" required={!isEditing}>Password</Label>
                <Input
                  id="user-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
                  error={errors.password}
                />
              </div>
              <div>
                <Label htmlFor="user-password-confirmation">Confirm Password</Label>
                <Input
                  id="user-password-confirmation"
                  name="password_confirmation"
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Confirm password"
                  error={errors.password_confirmation}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-400" />
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Status</h4>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
              </label>
              <span className="text-sm font-medium text-slate-700">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" gradient="from-violet-500 to-purple-500" isLoading={isLoading}>
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
