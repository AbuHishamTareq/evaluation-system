import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { Center, CenterCreateInput } from '../../../types/center';
import { CENTER_CLASSIFICATION_OPTIONS } from '../../../types/center';
import type { Zone } from '../../../types/zone';

interface CenterFormProps {
  center?: Center;
  onSubmit: (data: CenterCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  zones?: Zone[];
}

export const CenterForm: React.FC<CenterFormProps> = ({
  center,
  onSubmit,
  onCancel,
  isLoading = false,
  zones = [],
}) => {
  const [formData, setFormData] = useState<CenterCreateInput>({
    name: center?.name || '',
    code: center?.code || '',
    zone_id: center?.zone_id || 0,
    classification: center?.classification || 'primary',
    address: center?.address || '',
    phone: center?.phone || '',
    email: center?.email || '',
    is_active: center?.is_active ?? true,
    notes: center?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CenterCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CenterCreateInput, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (!formData.zone_id) {
      newErrors.zone_id = 'Zone is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number | boolean | null = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name as keyof CenterCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="center-name" required>Center Name</Label>
          <Input
            id="center-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter center name"
            error={errors.name}
          />
        </div>

        <div>
          <Label htmlFor="center-code" required>Center Code</Label>
          <Input
            id="center-code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., PHC001"
            error={errors.code}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="center-zone" required>Zone</Label>
          <SearchableCombobox
            id="center-zone"
            value={formData.zone_id || null}
            onChange={(val) => {
              setFormData((prev) => ({
                ...prev,
                zone_id: typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null,
              }));
              if (errors.zone_id) {
                setErrors((prev) => ({ ...prev, zone_id: undefined }));
              }
            }}
            options={zones.map((z) => ({
              value: z.id,
              label: `${z.name} (${z.code})`,
              description: z.description || undefined,
            }))}
            placeholder="Search zones..."
            error={errors.zone_id}
            noSelectionLabel="No zone"
          />
        </div>

        <div>
          <Label htmlFor="center-classification" required>Classification</Label>
          <SearchableCombobox
            id="center-classification"
            value={formData.classification}
            onChange={(val) => {
              setFormData((prev) => ({
                ...prev,
                classification: val as CenterCreateInput['classification'],
              }));
              if (errors.classification) {
                setErrors((prev) => ({ ...prev, classification: undefined }));
              }
            }}
            options={CENTER_CLASSIFICATION_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            placeholder="Search classifications..."
            error={errors.classification}
            clearable={false}
            noSelectionLabel="Select classification"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="center-address" required>Address</Label>
        <Textarea
          id="center-address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter full address"
          rows={2}
          error={errors.address}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="center-phone">Phone</Label>
          <Input
            id="center-phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="e.g., +966501234567"
          />
        </div>

        <div>
          <Label htmlFor="center-email">Email</Label>
          <Input
            id="center-email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="e.g., center@example.com"
            error={errors.email}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="center-notes">Notes (Optional)</Label>
        <Textarea
          id="center-notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          placeholder="Additional notes about this center"
          rows={2}
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
          {center ? 'Update Center' : 'Create Center'}
        </Button>
      </div>
    </form>
  );
};

export default CenterForm;