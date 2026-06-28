import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from './Input';
import { Label } from './Label';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ComboboxOption {
  value: string | number | boolean | null;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface SearchableComboboxProps {
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean | null) => void;
  options: ComboboxOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  clearable?: boolean;
  noSelectionLabel?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  label,
  error,
  disabled = false,
  clearable = true,
  noSelectionLabel = 'None',
  id,
  required,
  className = '',
}) => {
  // Derive display text from current value
  const getDisplayText = useCallback((): string => {
    if (value === null || value === '') return '';
    const searchValue = typeof value === 'string' ? value.trim() : value;
    const selected = options.find((o) => o.value === searchValue);
    return selected ? selected.label : '';
  }, [value, options]);

  const [search, setSearch] = useState(getDisplayText);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync search text when value changes externally
  useEffect(() => {
    const displayText = getDisplayText();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(displayText);
  }, [value, getDisplayText]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered options based on search
  // When dropdown is closed or search matches a selected value, show all options
  // Only filter when user has typed something different from the selected value
  const filteredOptions = (() => {
    if (!search) return options;
    // If search matches the selected option's label exactly, show all options
    const selectedOption = options.find((o) => {
      const v = typeof value === 'string' ? value.trim() : value;
      return o.value === v;
    });
    if (selectedOption && search.toLowerCase() === selectedOption.label.toLowerCase()) {
      return options;
    }
    // Otherwise filter by search
    return options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );
  })();

  // Build the full option list with "None" at the top if clearable
  const displayOptions: (ComboboxOption | { value: null; label: string; isNoneOption: true })[] = clearable
    ? [{ value: null, label: noSelectionLabel, isNoneOption: true as const }, ...filteredOptions]
    : filteredOptions;

  const handleSelect = (option: ComboboxOption | { value: null; label: string; isNoneOption: true }) => {
    onChange(option.value);
    setDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    onChange(null);
    setSearch('');
    setDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (inputValue: string) => {
    setSearch(inputValue);
    setDropdownOpen(true);
    setHighlightedIndex(-1);
    // Don't clear selection on keystroke - only change on explicit select
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, displayOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(displayOptions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false);
    }
  };

  const isSelected = (optionValue: string | number | boolean | null): boolean => {
    if (typeof value === 'string' && typeof optionValue === 'string') {
      return value.trim() === optionValue.trim();
    }
    return value === optionValue;
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <div ref={dropdownRef} className="relative">
        <Input
          ref={inputRef}
          id={id}
          placeholder={placeholder}
          value={search}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          rightIcon={
            clearable && search ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )
          }
        />

        {/* Dropdown List */}
        {dropdownOpen && (
          <div
            role="listbox"
            aria-label={label || 'Select an option'}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 max-h-60 overflow-y-auto"
          >
            {displayOptions.length === 0 ? (
              <div className="text-center py-6 px-4">
                <svg className="w-8 h-8 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  {search ? 'No options match your search' : 'No options available'}
                </p>
              </div>
            ) : (
              <div className="py-1">
                {displayOptions.map((option, index) => {
                  const isNoneOption = 'isNoneOption' in option;
                  const selected = isSelected(option.value);
                  const highlighted = index === highlightedIndex;

                  return (
                    <div
                      key={isNoneOption ? 'none' : String(option.value)}
                      role="option"
                      aria-selected={selected}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150
                        ${selected
                          ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500'
                          : highlighted
                            ? 'bg-slate-50'
                            : 'hover:bg-slate-50'
                        }
                      `}
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {/* Icon or placeholder */}
                      {!isNoneOption && (
                        <>
                          {option.icon ? (
                            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center">
                              {option.icon}
                            </div>
                          ) : (
                            <div className={`
                              shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                              transition-colors duration-200
                              ${selected
                                ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500'
                              }
                            `}>
                              {option.label.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </>
                      )}

                      {isNoneOption && (
                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}

                      {/* Option info */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm ${selected ? 'text-teal-700 font-medium' : 'text-gray-900'}`}>
                          {option.label}
                        </span>
                        {(option as { description?: string }).description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{(option as { description?: string }).description}</p>
                        )}
                      </div>

                      {/* Selected checkmark */}
                      {selected && (
                        <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {displayOptions.length > 0 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>{displayOptions.length} option{displayOptions.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↑↓</kbd>
                  navigate
                  <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">↵</kbd>
                  select
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchableCombobox;
