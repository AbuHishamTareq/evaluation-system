// Validation utilities

export const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const isPhone = (value: string): boolean => {
  const phoneRegex = /^[\d\s\-+()]+$/;
  return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
};

export const isUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const isStrongPassword = (value: string): boolean => {
  return (
    value.length >= 8 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(value)
  );
};

export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

export const isAlpha = (value: string): boolean => {
  return /^[a-zA-Z]+$/.test(value);
};

export const isAlphaNumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

// Required validator
export const required = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') {
    return 'This field is required';
  }
  return undefined;
};

// Email validator
export const email = (value: string): string | undefined => {
  if (!value) return undefined;
  return isEmail(value) ? undefined : 'Please enter a valid email address';
};

// Phone validator
export const phone = (value: string): string | undefined => {
  if (!value) return undefined;
  return isPhone(value) ? undefined : 'Please enter a valid phone number';
};

// Min length validator
export const minLength = (min: number) => (value: string): string | undefined => {
  if (!value) return undefined;
  return value.length >= min ? undefined : `Must be at least ${min} characters`;
};

// Max length validator
export const maxLength = (max: number) => (value: string): string | undefined => {
  if (!value) return undefined;
  return value.length <= max ? undefined : `Must be no more than ${max} characters`;
};

// Range validator for numbers
export const range = (min: number, max: number) => (value: number): string | undefined => {
  if (value === null || value === undefined) return undefined;
  return value >= min && value <= max ? undefined : `Must be between ${min} and ${max}`;
};

// Pattern validator
export const pattern = (regex: RegExp, message: string) => (value: string): string | undefined => {
  if (!value) return undefined;
  return regex.test(value) ? undefined : message;
};

// Combine multiple validators
export const composeValidators = (...validators: ((value: unknown) => string | undefined)[]) => {
  return (value: unknown): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return undefined;
  };
};

// Form validation helper
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateForm = (
  data: Record<string, unknown>,
  rules: Record<string, ((value: unknown) => string | undefined)[]>
): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const field in rules) {
    const value = data[field];
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};