import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { ClinicAssignment, ClinicAssignmentCreateInput } from '../../../types/clinicAssignment';

interface ClinicAssignmentFormProps {
  assignment?: ClinicAssignment;
  onSubmit: (data: ClinicAssignmentCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClinicAssignmentForm: React.FC<ClinicAssignmentFormProps> = ({
  assignment,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ClinicAssignmentCreateInput>({
    name: assignment?.name || '',
    description: assignment?.description || null,
    is_active: assignment?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClinicAssignmentCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClinicAssignmentCreateInput, string>> = {};

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

    if (errors[name as keyof ClinicAssignmentCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="clinic-assignment-name" required>Clinic Assignment</Label>
        <Input
          id="clinic-assignment-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Morning Shift Assignment"
          error={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="clinic-assignment-description">Description (Optional)</Label>
        <Textarea
          id="clinic-assignment-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this clinic assignment"
          rows={3}
          error={errors.description}
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
          variant="gradient"
          gradient="from-blue-500 to-cyan-500"
          isLoading={isLoading}
        >
          {assignment ? 'Update Clinic Assignment' : 'Create Clinic Assignment'}
        </Button>
      </div>
    </form>
  );
};

export default ClinicAssignmentForm;
