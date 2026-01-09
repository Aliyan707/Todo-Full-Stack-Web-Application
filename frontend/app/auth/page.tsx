/**
 * Authentication Page - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Split-screen authentication page with sign-in (left) and sign-up (right).
 */

import { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import TodoImagery from '@/components/auth/TodoImagery';

export const metadata: Metadata = {
  title: 'Sign In | Sign Up - Advanced To-Do App',
  description: 'Sign in to your account or create a new account to start organizing your tasks.',
};

export default function AuthPage() {
  return (
    <AuthLayout
      leftContent={
        <>
          <SignInForm />
          <TodoImagery />
        </>
      }
      rightContent={
        <>
          <SignUpForm />
          <TodoImagery />
        </>
      }
    />
  );
}
