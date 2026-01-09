---
id: 0001
title: UI Refactor SaaS Aesthetic Tasks
stage: tasks
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5
feature: ui-refactor-saas-aesthetic
branch: main
user: Cs
command: /sp.task
labels: ["ui-refactor", "saas-aesthetic", "tasks", "linear-style", "vercel-style"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - C:\Users\Cs\Desktop\Todo-App-\specs\ui-refactor-saas-aesthetic\tasks.md
tests:
  - (none - UI refactor)
---

## Prompt

# Instructions:
Refactor the entire UI to match "High-End American SaaS" aesthetics (Linear/Vercel style) using the Frontend Sub-agent.

## 1. Core Layout (The Fix):
- **Containerization**: Wrap the main dashboard and auth forms in a `max-w-[450px] mx-auto` container. This is crucial to stop the "stretched" look.
- **Background**: Use a clean `bg-slate-50` for light mode or `bg-[#0b0b0b]` for dark mode.
- **Spacing**: Use a consistent `space-y-6` for vertical gap and `px-6 py-10` for padding.

## 2. Advanced Component Styling:
- **Input Bar**: Create a "Command-style" floating input.
  - Style: `border border-slate-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-black/5 rounded-2xl`.
- **Task Cards**:
  - Style: `bg-white border border-slate-100 rounded-xl p-4 transition-all hover:shadow-md hover:border-slate-200`.
  - Content: Use `text-sm font-medium text-slate-700`.
- **Buttons**: Use "Ghost" or "Solid Zinc" styles.
  - `bg-zinc-900 text-zinc-50 rounded-lg px-4 py-2 hover:bg-zinc-800`.

## 3. Micro-Interactions:
- Add a subtle "Strikethrough" animation when a task is completed.
- Use `lucide-react` icons (Circle, CheckCircle, Trash2) with `size={18}` for a delicate, professional look.
- Implement **Optimistic UI**: When a user adds a task, it should appear in the list *instantly* with a slight fade-in, before the API call finishes.

## 4. Auth Page Transformation:
- Center the login card vertically and horizontally.
- Use a `glass` effect for the card: `backdrop-blur-md bg-white/80 border border-slate-200`.

## Response snapshot

Generated comprehensive task breakdown for UI refactor to High-End American SaaS aesthetics:

**Total Tasks**: 66 tasks across 11 phases
**Format**: All tasks follow strict checklist format with IDs, priorities, and file paths
**Structure**: Organized by phase with clear dependencies and parallel opportunities

**Key Phases**:
1. Setup & Core Layout (5 tasks) - Foundation with containerization
2. Foundational Components (9 tasks) - Button, Input, Card primitives
3. Dashboard Layout Refactor (5 tasks) - US-LAYOUT story
4. Command-Style Input (6 tasks) - US-INPUT story
5. Premium Task Cards (6 tasks) - US-CARDS story
6. Icons & Visual Refinement (5 tasks)
7. Strikethrough Animation (5 tasks)
8. Optimistic UI (5 tasks) - US-OPTIMISTIC story
9. Auth Pages Glass Effect (6 tasks)
10. Button Refinement (5 tasks)
11. Polish & Consistency (9 tasks)

**Parallel Opportunities**: 38 tasks marked [P] for concurrent execution

**MVP Scope**: Phases 1-3, 4-5, and 8 (core containerization + visual impact + optimistic UI)

**Files Created**:
- C:\Users\Cs\Desktop\Todo-App-\specs\ui-refactor-saas-aesthetic\tasks.md

## Outcome

- ✅ Impact: Created 66 implementation-ready tasks for UI refactor to Linear/Vercel aesthetic
- 🧪 Tests: UI refactor - no unit tests, manual browser testing required
- 📁 Files: 1 file created (tasks.md)
- 🔁 Next prompts: /sp.implement or manual task execution
- 🧠 Reflection: Task breakdown follows strict format with proper [P] parallelization markers and story labels. Containerization fix (max-w-[450px]) addresses core "stretched" layout issue. Optimistic UI tasks ensure instant feedback. All tasks include specific file paths and styling details.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Format validation: PASS (all tasks have checkboxes, IDs, file paths)
- Prompt variant (if applicable): Standard task generation from user requirements
- Next experiment (smallest change to try): Execute Phase 1 tasks to validate containerization approach
