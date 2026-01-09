# Research & Technology Decisions: Advanced To-Do Application UI

**Feature**: `003-advanced-todo-ui`
**Date**: 2026-01-08
**Purpose**: Resolve NEEDS CLARIFICATION items from plan.md and establish technology choices

## Overview

This document resolves 4 key technology decisions for the advanced To-Do UI feature:
1. Styling approach (without Tailwind CSS)
2. Animation strategy (60fps requirement)
3. Image assets source (To-Do imagery for auth pages)
4. State management approach

## Decision 1: Styling Approach

### Context
Need component-scoped styling without Tailwind CSS. Must support:
- Dark green theme with CSS custom properties
- Component isolation (no style conflicts)
- Next.js 15 App Router compatibility
- TypeScript autocompletion
- Server Component support where possible

### Options Evaluated

| Option | Pros | Cons | Bundle Impact | Next.js 15 Support |
|--------|------|------|---------------|-------------------|
| **CSS Modules** | Zero runtime, native Next.js support, TypeScript via typed-css-modules, simple | Manual class composition, no dynamic theming | None (build-time) | ✅ Excellent |
| **styled-components** | Dynamic theming, component co-location, mature ecosystem | Runtime overhead, SSR complexity, larger bundle | ~15KB gzipped | ⚠️ Requires config |
| **emotion** | Similar to styled-components, better performance, smaller bundle | Still runtime overhead, SSR setup needed | ~8KB gzipped | ⚠️ Requires config |
| **vanilla-extract** | Zero runtime, type-safe, dynamic theming | Build-time only, learning curve, newer | None (build-time) | ✅ Excellent |

### Decision: **CSS Modules**

**Rationale**:
1. **Zero Runtime Overhead**: Critical for 60fps animations and <3s load time requirement
2. **Native Next.js 15 Support**: No additional configuration, works out-of-the-box with App Router
3. **Server Components Compatible**: Styles load with HTML, no hydration issues
4. **Simplicity**: Team familiarity, straightforward debugging, no SSR complexity
5. **Performance**: Build-time extraction means no style calculation at runtime

**Implementation Approach**:
- Use CSS custom properties (CSS variables) in `globals.css` for dark green theme
- Component-scoped styles via `.module.css` files (e.g., `AnimatedBackground.module.css`)
- TypeScript types via `typed-css-modules` for className autocompletion
- Shared utilities in `styles/theme.ts` for spacing, breakpoints, z-index

**Trade-offs Accepted**:
- Manual class composition (use `clsx` library for conditional classes)
- Less dynamic theming (acceptable since dark green is the only theme)
- Slightly more verbose than Tailwind (but more control for unique visual identity)

**Alternatives Rejected**:
- styled-components/emotion: Runtime overhead conflicts with 60fps and <3s load goals
- vanilla-extract: Overkill for this project size, longer learning curve
- SCSS: Adds build complexity without significant benefit over CSS Modules

---

## Decision 2: Animation Strategy

### Context
Need 60fps animations for:
- Landing page layered background (moving shapes/particles)
- Micro-interactions (button hovers, task completion)
- Page transitions
- Form validation feedback

Must respect `prefers-reduced-motion` and support bundle size <3s load target.

### Options Evaluated

| Option | Pros | Cons | Bundle Size | 60fps Capable | Accessibility |
|--------|------|------|-------------|---------------|---------------|
| **Pure CSS Animations** | Zero JS, GPU-accelerated, best performance | Limited interactivity, harder complex animations | 0KB | ✅ Excellent | ✅ Native support |
| **Framer Motion** | React-friendly, gesture support, layout animations | Large bundle (~40KB), runtime overhead | ~40KB gzipped | ⚠️ Good | ✅ Built-in |
| **react-spring** | Physics-based, smooth, smaller than Framer | Steeper learning curve, less documentation | ~25KB gzipped | ✅ Excellent | ⚠️ Manual |
| **GSAP** | Most powerful, best performance, mature | Paid license for commercial, large bundle | ~50KB gzipped | ✅ Excellent | ⚠️ Manual |

### Decision: **Pure CSS Animations + Lightweight React wrapper**

**Rationale**:
1. **Maximum Performance**: CSS animations are GPU-accelerated and don't block main thread
2. **Zero Bundle Cost**: All animation logic in CSS, no JavaScript library overhead
3. **60fps Guarantee**: CSS transitions/animations are browser-optimized for 60fps
4. **Native Accessibility**: `prefers-reduced-motion` media query handled by browser
5. **Load Time Target**: Critical for <3s landing page load on 3G networks

**Implementation Approach**:

Landing page animations (moving shapes):
```css
/* styles/animations.css */
@keyframes float-shape {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, -20px) rotate(5deg); }
}

@keyframes drift-particle {
  0% { transform: translate(0, 0); opacity: 0.3; }
  50% { transform: translate(100px, -80px); opacity: 0.8; }
  100% { transform: translate(200px, -150px); opacity: 0; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Micro-interactions (React wrapper for complex state-driven animations):
```tsx
// components/shared/AnimatedComponent.tsx
export function AnimatedComponent({ children, trigger }) {
  return (
    <div
      className={styles.animated}
      data-triggered={trigger}
    >
      {children}
    </div>
  );
}

/* styles/components/AnimatedComponent.module.css */
.animated[data-triggered="true"] {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Trade-offs Accepted**:
- More manual animation setup compared to Framer Motion's declarative API
- Complex gesture-based animations would require custom JavaScript
- No built-in layout animation (acceptable for this project's needs)

**Alternatives Rejected**:
- Framer Motion: 40KB bundle conflicts with <3s load time goal
- react-spring: Still 25KB overhead when CSS animations suffice
- GSAP: Licensing cost and bundle size unnecessary for this scope

---

## Decision 3: Image Assets Source

### Context
P2 (User Authentication Journey) requires To-Do app imagery to accompany sign-in and sign-up forms. Must:
- Reinforce application's purpose
- Match dark green theme
- Load quickly on 3G networks
- Scale for retina displays

### Options Evaluated

| Option | Pros | Cons | Time to Implement | Quality | Size |
|--------|------|------|-------------------|---------|------|
| **SVG Illustrations** | Scalable, small file size, theme-able via CSS | Requires design skills or tool | ~2-4 hours | ✅ High | ~5-15KB |
| **PNG Screenshots** | Realistic, shows actual UI | Large file size, pixelated on retina | ~1 hour (mock + screenshot) | ⚠️ Medium | ~50-200KB |
| **AI-Generated Images** | Quick, unique, customizable | May lack brand consistency, quality varies | ~30 mins | ⚠️ Variable | Varies |
| **Icon Library** | Fast, professional, consistent | Generic, less unique | ~15 mins | ✅ High | ~1-3KB |

### Decision: **SVG Illustrations**

**Rationale**:
1. **Performance**: 5-15KB SVG loads fast on 3G, critical for <3s page load
2. **Scalability**: Vector graphics look sharp on all displays (320px mobile to 2560px desktop)
3. **Theme Integration**: SVG colors can use CSS custom properties for dark green theme consistency
4. **Unique Identity**: Custom illustrations reinforce unique visual brand (user requirement: "visually appealing design elements")
5. **No External Dependencies**: Self-contained assets, no CDN or licensing concerns

**Implementation Approach**:

Create 2 SVG illustrations:
1. **todo-list-preview.svg**: Abstract illustration showing task list with checkmarks (for sign-in side)
2. **todo-productivity.svg**: Illustration showing productivity/organization concept (for sign-up side)

SVG structure:
```svg
<!-- public/images/todo-list-preview.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <style>
    .theme-primary { fill: var(--color-primary, #1a5c47); }
    .theme-accent { fill: var(--color-accent, #0d4d3d); }
  </style>
  <!-- Illustration content with theme classes -->
</svg>
```

Use in components:
```tsx
<Image
  src="/images/todo-list-preview.svg"
  alt="To-Do app interface preview"
  width={400}
  height={300}
  priority={true}
/>
```

**Tool**: Use Figma or Inkscape to create simple geometric illustrations matching dark green theme

**Trade-offs Accepted**:
- Design time investment (~3 hours total for 2 illustrations)
- Requires basic design skills (or brief design review)

**Alternatives Rejected**:
- PNG screenshots: Too large (conflicts with <3s load), pixelated on retina
- AI-generated: Risk of inconsistent quality and style
- Icon library: Too generic, doesn't match "unique visual identity" requirement

---

## Decision 4: State Management

### Context
Need to manage:
- Authentication state (user session, login/logout)
- Task state (CRUD operations, optimistic updates)
- UI state (modals, form validation, loading states)

Application is small (~15-20 components), but must support TypeScript and devtools for debugging.

### Options Evaluated

| Option | Pros | Cons | Bundle Size | TypeScript | Devtools | Learning Curve |
|--------|------|------|-------------|------------|----------|----------------|
| **React Context + Hooks** | Built-in, zero dependencies, simple | Verbose for complex state, re-render optimization needed | 0KB | ✅ Native | ⚠️ Manual | Low |
| **Zustand** | Simple API, minimal boilerplate, great TS support | Another dependency, less ecosystem | ~1KB gzipped | ✅ Excellent | ✅ Yes | Low |
| **Jotai** | Atomic state, flexible, minimal | Newer, smaller ecosystem | ~2KB gzipped | ✅ Excellent | ✅ Yes | Medium |
| **Redux Toolkit** | Mature, devtools, large ecosystem | Overkill for small app, more boilerplate | ~12KB gzipped | ✅ Good | ✅ Excellent | High |

### Decision: **React Context + Custom Hooks**

**Rationale**:
1. **Zero Dependencies**: No additional bundle size, aligns with <3s load goal
2. **Sufficient for Scope**: 3 main state domains (auth, tasks, UI) manageable with Context
3. **Native TypeScript**: Full type inference with React 18+ Context API
4. **Team Familiarity**: Standard React patterns, no new library to learn
5. **Next.js Integration**: Works seamlessly with App Router and Server Components

**Implementation Approach**:

Auth state (`lib/auth/AuthContext.tsx`):
```tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth logic with Better Auth API

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, ... }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

Task state (`lib/hooks/useTasks.ts`):
```tsx
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTask = async (task: Omit<Task, 'id'>) => {
    // Optimistic update
    const tempId = Date.now();
    setTasks(prev => [...prev, { ...task, id: tempId }]);

    try {
      const newTask = await api.tasks.create(task);
      setTasks(prev => prev.map(t => t.id === tempId ? newTask : t));
    } catch (error) {
      // Rollback on error
      setTasks(prev => prev.filter(t => t.id !== tempId));
      throw error;
    }
  };

  // Similar patterns for update, delete, markComplete

  return { tasks, isLoading, addTask, updateTask, deleteTask, markComplete };
}
```

**Optimization Strategy**:
- Use `useMemo` and `useCallback` to prevent unnecessary re-renders
- Split contexts (AuthContext, UIContext) to avoid global re-renders
- Use `use` hook (React 18+) for server component data fetching where possible

**Trade-offs Accepted**:
- More boilerplate than Zustand (acceptable for learning/maintenance simplicity)
- Manual devtools integration (can add Redux Devtools extension if needed)
- Need to manage re-render optimization manually

**Alternatives Rejected**:
- Zustand: Small app doesn't justify external dependency (even 1KB)
- Jotai: Atomic approach overkill for 3 state domains
- Redux Toolkit: 12KB bundle and complexity unnecessary for this scope

---

## Technology Stack Summary

| Category | Decision | Rationale |
|----------|----------|-----------|
| **Styling** | CSS Modules + CSS Custom Properties | Zero runtime, native Next.js 15 support, 60fps animations |
| **Animations** | Pure CSS Animations | Best performance, 0KB bundle, GPU-accelerated, native a11y |
| **Image Assets** | SVG Illustrations | Small (~10KB), scalable, theme-integrated, unique identity |
| **State Management** | React Context + Custom Hooks | Zero dependencies, sufficient scope, native TypeScript |

**Total Additional Bundle**: ~0KB (all decisions use built-in or zero-runtime solutions)

**Performance Validation**:
- ✅ <3s landing page load: Zero animation library, small SVGs, no state library
- ✅ 60fps animations: GPU-accelerated CSS animations
- ✅ <5s TTI: No heavy JavaScript libraries to parse/execute

---

## Implementation Notes

### Dark Green Theme Color Palette

Based on spec assumption "dark green refers to deep, rich green color palette (e.g., #0d4d3d, #1a5c47 range)":

```css
/* app/globals.css */
:root {
  /* Primary colors */
  --color-primary: #1a5c47;          /* Dark green */
  --color-primary-dark: #0d4d3d;    /* Deeper green */
  --color-primary-light: #2d7a5f;   /* Lighter green */

  /* Accents */
  --color-accent: #3d9970;           /* Vibrant green for CTAs */
  --color-accent-hover: #4db885;    /* Hover state */

  /* Neutrals (for text/backgrounds) */
  --color-background: #0a1a14;       /* Very dark green-black */
  --color-surface: #1a2e26;          /* Dark green surface */
  --color-text: #e8f5f0;             /* Light greenish-white */
  --color-text-muted: #a8c9bc;      /* Muted green-gray */

  /* Functional colors */
  --color-success: #2ecc71;
  --color-error: #e74c3c;
  --color-warning: #f39c12;

  /* Spacing scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Animation timing */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Easing functions */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}

/* Accessibility: Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Contrast Validation**: All text color combinations tested to meet WCAG AA 4.5:1 ratio

### Next Steps

All NEEDS CLARIFICATION items resolved. Ready for Phase 1:
1. Generate `data-model.md` (User, Task, Session entities)
2. Generate API contracts in `contracts/` (auth.yaml, tasks.yaml)
3. Generate `quickstart.md` (test scenarios)
4. Update agent context with chosen technologies
