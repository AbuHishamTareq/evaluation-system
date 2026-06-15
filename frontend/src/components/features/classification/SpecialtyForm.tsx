import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { Specialty, SpecialtyCreateInput, Field } from '../../../types/classification';

interface SpecialtyFormProps {
  specialty?: Specialty;
  onSubmit: (data: SpecialtyCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  fields?: Field[];
}

export const SpecialtyForm: React.FC<SpecialtyFormProps> = ({
  specialty,
  onSubmit,
  onCancel,
  isLoading = false,
  fields = [],
}) => {
  const [formData, setFormData] = useState<SpecialtyCreateInput>({
    name: specialty?.name || '',
    field_id: specialty?.field_id || 0,
    description: specialty?.description || null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SpecialtyCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SpecialtyCreateInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.field_id) {
      newErrors.field_id = 'Field is required';
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

    if (errors[name as keyof SpecialtyCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const fieldOptions = fields.map((f) => ({
    value: f.id,
    label: `${f.name}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <SearchableCombobox
          id="specialty-field"
          label="Field"
          value={formData.field_id || null}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              field_id: val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : 0,
            }));
            if (errors.field_id) {
              setErrors((prev) => ({ ...prev, field_id: undefined }));
            }
          }}
          options={fieldOptions}
          placeholder="Search fields..."
          noSelectionLabel="Select a field"
          error={errors.field_id}
          required
        />
      </div>

      <div>
        <Label htmlFor="specialty-name" required>Name</Label>
        <Input
          id="specialty-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Pediatric Nursing"
          error={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="specialty-description">Description</Label>
        <Textarea
          id="specialty-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this specialty"
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
          {specialty ? 'Update Specialty' : 'Create Specialty'}
        </Button>
      </div>
    </form>
  );
};

export default SpecialtyForm;
