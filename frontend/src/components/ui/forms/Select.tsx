import React from 'react';
import { SearchableCombobox } from './SearchableCombobox';

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps {
  options: Option[];
  error?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number | boolean | null) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  error,
  placeholder,
  value,
  onChange,
  disabled,
  required,
  id,
  className = '',
}) => {
  return (
    <div>
      <SearchableCombobox
        value={value ?? null}
        onChange={(val) => onChange?.(val)}
        options={options.map(opt => ({ value: opt.value, label: opt.label }))}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        required={required}
        id={id}
        className={className}
        clearable={false}
      />
    </div>
  );
};

export default Select;