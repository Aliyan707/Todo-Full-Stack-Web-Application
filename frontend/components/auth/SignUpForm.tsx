'use client';

/**
 * SignUpForm Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Sign-up form with validation and password strength indicator.
 */

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import styles from '@/styles/components/SignUpForm.module.css';

type PasswordStrength = 'weak' | 'medium' | 'strong';

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    displayName?: string;
    general?: string;
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak');

  const calculatePasswordStrength = (pass: string): PasswordStrength => {
    if (pass.length < 8) return 'weak';

    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    const strengthScore = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean)
      .length;

    if (strengthScore >= 4) return 'strong';
    if (strengthScore >= 2) return 'medium';
    return 'weak';
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Display name validation
    if (!displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.length > 100) {
      newErrors.displayName = 'Display name must be 100 characters or less';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await signUp({ email, password, displayName });
      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Sign up failed. Please try again.',
      });
    }
  };

  const getStrengthColor = (): string => {
    switch (passwordStrength) {
      case 'strong':
        return styles.strengthStrong;
      case 'medium':
        return styles.strengthMedium;
      case 'weak':
      default:
        return styles.strengthWeak;
    }
  };

  const getStrengthWidth = (): string => {
    switch (passwordStrength) {
      case 'strong':
        return '100%';
      case 'medium':
        return '66%';
      case 'weak':
      default:
        return '33%';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2 className={styles.heading}>Create Account</h2>
        <p className={styles.subheading}>Get started with your productivity journey</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="text"
            label="Display Name"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={errors.displayName}
            required
            autoComplete="name"
            disabled={isLoading}
          />

          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
            autoComplete="email"
            disabled={isLoading}
          />

          <div>
            <Input
              type="password"
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              error={errors.password}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
            {password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthBar}>
                  <div
                    className={`${styles.strengthFill} ${getStrengthColor()}`}
                    style={{ width: getStrengthWidth() }}
                  />
                </div>
                <span className={styles.strengthLabel}>
                  Password strength: <strong>{passwordStrength}</strong>
                </span>
              </div>
            )}
          </div>

          {errors.general && (
            <div className={styles.generalError} role="alert">
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <a href="/auth/login" className={styles.link}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
