"use client";

/**
 * Enhanced LoginForm Component
 * Features: Real-time validation, smooth animations, premium UI
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";
import { setAuthToken } from "@/lib/auth";
import type { AuthResponse, LoginCredentials } from "@/lib/types";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, Lock, CheckCircle, XCircle } from "lucide-react";
import { isValidEmail } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Real-time validation states
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validate email on blur
  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    if (!email) {
      setEmailError("Email is required");
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  };

  // Validate password on blur
  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    if (!password) {
      setPasswordError("Password is required");
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Final validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const credentials: LoginCredentials = {
        email: email.trim(),
        password,
      };

      const response = await apiPost<AuthResponse>("/api/auth/login", credentials);
      setAuthToken(response.access_token);

      // Show success animation
      setSuccess(true);

      // Redirect after brief delay for animation
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get("returnUrl") || "/dashboard";
        router.push(returnUrl);
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      // Shake animation on error
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12 animate-scale-in">
        <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success-600 dark:text-success-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          Welcome back!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Welcome back
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Sign in to continue to your tasks
        </p>
      </div>

      {/* Premium glassmorphic card */}
      <div className="glass rounded-2xl p-8 shadow-xl border border-zinc-200/50 dark:border-zinc-800/50">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl bg-error-50 dark:bg-error-900/30 border border-error-200 dark:border-error-800 animate-fade-in"
              style={{ animation: "shake 0.5s" }}
            >
              <XCircle className="h-5 w-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-error-800 dark:text-error-200 font-medium">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            id="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) handleEmailBlur();
            }}
            onBlur={handleEmailBlur}
            disabled={isSubmitting}
            error={touched.email ? emailError : ""}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) handlePasswordBlur();
            }}
            onBlur={handlePasswordBlur}
            disabled={isSubmitting}
            error={touched.password ? passwordError : ""}
            leftIcon={<Lock className="h-4 w-4" />}
            placeholder="Enter your password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            Sign in
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
