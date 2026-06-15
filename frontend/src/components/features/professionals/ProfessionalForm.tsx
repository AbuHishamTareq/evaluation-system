import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { Professional, ProfessionalCreateInput } from '../../../types/professional';

interface ProfessionalFormProps {
  professional?: Professional;
  onSubmit: (data: ProfessionalCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({
  professional,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ProfessionalCreateInput>({
    name: professional?.name || '',
    description: professional?.description || null,
    is_active: professional?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfessionalCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProfessionalCreateInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role Name is required';
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

    if (errors[name as keyof ProfessionalCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="professional-name" required>Role Name</Label>
        <Input
          id="professional-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Doctor, Nurse, Technician"
          error={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="professional-description">Description (Optional)</Label>
        <Textarea
          id="professional-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this professional role"
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
          gradient="from-rose-500 to-orange-500"
          isLoading={isLoading}
        >
          {professional ? 'Update Professional Role' : 'Create Professional Role'}
        </Button>
      </div>
    </form>
  );
};

export default ProfessionalForm;
