/**
 * Theme Constants - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * TypeScript exports for spacing scale, breakpoints, and z-index layers.
 * These constants mirror the CSS custom properties in globals.css.
 */

// Spacing scale (in rem)
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// Breakpoints (mobile-first)
export const breakpoints = {
  mobile: '375px',    // Small mobile
  tablet: '768px',    // Tablet portrait
  desktop: '1200px',  // Desktop
  wide: '1920px',     // Wide desktop
} as const;

// Media queries
export const media = {
  mobile: `@media (min-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 50,
  modalBackdrop: 100,
  modal: 110,
  tooltip: 120,
} as const;

// Dark green color palette (for TypeScript usage)
export const colors = {
  primary: '#1a5c47',
  primaryDark: '#0d4d3d',
  primaryLight: '#2d7a5f',
  accent: '#3d9970',
  accentHover: '#4db885',
  background: '#0a1a14',
  surface: '#1a2e26',
  text: '#e8f5f0',
  textMuted: '#a8c9bc',
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',
} as const;

// Animation durations
export const duration = {
  fast: 150,      // ms
  normal: 300,    // ms
  slow: 500,      // ms
} as const;

// Border radius
export const radius = {
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '1rem',     // 16px
} as const;

// Export types for TypeScript inference
export type Spacing = typeof spacing;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Colors = typeof colors;
export type Duration = typeof duration;
export type Radius = typeof radius;
