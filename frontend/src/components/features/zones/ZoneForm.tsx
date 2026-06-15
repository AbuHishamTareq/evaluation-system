import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { Zone, ZoneCreateInput } from '../../../types/zone';
import { ZONE_LEVEL_OPTIONS } from '../../../types/zone';

interface ZoneFormProps {
  zone?: Zone;
  onSubmit: (data: ZoneCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  parentZones?: Zone[];
}

export const ZoneForm: React.FC<ZoneFormProps> = ({
  zone,
  onSubmit,
  onCancel,
  isLoading = false,
  parentZones = [],
}) => {
  const [formData, setFormData] = useState<ZoneCreateInput>({
    name: zone?.name || '',
    code: zone?.code || '',
    level: zone?.level || 'region',
    parent_id: zone?.parent_id || null,
    description: zone?.description || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ZoneCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ZoneCreateInput, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    }
    if (!formData.level) {
      newErrors.level = 'Level is required';
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'parent_id' ? (value ? parseInt(value, 10) : null) : value,
    }));
    if (errors[name as keyof ZoneCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Build a set of all descendant IDs for the given zone (to prevent circular references)
  const getDescendantIds = (zoneId: number, allZones: Zone[]): Set<number> => {
    const descendants = new Set<number>();
    const collectDescendants = (parentId: number) => {
      allZones
        .filter((z) => z.parent_id === parentId)
        .forEach((child) => {
          descendants.add(child.id);
          collectDescendants(child.id);
        });
    };
    collectDescendants(zoneId);
    return descendants;
  };

  // Filter valid parent zones: exclude sub_district level, the zone itself, and all its descendants
  const excludedIds = zone?.id
    ? new Set([zone.id, ...getDescendantIds(zone.id, parentZones)])
    : new Set<number>();

  const parentOptions = parentZones
    .filter((z) => z.level !== 'sub_district' && !excludedIds.has(z.id))
    .map((z) => ({
      value: z.id,
      label: `${z.name} (${z.code})`,
    }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zone-name" required>Zone Name</Label>
          <Input
            id="zone-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter zone name"
            error={errors.name}
          />
        </div>
        
        <div>
          <Label htmlFor="zone-code" required>Zone Code</Label>
          <Input
            id="zone-code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., RE001"
            error={errors.code}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zone-level" required>Level</Label>
          <SearchableCombobox
            id="zone-level"
            value={formData.level}
            onChange={(val) => {
              setFormData((prev) => ({
                ...prev,
                level: val as ZoneCreateInput['level'],
              }));
              if (errors.level) {
                setErrors((prev) => ({ ...prev, level: undefined }));
              }
            }}
            options={ZONE_LEVEL_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            placeholder="Search levels..."
            error={errors.level}
            clearable={false}
            noSelectionLabel="Select level"
          />
        </div>

        {parentOptions.length > 0 && (
          <div>
            <Label htmlFor="zone-parent">Parent Zone (Optional)</Label>
            <SearchableCombobox
              id="zone-parent"
              value={formData.parent_id ?? null}
              onChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  parent_id: typeof val === 'number' ? val : typeof val === 'string' ? parseInt(val, 10) : null,
                }));
              }}
              options={parentOptions}
              placeholder="Search parent zones..."
              noSelectionLabel="No parent (root level)"
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="zone-description">Description (Optional)</Label>
        <Textarea
          id="zone-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Enter zone description"
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
          {zone ? 'Update Zone' : 'Create Zone'}
        </Button>
      </div>
    </form>
  );
};