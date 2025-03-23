
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

export interface ValidationErrors {
  [field: string]: string[];
}

export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = data[field];
    const fieldErrors: string[] = [];

    fieldRules.forEach(rule => {
      // Check required
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.push(rule.message);
        return;
      }

      // Skip other validations if value is empty and not required
      if (!value && !rule.required) return;

      // Check min length
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        fieldErrors.push(rule.message);
        return;
      }

      // Check max length
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        fieldErrors.push(rule.message);
        return;
      }

      // Check pattern
      if (rule.pattern && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message);
        return;
      }

      // Check custom validator
      if (rule.validator && !rule.validator(value)) {
        fieldErrors.push(rule.message);
        return;
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return errors;
};

export const isFormValid = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};

// Common validation rules
export const commonValidationRules = {
  email: [
    { required: true, message: 'Email is required' },
    { 
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
      message: 'Please enter a valid email address' 
    }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 8, message: 'Password must be at least 8 characters' }
  ],
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' }
  ],
  phone: [
    { 
      pattern: /^[0-9+\-\s()]{10,15}$/, 
      message: 'Please enter a valid phone number' 
    }
  ],
  required: [
    { required: true, message: 'This field is required' }
  ]
};
