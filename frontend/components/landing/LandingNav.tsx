'use client';

/**
 * LandingNav Component - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Navigation bar for landing page with logo and auth buttons.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/shared/Button';
import styles from '@/styles/components/LandingNav.module.css';

export default function LandingNav() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleSignUp = () => {
    router.push('/auth');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="6"
              fill="currentColor"
              opacity="0.2"
            />
            <path
              d="M10 16L14 20L22 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.brandName}>Advanced To-Do</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>
            Features
          </a>
          <a href="#about" className={styles.navLink}>
            About
          </a>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className={styles.authButtons}>
          <Button variant="ghost" size="sm" onClick={handleSignIn}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={handleSignUp}>
            Sign Up
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={isMenuOpen ? styles.menuIconOpen : styles.menuIcon}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <a href="#features" className={styles.mobileNavLink} onClick={toggleMenu}>
            Features
          </a>
          <a href="#about" className={styles.mobileNavLink} onClick={toggleMenu}>
            About
          </a>
          <div className={styles.mobileAuthButtons}>
            <Button variant="ghost" size="md" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button variant="primary" size="md" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
