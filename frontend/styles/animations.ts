/**
 * Animation Definitions - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Shared animation definitions and timing functions.
 * These constants are used with CSS Modules for consistent animations.
 */

// Timing functions (cubic-bezier)
export const easingFunctions = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// Animation durations (in milliseconds)
export const animationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Common animation properties
export const animations = {
  // Fade in animation
  fadeIn: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },

  // Slide up animation
  slideUp: {
    from: {
      transform: 'translateY(10px)',
      opacity: 0,
    },
    to: {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },

  // Scale in animation
  scaleIn: {
    from: {
      transform: 'scale(0.95)',
      opacity: 0,
    },
    to: {
      transform: 'scale(1)',
      opacity: 1,
    },
  },

  // Pulse animation (for loading states)
  pulse: {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
} as const;

// Animation delays for staggered animations
export const staggerDelays = {
  short: 100,   // ms
  medium: 200,  // ms
  long: 300,    // ms
} as const;

// Utility function to create a CSS animation string
export function createAnimation(
  name: string,
  duration: number,
  timingFunction: string = easingFunctions.easeInOut,
  delay: number = 0
): string {
  return `${name} ${duration}ms ${timingFunction} ${delay}ms`;
}

// Utility function to create transition string
export function createTransition(
  properties: string[],
  duration: number = animationDurations.normal,
  timingFunction: string = easingFunctions.easeInOut
): string {
  return properties.map(prop => `${prop} ${duration}ms ${timingFunction}`).join(', ');
}

// Export types
export type EasingFunctions = typeof easingFunctions;
export type AnimationDurations = typeof animationDurations;
export type Animations = typeof animations;
export type StaggerDelays = typeof staggerDelays;
