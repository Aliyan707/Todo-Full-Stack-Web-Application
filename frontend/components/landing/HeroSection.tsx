'use client';

/**
 * HeroSection Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Hero section with heading, subheading, and CTA buttons.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import styles from '@/styles/components/HeroSection.module.css';

export default function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth');
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          Organize Your Life <span className={styles.accent}>with Style</span>
        </h1>

        <p className={styles.subheading}>
          A modern, visually unique to-do application with a stunning dark green theme.
          Stay productive, stay organized, and enjoy every moment.
        </p>

        <div className={styles.ctaGroup}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetStarted}
            aria-label="Get started with Advanced To-Do App"
          >
            Get Started
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSignIn}
            aria-label="Sign in to your account"
          >
            Sign In
          </Button>
        </div>

        <p className={styles.features}>
          ✨ Dynamic Animations • 🎨 Beautiful Design • 🚀 Lightning Fast
        </p>
      </div>
    </section>
  );
}
