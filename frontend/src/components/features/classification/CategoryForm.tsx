import React, { useState } from 'react';
import { Input } from '../../ui/forms/Input';
import { Textarea } from '../../ui/forms/Textarea';
import { Button } from '../../ui/buttons/Button';
import { Label } from '../../ui/forms/Label';
import type { Category, CategoryCreateInput } from '../../../types/classification';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryCreateInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CategoryCreateInput>({
    code: category?.code || '',
    name: category?.name || '',
    description: category?.description || null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryCreateInput, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CategoryCreateInput, string>> = {};

    if (!formData.code!.trim()) {
      newErrors.code = 'Code is required';
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

    if (errors[name as keyof CategoryCreateInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category-name" required>Code</Label>
        <Input
          id="category-name"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="e.g., Category A"
          error={errors.code}
        />
      </div>

      <div>
        <Label htmlFor="category-description">Description</Label>
        <Textarea
          id="category-description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe this category"
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
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
