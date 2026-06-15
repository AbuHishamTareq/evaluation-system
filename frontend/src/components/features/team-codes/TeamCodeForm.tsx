import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/forms/Input';
import { SearchableCombobox } from '../../ui/forms/SearchableCombobox';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { TeamCode, TeamCodeCreateInput } from '../../../types/teamCode';
import { TEAM_CODE_ROLE_OPTIONS } from '../../../types/teamCode';
import type { Center } from '../../../types/center';

interface TeamCodeFormProps {
  teamCode?: TeamCode;
  onSubmit: (data: TeamCodeCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  centers?: Center[];
}

export const TeamCodeForm: React.FC<TeamCodeFormProps> = ({
  teamCode,
  onSubmit,
  onCancel,
  isLoading = false,
  centers = [],
}) => {
  const [formData, setFormData] = useState<TeamCodeCreateInput>({
    code: teamCode?.code || '',
    description: teamCode?.description || null,
    role: teamCode?.role || null,
    is_active: teamCode?.is_active ?? true,
    center_id: teamCode?.center_id || null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TeamCodeCreateInput, string>>>({});

  useEffect(() => {
    setFormData({
      code: teamCode?.code || '',
      description: teamCode?.description || null,
      role: teamCode?.role || null,
      is_active: teamCode?.is_active ?? true,
      center_id: teamCode?.center_id || null,
    });
  }, [teamCode]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TeamCodeCreateInput, string>> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^TBC-\d{3}$/i.test(formData.code.trim())) {
      newErrors.code = 'Code must be in format TBC-XXX (e.g., TBC-001)';
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

    let processedValue: string | number | boolean | null = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name as keyof TeamCodeCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const centerOptions = centers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.code})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="team-code-code" required>Team Code</Label>
        <Input
          id="team-code-code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="e.g., TBC-001"
          error={errors.code}
          disabled={!!teamCode}
        />
        <p className="mt-1 text-xs text-gray-400">Format: TBC-XXX (e.g., TBC-001, TBC-042)</p>
      </div>

      <div>
        <Label htmlFor="team-code-description">Description (Optional)</Label>
        <Textarea
          id="team-code-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this team code purpose"
          rows={3}
          error={errors.description}
        />
      </div>

      <div>
        <SearchableCombobox
          id="team-code-role"
          label="Team Based Code Role"
          value={formData.role || null}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              role: val ? String(val) : null,
            }));
          }}
          options={TEAM_CODE_ROLE_OPTIONS}
          placeholder="Select a role..."
          noSelectionLabel="No role selected"
        />
      </div>

      <div>
        <SearchableCombobox
          id="team-code-center"
          label="Center (Optional)"
          value={formData.center_id || null}
          onChange={(val) => {
            setFormData((prev) => ({
              ...prev,
              center_id: val ? (typeof val === 'number' ? val : parseInt(String(val), 10)) : null,
            }));
            if (errors.center_id) {
              setErrors((prev) => ({ ...prev, center_id: undefined }));
            }
          }}
          options={centerOptions}
          placeholder="Search centers..."
          noSelectionLabel="No center (optional)"
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
          {teamCode ? 'Update Team Code' : 'Create Team Code'}
        </Button>
      </div>
    </form>
  );
};

export default TeamCodeForm;
