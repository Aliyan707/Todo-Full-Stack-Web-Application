# Advanced To-Do Application - Frontend

A modern, visually unique To-Do web application with dynamic animations and a dark green theme. Built with Next.js 15, TypeScript, and pure CSS Modules (no Tailwind CSS).

## Overview

This is the frontend for the Advanced To-Do Application, featuring:
- **Dynamic Animated Landing Page**: Layered moving shapes and animations with a dark green color theme
- **Split-Screen Authentication**: Sign In (left) and Sign Up (right) forms with To-Do app imagery
- **Clean Dashboard**: User-friendly task management interface aligned with the unique theme
- **No Styling Frameworks**: Pure CSS Modules for zero runtime overhead and full design control

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x (strict mode enabled)
- **Styling**: CSS Modules with custom dark green theme
- **Animations**: Pure CSS animations (60fps GPU-accelerated)
- **UI Library**: React 18+ with React Context for state management
- **Authentication**: Better Auth with JWT tokens
- **API Communication**: Fetch API with custom client wrapper
- **Runtime**: Node.js 18+

## Color Palette

The application uses a cohesive dark green color scheme:

| Color              | Hex Code  | Usage                          |
|--------------------|-----------|--------------------------------|
| Primary            | `#1a5c47` | Main brand color               |
| Primary Dark       | `#0d4d3d` | Hover states, depth            |
| Primary Light      | `#2d7a5f` | Highlights, accents            |
| Accent             | `#3d9970` | CTAs, active states            |
| Accent Hover       | `#4db885` | Button hover states            |
| Background         | `#0a1a14` | Page background                |
| Surface            | `#1a2e26` | Cards, panels                  |
| Text               | `#e8f5f0` | Primary text                   |
| Text Muted         | `#a8c9bc` | Secondary text                 |
| Border             | `#2d5548` | Input borders, dividers        |
| Success            | `#48c774` | Success messages               |
| Error              | `#e74c3c` | Error messages                 |
| Warning            | `#f39c12` | Warning messages               |
| Info               | `#3498db` | Info messages                  |

## Features

### Phase 1: Landing Page (P1)
- Dynamic animated background with layered moving shapes
- Dark green color theme throughout
- Smooth fade-in and scale animations
- Navigation to Sign In / Sign Up
- Responsive design (mobile-first)

### Phase 2: Authentication (P1)
- Split-screen layout: Sign In (left) + Sign Up (right)
- To-Do app imagery/illustrations accompanying forms
- Real-time form validation with error messages
- JWT token management and secure storage
- Password strength indicator
- "Remember me" and "Forgot password" functionality
- Smooth transitions between auth states

### Phase 3: Dashboard (P1)
- Clean, user-friendly task management interface
- Task CRUD operations (Create, Read, Update, Delete)
- Task completion toggle with visual feedback
- Optimistic UI updates for instant feedback
- Empty state with helpful onboarding
- Logout functionality
- Responsive grid layout

### Phase 4: Polish & Enhancements (P2/P3)
- Accessibility features (WCAG AA compliance)
- Reduced motion support for accessibility
- Loading states and skeleton screens
- Toast notifications for actions
- Keyboard shortcuts for power users
- Task search and filtering
- Sorting options (date, completion status)

## Project Structure

```
frontend/
├── app/                          # Next.js 15 App Router
│   ├── page.tsx                  # Landing page with animated background
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Sign In page (left side)
│   │   └── signup/
│   │       └── page.tsx          # Sign Up page (right side)
│   ├── dashboard/
│   │   └── page.tsx              # Task management dashboard
│   ├── layout.tsx                # Root layout with metadata
│   └── globals.css               # Global styles with CSS variables
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # Sign In form component
│   │   ├── SignupForm.tsx        # Sign Up form component
│   │   └── AuthGuard.tsx         # Route protection wrapper
│   ├── landing/
│   │   ├── AnimatedBackground.tsx    # Dynamic background shapes
│   │   ├── Hero.tsx                  # Landing hero section
│   │   └── Navigation.tsx            # Landing navigation
│   ├── dashboard/
│   │   ├── TaskList.tsx          # Task list container
│   │   ├── TaskItem.tsx          # Individual task card
│   │   ├── TaskInput.tsx         # Create task input
│   │   ├── TaskFilters.tsx       # Filter/sort controls
│   │   └── EmptyState.tsx        # No tasks state
│   └── ui/
│       ├── Button.tsx            # Reusable button component
│       ├── Input.tsx             # Reusable input component
│       ├── Card.tsx              # Reusable card component
│       └── Toast.tsx             # Toast notification system
│
├── lib/
│   ├── api/
│   │   ├── client.ts             # Base API client with JWT
│   │   ├── auth.ts               # Authentication API calls
│   │   └── tasks.ts              # Task API calls
│   ├── hooks/
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useTasks.ts           # Task management hook
│   │   └── useToast.ts           # Toast notifications hook
│   └── contexts/
│       ├── AuthContext.tsx       # Authentication context
│       └── TaskContext.tsx       # Task management context
│
├── types/
│   ├── user.ts                   # User & auth types
│   ├── task.ts                   # Task types
│   └── api.ts                    # API response types
│
├── styles/
│   ├── theme.ts                  # Theme constants (colors, spacing)
│   └── animations.ts             # Animation utilities
│
├── public/
│   ├── images/                   # To-Do app imagery
│   └── icons/                    # App icons
│
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000` (or set `NEXT_PUBLIC_API_URL`)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Commands

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Build for Production

```bash
npm run build
npm start
```

The production build will be optimized with:
- Server-side rendering (SSR)
- Static generation where possible
- Automatic code splitting
- Image optimization
- CSS minification
- Compression enabled

## Development Guidelines

### CSS Modules Usage

All component styles use CSS Modules for scoped styling:

```typescript
// Component.tsx
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>Content</div>;
}
```

```css
/* Component.module.css */
.container {
  padding: var(--space-md);
  background: var(--color-surface);
  border-radius: 8px;
  transition: transform var(--duration-normal) var(--ease-in-out);
}

.container:hover {
  transform: translateY(-2px);
}
```

### Theme Variables

Use CSS custom properties defined in `globals.css`:

- **Colors**: `var(--color-primary)`, `var(--color-accent)`, etc.
- **Spacing**: `var(--space-xs)` to `var(--space-3xl)`
- **Durations**: `var(--duration-fast)`, `var(--duration-normal)`, `var(--duration-slow)`
- **Easings**: `var(--ease-in-out)`, `var(--ease-out)`, `var(--ease-in)`

### TypeScript Constants

Import theme constants from `styles/theme.ts`:

```typescript
import { colors, spacing, breakpoints } from '@/styles/theme';

// Use in inline styles or dynamic calculations
const style = {
  padding: spacing.md,
  backgroundColor: colors.primary,
};
```

### Animation Utilities

Use animation helpers from `styles/animations.ts`:

```typescript
import { createTransition, easingFunctions } from '@/styles/animations';

// Generate CSS transition strings
const transition = createTransition(['opacity', 'transform'], 300, easingFunctions.easeOut);
```

## API Integration

### Base API URL

Set the backend API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Access it in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### Authentication Flow

1. **Sign Up**: POST `/api/auth/register` → Returns JWT token
2. **Sign In**: POST `/api/auth/login` → Returns JWT token
3. **Store Token**: Save to localStorage/sessionStorage
4. **Authenticated Requests**: Include `Authorization: Bearer <token>` header
5. **Token Expiry**: Handle 401 responses by redirecting to login

### Task Management

- **List Tasks**: GET `/api/tasks` (with filters: `completed`, `limit`, `offset`, `sort`)
- **Create Task**: POST `/api/tasks` (body: `{ title, description? }`)
- **Update Task**: PATCH `/api/tasks/:id` (body: `{ title?, description?, isCompleted? }`)
- **Delete Task**: DELETE `/api/tasks/:id`

### Error Handling

The API returns standardized error responses:

```typescript
{
  "error": "Validation Error",
  "message": "Title is required",
  "code": "EMPTY_TITLE",
  "details": { /* optional */ }
}
```

Handle errors gracefully with toast notifications and inline form errors.

## Performance Targets

- **Page Load**: < 3 seconds on 3G
- **Time to Interactive (TTI)**: < 5 seconds
- **Animation Frame Rate**: 60fps (16.67ms per frame)
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds

## Accessibility

- **Semantic HTML**: Proper heading hierarchy (`h1` → `h6`)
- **ARIA Labels**: Screen reader support on interactive elements
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Escape)
- **Focus Management**: Visible focus indicators on all focusable elements
- **Color Contrast**: WCAG AA compliant (4.5:1 for text, 3:1 for UI components)
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

### Reduced Motion Support

The app automatically reduces animations for users who prefer reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Browser Support

- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Mobile Safari (iOS)**: iOS 14+
- **Chrome Mobile (Android)**: Latest version

## TypeScript Configuration

Strict mode is enabled for better type safety:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

## Troubleshooting

### API Connection Issues

**Problem**: "Failed to fetch" errors when calling API

**Solution**:
1. Verify backend is running on `http://localhost:8000`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Ensure CORS is configured on backend to allow frontend origin
4. Check browser console for detailed error messages

### Authentication Issues

**Problem**: "401 Unauthorized" errors

**Solution**:
1. Check if JWT token is stored in localStorage
2. Verify token hasn't expired (7-day expiry)
3. Ensure `Authorization: Bearer <token>` header is included
4. Log out and log back in to refresh token

### Build Errors

**Problem**: TypeScript compilation errors

**Solution**:
1. Run `npm run type-check` to see detailed errors
2. Fix any unused variables/parameters (strict mode enabled)
3. Ensure all imports have explicit types
4. Check for missing return statements in functions

### Animation Performance Issues

**Problem**: Choppy animations on low-end devices

**Solution**:
1. Animations use GPU-accelerated properties (`transform`, `opacity`)
2. Check browser DevTools Performance tab
3. Reduce animation complexity if needed
4. Ensure `will-change` is used sparingly

## Related Documentation

- [API Contracts](../backend/docs/api-contracts.md) - Backend API specifications
- [Data Model](../specs/003-advanced-todo-ui/data-model.md) - Database schema
- [Feature Spec](../specs/003-advanced-todo-ui/spec.md) - Requirements
- [Implementation Plan](../specs/003-advanced-todo-ui/plan.md) - Architecture decisions
- [Tasks](../specs/003-advanced-todo-ui/tasks.md) - Development tasks

## Contributing

When contributing to this project:

1. **Follow TypeScript strict mode** - No `any` types, explicit return types
2. **Use CSS Modules** - Avoid inline styles, use scoped CSS
3. **Maintain theme consistency** - Use CSS variables from `globals.css`
4. **Write accessible code** - Include ARIA labels, keyboard support
5. **Test responsiveness** - Mobile, tablet, and desktop breakpoints
6. **Keep animations smooth** - 60fps target, use GPU-accelerated properties
7. **Document complex logic** - Add comments for non-obvious code
8. **Optimize images** - Use Next.js Image component, WebP/AVIF formats

## License

This project is part of a full-stack To-Do application. See the main project README for license information.

---

**Built with Next.js 15, TypeScript, and CSS Modules**
**No Tailwind CSS • Pure CSS Animations • Dark Green Theme**
