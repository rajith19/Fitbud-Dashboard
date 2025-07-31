// src/utils/__tests__/validation.test.ts

import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateFullName,
  validateRole,
  validateAuthForm,
  hasFormErrors,
  sanitizeInput,
  validateBlockReason,
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should return undefined for valid emails', () => {
      expect(validateEmail('test@example.com')).toBeUndefined();
      expect(validateEmail('user.name+tag@domain.co.uk')).toBeUndefined();
    });

    it('should return error for invalid emails', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail('invalid-email')).toBe('Please enter a valid email address');
      expect(validateEmail('test@')).toBe('Please enter a valid email address');
    });
  });

  describe('validatePassword', () => {
    it('should return undefined for valid passwords', () => {
      expect(validatePassword('Password123!')).toBeUndefined();
      expect(validatePassword('MySecure@Pass1')).toBeUndefined();
    });

    it('should return error for invalid passwords', () => {
      expect(validatePassword('')).toBe('Password is required');
      expect(validatePassword('short')).toBe('Password must be at least 8 characters long');
      expect(validatePassword('password123')).toBe(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should return undefined when passwords match', () => {
      expect(validatePasswordConfirmation('password', 'password')).toBeUndefined();
    });

    it('should return error when passwords do not match', () => {
      expect(validatePasswordConfirmation('password1', 'password2')).toBe('Passwords do not match');
      expect(validatePasswordConfirmation('password', '')).toBe('Please confirm your password');
    });
  });

  describe('validateFullName', () => {
    it('should return undefined for valid names', () => {
      expect(validateFullName('John Doe')).toBeUndefined();
      expect(validateFullName('Jane Smith-Johnson')).toBeUndefined();
    });

    it('should return error for invalid names', () => {
      expect(validateFullName('')).toBe('Full name is required');
      expect(validateFullName('A')).toBe('Full name must be at least 2 characters long');
      expect(validateFullName('A'.repeat(101))).toBe('Full name must be less than 100 characters');
    });
  });

  describe('validateRole', () => {
    it('should return undefined for valid roles', () => {
      expect(validateRole('admin')).toBeUndefined();
      expect(validateRole('moderator')).toBeUndefined();
      expect(validateRole('user')).toBeUndefined();
    });

    it('should return error for invalid roles', () => {
      expect(validateRole('')).toBe('Role is required');
      expect(validateRole('invalid')).toBe('Please select a valid role');
    });
  });

  describe('validateAuthForm', () => {
    it('should validate sign-in form correctly', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      
      const errors = validateAuthForm(validData, false);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate sign-up form correctly', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        full_name: 'John Doe',
      };
      
      const errors = validateAuthForm(validData, true);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return errors for invalid sign-up data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
        full_name: 'A',
      };
      
      const errors = validateAuthForm(invalidData, true);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
      expect(errors.full_name).toBeDefined();
    });
  });

  describe('hasFormErrors', () => {
    it('should return true when errors exist', () => {
      const errors = { email: 'Invalid email', password: 'Weak password' };
      expect(hasFormErrors(errors)).toBe(true);
    });

    it('should return false when no errors exist', () => {
      const errors = {};
      expect(hasFormErrors(errors)).toBe(false);
    });

    it('should return false when all errors are undefined', () => {
      const errors = { email: undefined, password: undefined };
      expect(hasFormErrors(errors)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags and trim input', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>  ')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('  Normal text  ')).toBe('Normal text');
    });

    it('should limit input length', () => {
      const longInput = 'A'.repeat(1500);
      const sanitized = sanitizeInput(longInput);
      expect(sanitized.length).toBe(1000);
    });
  });

  describe('validateBlockReason', () => {
    it('should return undefined for valid reasons', () => {
      expect(validateBlockReason('')).toBeUndefined();
      expect(validateBlockReason('Spam behavior')).toBeUndefined();
    });

    it('should return error for too long reasons', () => {
      const longReason = 'A'.repeat(501);
      expect(validateBlockReason(longReason)).toBe('Block reason must be less than 500 characters');
    });
  });
});
