/**
 * Animation Utilities - Task T072
 * Reusable animation functions and timing constants
 * Provides consistent animation timing across the application
 */

// Animation timing constants (in milliseconds)
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 200,
  slow: 300,
  slowest: 500,
} as const;

// Animation easing functions
export const ANIMATION_EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// Stagger animation helper
export function getStaggerDelay(index: number, baseDelay: number = 50, maxDelay: number = 500): number {
  return Math.min(index * baseDelay, maxDelay);
}

// Animation class generators
export function getFadeInClass(delay: number = 0): string {
  return `animate-fade-in${delay > 0 ? ` animation-delay-${delay}` : ''}`;
}

export function getFadeInUpClass(delay: number = 0): string {
  return `animate-fade-in-up${delay > 0 ? ` animation-delay-${delay}` : ''}`;
}

export function getScaleInClass(delay: number = 0): string {
  return `animate-scale-in${delay > 0 ? ` animation-delay-${delay}` : ''}`;
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Conditional animation class (respects reduced motion preference)
export function animateIf(animationClass: string): string {
  return prefersReducedMotion() ? '' : animationClass;
}

// Spring animation config for framer-motion (if added later)
export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// Transition config for smooth animations
export const transitionConfig = {
  default: {
    duration: ANIMATION_DURATION.normal / 1000, // Convert to seconds
    ease: [0.4, 0, 0.2, 1], // easeInOut
  },
  fast: {
    duration: ANIMATION_DURATION.fast / 1000,
    ease: [0, 0, 0.2, 1], // easeOut
  },
  slow: {
    duration: ANIMATION_DURATION.slow / 1000,
    ease: [0.4, 0, 0.2, 1], // easeInOut
  },
};

// Common animation variants for framer-motion (if added later)
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInRightVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

export const slideOutLeftVariants = {
  visible: { x: 0, opacity: 1 },
  hidden: { x: '-100%', opacity: 0 },
};

// Stagger children animation
export const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.05, // 50ms between each child
    },
  },
};
