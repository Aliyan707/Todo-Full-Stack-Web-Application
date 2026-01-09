# Implementation Plan: Advanced To-Do Application UI

**Branch**: `003-advanced-todo-ui` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-advanced-todo-ui/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create an advanced, visually unique To-Do web application UI using Next.js 15 with App Router. The interface features a dynamic dark green themed landing page with animated background elements (moving shapes/particles), a split-screen authentication interface (sign-in left, sign-up right) with To-Do app imagery, and a clean dashboard for task management. The design must avoid Tailwind CSS, using CSS Modules or CSS-in-JS instead, while maintaining 60fps animations, full responsiveness (320px-2560px), and WCAG AA accessibility standards.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 App Router, React 18+
**Primary Dependencies**:
- Next.js 15 (App Router, Server Components)
- React 18+ (client components for interactivity)
- Better Auth (authentication from constitution)
- **NEEDS CLARIFICATION**: CSS-in-JS library choice (styled-components vs emotion vs vanilla-extract)
- **NEEDS CLARIFICATION**: Animation library (Framer Motion vs react-spring vs CSS animations only)

**Storage**:
- PostgreSQL (Neon Serverless per constitution) for user accounts and tasks
- Backend API (FastAPI + SQLModel from constitution) for data persistence

**Testing**: Jest + React Testing Library for component tests, Playwright for E2E tests
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), responsive design for mobile/tablet/desktop
**Project Type**: Web application (frontend-focused with backend integration)
**Performance Goals**:
- 60fps animations on modern browsers
- <3s landing page load on 3G networks
- <5s Time to Interactive (TTI) on mobile
- <100ms interaction feedback

**Constraints**:
- NO Tailwind CSS utility classes (explicit user requirement)
- Must use CSS Modules, CSS-in-JS, or SCSS for styling
- Must support viewport widths 320px-2560px
- WCAG AA color contrast (4.5:1 minimum)
- Respect `prefers-reduced-motion` for accessibility

**Scale/Scope**:
- 1,000 concurrent users (initial target)
- Up to 500 tasks per user dashboard rendering
- 3 main pages (landing, auth, dashboard)
- ~15-20 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Based on `.specify/memory/constitution.md`:

### Active Technologies Check

✅ **PASS**: Next.js 15 + TypeScript 5.x + React 18+ matches constitution:
- "TypeScript 5.x + Next.js 15 App Router + React 18+ + Better Auth + Tailwind CSS (001-phase-ii-specs - frontend)"

⚠️ **DEVIATION**: No Tailwind CSS (explicit user requirement overrides constitution default)
- **Justification**: User explicitly requires "Avoid using Tailwind CSS" and "Focus on modern, visually appealing design elements" with custom animations
- **Alternative**: CSS Modules or CSS-in-JS (styled-components/emotion) for component-scoped styles
- **Impact**: Requires more manual styling but enables unique visual identity and custom animations

✅ **PASS**: Backend integration with FastAPI + SQLModel + PostgreSQL (from constitution 001-phase-ii-specs)

✅ **PASS**: Better Auth for authentication (from constitution)

### Code Standards Check

✅ **PASS**: TypeScript for type safety
✅ **PASS**: Component-based architecture (React)
✅ **PASS**: Test coverage (Jest + RTL + Playwright)
✅ **PASS**: Accessibility considerations (WCAG AA, reduced-motion)
✅ **PASS**: Performance targets defined (60fps, <3s load, <5s TTI)

### Decision: **APPROVED with documented deviation**
- No Tailwind CSS is a valid user requirement override
- All other constitution standards maintained

## Project Structure

### Documentation (this feature)

```text
specs/003-advanced-todo-ui/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - User, Task, Session entities
├── quickstart.md        # Phase 1 output - test scenarios
├── contracts/           # Phase 1 output - API contracts
│   ├── auth.yaml       # Authentication endpoints (Better Auth)
│   └── tasks.yaml      # Task CRUD endpoints
├── checklists/          # Quality validation
│   └── requirements.md  # Specification checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend-focused with backend integration)

frontend/
├── src/
│   ├── app/                      # Next.js 15 App Router pages
│   │   ├── page.tsx             # Landing page (P1)
│   │   ├── auth/
│   │   │   └── page.tsx         # Authentication split-screen (P2)
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Task dashboard (P3)
│   │   ├── layout.tsx           # Root layout with theme
│   │   └── globals.css          # Global CSS variables (dark green theme)
│   │
│   ├── components/               # React components
│   │   ├── landing/
│   │   │   ├── AnimatedBackground.tsx   # P1: Layered shapes/particles
│   │   │   ├── HeroSection.tsx          # P1: Main CTA
│   │   │   └── LandingNav.tsx           # P1: Navigation
│   │   │
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx           # P2: Left side form
│   │   │   ├── SignUpForm.tsx           # P2: Right side form
│   │   │   ├── AuthLayout.tsx           # P2: Split-screen container
│   │   │   └── TodoImagery.tsx          # P2: App imagery/illustrations
│   │   │
│   │   ├── dashboard/
│   │   │   ├── TaskList.tsx             # P3: Task display
│   │   │   ├── TaskItem.tsx             # P3: Individual task
│   │   │   ├── AddTaskForm.tsx          # P3: Create task
│   │   │   ├── EditTaskModal.tsx        # P3: Update task
│   │   │   └── DashboardHeader.tsx      # P3: Navigation + logout
│   │   │
│   │   └── shared/
│   │       ├── Button.tsx               # Reusable button with theme
│   │       ├── Input.tsx                # Themed form input
│   │       └── Modal.tsx                # Reusable modal
│   │
│   ├── lib/                      # Utilities and services
│   │   ├── auth.ts              # Better Auth client integration
│   │   ├── api/
│   │   │   ├── tasks.ts         # Task API client (CRUD)
│   │   │   └── users.ts         # User API client
│   │   └── hooks/
│   │       ├── useTasks.ts      # Task state management
│   │       └── useAuth.ts       # Auth state management
│   │
│   ├── styles/                   # Styling approach (NEEDS CLARIFICATION)
│   │   ├── components/          # Component-scoped styles (CSS Modules)
│   │   │   ├── AnimatedBackground.module.css
│   │   │   ├── SignInForm.module.css
│   │   │   └── TaskItem.module.css
│   │   ├── theme.ts             # Theme constants (dark green palette)
│   │   └── animations.ts        # Shared animation definitions
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── task.ts              # Task entity types
│   │   ├── user.ts              # User entity types
│   │   └── api.ts               # API response types
│   │
│   └── public/                   # Static assets
│       ├── images/
│       │   └── todo-app-preview.svg  # P2: Auth page imagery
│       └── icons/
│
├── tests/
│   ├── components/               # Component unit tests
│   │   ├── landing/
│   │   ├── auth/
│   │   └── dashboard/
│   ├── integration/              # Integration tests
│   │   ├── auth-flow.test.ts
│   │   └── task-crud.test.ts
│   └── e2e/                      # Playwright E2E tests
│       ├── landing.spec.ts
│       ├── auth.spec.ts
│       └── dashboard.spec.ts
│
├── package.json
├── tsconfig.json
├── next.config.js
├── jest.config.js
└── playwright.config.ts

backend/                          # Existing from constitution
├── src/
│   ├── models/
│   │   ├── user.py              # User entity (SQLModel)
│   │   └── task.py              # Task entity (SQLModel)
│   ├── services/
│   │   ├── auth_service.py      # Better Auth integration
│   │   └── task_service.py      # Task business logic
│   └── api/
│       ├── auth.py              # Authentication endpoints
│       └── tasks.py             # Task CRUD endpoints
└── tests/
```

**Structure Decision**: Web application with frontend/backend separation. Frontend uses Next.js 15 App Router with `/app` directory structure (not `/pages`). Component organization follows user story priorities (landing, auth, dashboard). Backend structure follows constitution (FastAPI + SQLModel).

**Key Architectural Decisions**:
1. **App Router over Pages Router**: Next.js 15 App Router for server components, streaming, and better performance
2. **Component-scoped styling**: CSS Modules (or CSS-in-JS if chosen in research) for isolated, maintainable styles without Tailwind
3. **Custom hooks for state**: `useTasks`, `useAuth` to encapsulate API calls and state management
4. **Modular animations**: Separate `AnimatedBackground` component for landing page performance isolation

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| No Tailwind CSS | User explicitly requires unique, custom visual design with advanced animations and dark green theme | Tailwind's utility-first approach limits animation customization and makes unique visual identity harder to achieve. Custom CSS/CSS-in-JS allows fine-grained control over layered animations, theme variables, and component-specific styles needed for 60fps performance and unique aesthetic. |

**Note**: This is not a violation of technical standards, but a justified deviation from constitution's default styling approach based on explicit user requirements.

## NEEDS CLARIFICATION Summary

~~The following unknowns will be resolved in Phase 0 (research.md):~~ **✅ ALL RESOLVED**

1. **Styling Approach**: ~~CSS Modules vs styled-components vs emotion vs vanilla-extract~~
   - **DECISION**: CSS Modules (zero runtime, native Next.js 15 support, best performance)

2. **Animation Strategy**: ~~Framer Motion vs react-spring vs pure CSS animations~~
   - **DECISION**: Pure CSS Animations (0KB bundle, 60fps guaranteed, native accessibility)

3. **Image Assets Source**: ~~Create custom illustrations vs use placeholder images vs generate with AI~~
   - **DECISION**: SVG Illustrations (~10KB, scalable, theme-integrated, unique identity)

4. **State Management**: ~~React Context + custom hooks vs Zustand vs Jotai~~
   - **DECISION**: React Context + Custom Hooks (0KB dependency, sufficient for 3 state domains)

**Phase 0 Complete**: All decisions documented in `research.md` with rationale and alternatives.

---

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design complete*

### Technology Stack Validation

✅ **Frontend Stack**:
- Next.js 15 App Router ✓
- TypeScript 5.x ✓
- React 18+ ✓
- CSS Modules (replaces Tailwind CSS per user requirement) ✓
- Better Auth (from constitution) ✓

✅ **Backend Stack** (from constitution):
- FastAPI ✓
- SQLModel ✓
- PostgreSQL (Neon Serverless) ✓
- PyJWT ✓

✅ **Zero Additional Dependencies**: All technology decisions use built-in or zero-runtime solutions
- CSS Modules: Native Next.js support
- Pure CSS Animations: No library needed
- SVG Illustrations: Static assets
- React Context: Built-in React feature

✅ **Performance Goals Met**:
- <3s landing page load: Zero animation library overhead ✓
- 60fps animations: GPU-accelerated CSS ✓
- <5s TTI: No heavy JavaScript libraries ✓

✅ **Code Standards Maintained**:
- TypeScript for type safety ✓
- Component-based architecture ✓
- Test coverage plan (Jest + RTL + Playwright) ✓
- Accessibility (WCAG AA, reduced-motion) ✓

### Final Verdict: **APPROVED ✅**

All constitution requirements satisfied. The deviation from Tailwind CSS is justified by explicit user requirements and replaced with a performance-optimized alternative (CSS Modules). No complexity violations introduced.
