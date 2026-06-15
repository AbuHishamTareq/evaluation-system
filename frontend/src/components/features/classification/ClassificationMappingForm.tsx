import React, { useState } from 'react';
import { Textarea } from '../../ui/forms/Textarea';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type {
  ClassificationMapping,
  ClassificationMappingCreateInput,
  Field,
  Specialty,
  Rank,
  Category,
} from '../../../types/classification';

interface ClassificationMappingFormProps {
  mapping?: ClassificationMapping;
  onSubmit: (data: ClassificationMappingCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  fields?: Field[];
  specialties?: Specialty[];
  ranks?: Rank[];
  categories?: Category[];
  onFieldChange?: (fieldId: number) => void;
}

export const ClassificationMappingForm: React.FC<ClassificationMappingFormProps> = ({
  mapping,
  onSubmit,
  onCancel,
  isLoading = false,
  fields = [],
  specialties = [],
  ranks = [],
  categories = [],
  onFieldChange,
}) => {
  const [formData, setFormData] = useState<ClassificationMappingCreateInput>({
    field_id: mapping?.field_id || 0,
    specialty_id: mapping?.specialty_id || 0,
    rank_id: mapping?.rank_id || 0,
    category_id: mapping?.category_id || 0,
    notes: mapping?.notes || null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ClassificationMappingCreateInput, string>>>({});

  // Filter specialties based on selected field
  const filteredSpecialties = formData.field_id
    ? specialties.filter((s) => s.field_id === formData.field_id)
    : specialties;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClassificationMappingCreateInput, string>> = {};

    if (!formData.field_id) {
      newErrors.field_id = 'Field is required';
    }
    if (!formData.specialty_id) {
      newErrors.specialty_id = 'Specialty is required';
    }
    if (!formData.rank_id) {
      newErrors.rank_id = 'Rank is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ClassificationMappingCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const fieldOptions = fields.map((f) => ({
    value: f.id,
    label: `${f.name}`,
  }));

  const specialtyOptions = filteredSpecialties.map((s) => ({
    value: s.id,
    label: `${s.name}`,
  }));

  const rankOptions = ranks.map((r) => ({
    value: r.id,
    label: `${r.name}`,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: `${c.code}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <SearchableCombobox
          id="mapping-field"
          label="Field"
          value={formData.field_id || null}
          onChange={(val) => {
            const newFieldId = val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : 0;
            setFormData((prev) => ({
              ...prev,
              field_id: newFieldId,
              specialty_id: 0, // Reset specialty when field changes
            }));
            if (errors.field_id) {
              setErrors((prev) => ({ ...prev, field_id: undefined }));
            }
            if (newFieldId) {
              onFieldChange?.(newFieldId);
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
        <SearchableCombobox
          id="mapping-specialty"
          label="Specialty"
          value={formData.specialty_id || null}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              specialty_id: val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : 0,
            }));
            if (errors.specialty_id) {
              setErrors((prev) => ({ ...prev, specialty_id: undefined }));
            }
          }}
          options={specialtyOptions}
          placeholder={formData.field_id ? 'Search specialties...' : 'Select a field first'}
          noSelectionLabel="Select a specialty"
          error={errors.specialty_id}
          required
          disabled={!formData.field_id}
        />
      </div>

      <div>
        <SearchableCombobox
          id="mapping-rank"
          label="Rank"
          value={formData.rank_id || null}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              rank_id: val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : 0,
            }));
            if (errors.rank_id) {
              setErrors((prev) => ({ ...prev, rank_id: undefined }));
            }
          }}
          options={rankOptions}
          placeholder="Search ranks..."
          noSelectionLabel="Select a rank"
          error={errors.rank_id}
          required
        />
      </div>

      <div>
        <SearchableCombobox
          id="mapping-category"
          label="Category"
          value={formData.category_id || null}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              category_id: val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : 0,
            }));
            if (errors.category_id) {
              setErrors((prev) => ({ ...prev, category_id: undefined }));
            }
          }}
          options={categoryOptions}
          placeholder="Search categories..."
          noSelectionLabel="Select a category"
          error={errors.category_id}
          required
        />
      </div>

      <div>
        <Label htmlFor="mapping-notes">Notes</Label>
        <Textarea
          id="mapping-notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
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
          {mapping ? 'Update Mapping' : 'Create Mapping'}
        </Button>
      </div>
    </form>
  );
};

export default ClassificationMappingForm;
