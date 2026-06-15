import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { Field, FieldCreateInput } from '../../../types/classification';

interface FieldFormProps {
  field?: Field;
  onSubmit: (data: FieldCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const FieldForm: React.FC<FieldFormProps> = ({
  field,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FieldCreateInput>({
    name: field?.name || '',
    description: field?.description || null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FieldCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FieldCreateInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

    let processedValue: string | number | boolean | null = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = parseInt(value, 10) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name as keyof FieldCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="field-name" required>Name</Label>
        <Input
          id="field-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Nursing"
          error={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="field-description">Description</Label>
        <Textarea
          id="field-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this field"
          rows={3}
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
          {field ? 'Update Field' : 'Create Field'}
        </Button>
      </div>
    </form>
  );
};

export default FieldForm;
