import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { useCenterStore } from '../../../stores';
import type { Department, DepartmentCreateInput } from '../../../types/department';

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: DepartmentCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { centers, fetchCenters } = useCenterStore();

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const [formData, setFormData] = useState<DepartmentCreateInput>({
    name: department?.name || '',
    description: department?.description || null,
    center_id: department?.center_id ?? null,
    is_active: department?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DepartmentCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof DepartmentCreateInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | null = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked ? '1' : '0';
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name as keyof DepartmentCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="department-name" required>Department Name</Label>
        <Input
          id="department-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Radiology Department"
          error={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="department-description">Description (Optional)</Label>
        <Textarea
          id="department-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this department"
          rows={3}
          error={errors.description}
        />
      </div>

      <div>
        <SearchableCombobox
          id="department-center"
          label="PHC Center"
          placeholder="Select a center..."
          value={formData.center_id ?? null}
          options={centers.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(val) => {
            const numVal = typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null;
            setFormData((prev) => ({ ...prev, center_id: numVal }));
          }}
          clearable
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {department ? 'Update Department' : 'Create Department'}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentForm;
