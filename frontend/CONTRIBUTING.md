# Contributing to Advanced To-Do App

Thank you for your interest in contributing to the Advanced To-Do App! This document provides guidelines and best practices for developers.

## Table of Contents

- [Code Style Guide](#code-style-guide)
- [Component Structure](#component-structure)
- [Git Workflow](#git-workflow)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)

## Code Style Guide

### TypeScript

- **Use TypeScript strict mode**: All code must compile without errors with strict mode enabled
- **No `any` types**: Use proper type definitions for all variables and function parameters
- **Explicit return types**: All functions must have explicit return type annotations
- **Interface naming**: Use PascalCase for interfaces (e.g., `UserProps`, `TaskData`)
- **Type vs Interface**: Prefer `interface` for object shapes, `type` for unions/intersections

```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  onClick: () => void;
  children: React.ReactNode;
}

export default function Button({ variant, onClick, children }: ButtonProps): JSX.Element {
  return <button onClick={onClick}>{children}</button>;
}

// Bad
export default function Button(props: any) {
  return <button>{props.children}</button>;
}
```

### CSS Modules

- **Use CSS Modules for all component styles**: Never use inline styles or global CSS for components
- **CSS variable usage**: Always use CSS custom properties from `globals.css` for colors, spacing, and durations
- **Class naming**: Use camelCase for CSS class names (e.g., `.primaryButton`, `.errorMessage`)
- **Avoid magic numbers**: Use CSS variables instead of hardcoded values

```css
/* Good */
.container {
  padding: var(--space-lg);
  background-color: var(--color-surface);
  border-radius: 12px;
  transition: all var(--duration-normal) var(--ease-out);
}

/* Bad */
.container {
  padding: 24px;
  background-color: #1a2e26;
  border-radius: 12px;
  transition: all 300ms ease-out;
}
```

### Component Structure

- **One component per file**: Each component should have its own file
- **Co-locate CSS Modules**: Place CSS Module in `styles/components/ComponentName.module.css`
- **Use "use client" directive**: Add `'use client'` at the top of client components
- **Export default**: Use default exports for components

```
frontend/
├── components/
│   └── shared/
│       └── Button.tsx
└── styles/
    └── components/
        └── Button.module.css
```

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskItem`, `DashboardHeader`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `useTasks`)
- **Utilities**: camelCase (e.g., `formatDate`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_TITLE_LENGTH`)
- **Types/Interfaces**: PascalCase (e.g., `Task`, `UserCredentials`)

### File Organization

```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Landing page components
│   └── shared/            # Reusable shared components
├── lib/                   # Library code
│   ├── api/               # API client functions
│   ├── contexts/          # React contexts
│   └── hooks/             # Custom hooks
├── styles/                # CSS Modules
│   └── components/        # Component-specific styles
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Component Structure Guidelines

### Standard Component Template

```typescript
'use client';

/**
 * ComponentName - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Brief description of what this component does.
 */

import React from 'react';
import styles from '@/styles/components/ComponentName.module.css';

interface ComponentNameProps {
  // Props interface
}

export default function ComponentName({ ...props }: ComponentNameProps) {
  // Component logic
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}
```

### Hooks Structure

```typescript
/**
 * useHookName Hook - Advanced To-Do Application UI
 * Feature: 003-advanced-todo-ui
 *
 * Brief description of what this hook does.
 */

import { useState, useEffect } from 'react';

interface UseHookNameReturn {
  // Return type interface
}

export function useHookName(): UseHookNameReturn {
  // Hook logic
  return {
    // Returned values
  };
}
```

## Git Workflow

### Branch Naming

- **Feature branches**: `feature/description` (e.g., `feature/add-task-sorting`)
- **Bug fixes**: `fix/description` (e.g., `fix/auth-redirect-loop`)
- **Refactoring**: `refactor/description` (e.g., `refactor/api-client-error-handling`)
- **Documentation**: `docs/description` (e.g., `docs/update-readme`)

### Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples**:

```
feat(dashboard): add task sorting functionality

Implement sorting dropdown in TaskList component with options for
sorting by date, title, and completion status.

Closes #42
```

```
fix(auth): resolve infinite redirect loop on logout

Clear localStorage before router.push to prevent auth state race condition.

Fixes #38
```

### Commit Best Practices

- **Atomic commits**: Each commit should represent a single logical change
- **Test before committing**: Ensure code compiles and runs without errors
- **No commented-out code**: Remove dead code instead of commenting it out
- **No console.logs**: Remove debug statements before committing

## Testing Requirements

### Before Submitting

1. **TypeScript Compilation**: Run `npm run type-check` and fix all errors
2. **ESLint**: Run `npm run lint` and fix all warnings
3. **Manual Testing**: Test your changes in the browser
4. **Responsive Testing**: Verify changes work on desktop, tablet, and mobile
5. **Accessibility**: Ensure keyboard navigation and screen reader compatibility

### Accessibility Checklist

- [ ] All interactive elements have proper ARIA labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Forms have proper labels and error messages

### Browser Testing

Test in the latest versions of:
- Chrome
- Firefox
- Safari
- Edge

## Pull Request Process

### PR Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari (if applicable)
- [ ] Tested on mobile viewport
- [ ] Keyboard navigation tested
- [ ] TypeScript compilation passes
- [ ] ESLint passes

## Screenshots (if applicable)
Add screenshots or GIFs demonstrating the changes

## Related Issues
Closes #(issue number)

## Additional Notes
Any additional information or context
```

### PR Review Checklist

Before requesting a review, ensure:

1. **Code Quality**
   - No TypeScript errors
   - No ESLint warnings
   - Code follows style guide
   - No unnecessary console.logs or commented code

2. **Functionality**
   - Feature works as expected
   - No regressions in existing features
   - Error handling is implemented

3. **Documentation**
   - Component docstrings are updated
   - README is updated if needed
   - Code comments explain complex logic

4. **Testing**
   - Manual testing completed
   - Browser compatibility verified
   - Accessibility tested

### Code Review Guidelines

When reviewing PRs:

- **Be constructive**: Provide helpful suggestions, not just criticism
- **Be specific**: Point to exact lines and explain why changes are needed
- **Be timely**: Review PRs within 24-48 hours
- **Ask questions**: If something is unclear, ask for clarification
- **Approve or request changes**: Don't leave PRs in limbo

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run type-check

# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix
```

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Never commit `.env.local` to version control.

## Common Issues and Solutions

### Issue: TypeScript errors after pulling latest changes

**Solution**: Delete `node_modules` and `.next`, then reinstall:
```bash
rm -rf node_modules .next
npm install
```

### Issue: CSS styles not updating

**Solution**: Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

### Issue: API calls failing

**Solution**: Verify backend is running and `NEXT_PUBLIC_API_URL` is correct in `.env.local`

## Questions?

If you have questions or need help, please:
- Check existing documentation (README.md, this file)
- Search for similar issues in the issue tracker
- Create a new issue with the `question` label

Thank you for contributing! 🎉
