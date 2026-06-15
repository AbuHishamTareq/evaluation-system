import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { EducationalDegree, EducationalDegreeCreateInput } from '../../../types/educationalDegree';

interface EducationalDegreeFormProps {
  degree?: EducationalDegree;
  onSubmit: (data: EducationalDegreeCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EducationalDegreeForm: React.FC<EducationalDegreeFormProps> = ({
  degree,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EducationalDegreeCreateInput>({
    name: degree?.name || '',
    description: degree?.description || null,
    is_active: degree?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EducationalDegreeCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EducationalDegreeCreateInput, string>> = {};

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

    if (errors[name as keyof EducationalDegreeCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="degree-name" required>Degree Name</Label>
        <Input
          id="degree-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Bachelor of Science in Nursing"
          error={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="degree-description">Description (Optional)</Label>
        <Textarea
          id="degree-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this degree"
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
          variant="primary"
          isLoading={isLoading}
        >
          {degree ? 'Update Degree' : 'Create Degree'}
        </Button>
      </div>
    </form>
  );
};

export default EducationalDegreeForm;
