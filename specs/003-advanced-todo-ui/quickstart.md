# Quickstart Guide: Advanced To-Do Application UI

**Feature**: `003-advanced-todo-ui`
**Date**: 2026-01-08
**Purpose**: Test scenarios and manual testing guide for the Advanced To-Do UI feature

## Overview

This guide provides step-by-step test scenarios for manually validating the Advanced To-Do Application UI. Each scenario maps to user stories from spec.md and can be executed independently.

**Prerequisites**:
- Frontend server running on `http://localhost:3000`
- Backend API running on `http://localhost:8000`
- Database seeded with test data (or empty for new user scenarios)

---

## Test Environment Setup

### 1. Start Development Environment

```bash
# Terminal 1: Start backend
cd backend
python -m uvicorn src.main:app --reload --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2. Verify Services

- **Frontend**: Open `http://localhost:3000` - should see landing page
- **Backend API**: Open `http://localhost:8000/docs` - should see OpenAPI docs
- **Database**: Connect to PostgreSQL and verify tables exist (users, sessions, tasks)

---

## User Story 1: Landing Page Experience (P1)

### Scenario 1.1: First Visit to Landing Page

**Objective**: Verify landing page loads with animations and dark green theme

**Steps**:
1. Open browser to `http://localhost:3000`
2. Observe page load

**Expected Results**:
- ✅ Page loads in under 3 seconds (on 3G, use Chrome DevTools Network throttling)
- ✅ Dark green color theme is immediately visible (#1a5c47 range)
- ✅ Animated background elements (moving shapes/particles) are visible
- ✅ Animations run smoothly at 60fps (use Chrome DevTools Performance tab)
- ✅ "Sign In" and "Sign Up" buttons/links are prominently displayed
- ✅ No console errors in browser DevTools

**Acceptance Criteria**: FR-001, FR-002, FR-003, FR-004, SC-001, SC-002, SC-008

---

### Scenario 1.2: Responsive Landing Page (Desktop)

**Objective**: Verify landing page adapts to desktop viewport

**Steps**:
1. Open browser to `http://localhost:3000`
2. Resize window to 1920px x 1080px (desktop)
3. Observe layout

**Expected Results**:
- ✅ All elements are visible without horizontal scroll
- ✅ Animations scale appropriately
- ✅ Text is readable with good contrast
- ✅ Call-to-action buttons are accessible

**Acceptance Criteria**: FR-005, SC-007

---

### Scenario 1.3: Responsive Landing Page (Tablet)

**Objective**: Verify landing page adapts to tablet viewport

**Steps**:
1. Open browser to `http://localhost:3000`
2. Resize window to 768px x 1024px (tablet portrait)
3. Observe layout

**Expected Results**:
- ✅ Layout adapts without breaking
- ✅ Animations remain smooth
- ✅ Touch targets are at least 44x44px
- ✅ Navigation is accessible

**Acceptance Criteria**: FR-005, NFR-005, SC-007

---

### Scenario 1.4: Responsive Landing Page (Mobile)

**Objective**: Verify landing page adapts to mobile viewport

**Steps**:
1. Open browser to `http://localhost:3000`
2. Resize window to 375px x 667px (iPhone SE)
3. Test extreme small: 320px x 568px (iPhone 5)
4. Observe layout

**Expected Results**:
- ✅ All content is visible without horizontal scroll
- ✅ Animations are optimized for mobile (reduced complexity if needed)
- ✅ Text remains readable (minimum 16px font size)
- ✅ Touch targets are adequately sized (44x44px minimum)
- ✅ Page loads in under 5 seconds (TTI)

**Acceptance Criteria**: FR-005, NFR-003, NFR-005, SC-007

---

### Scenario 1.5: Animation Performance and Accessibility

**Objective**: Verify animations respect reduced motion preference

**Steps**:
1. Open browser to `http://localhost:3000`
2. Enable "Reduce motion" in OS settings (macOS: System Preferences > Accessibility > Display > Reduce motion)
3. Refresh page
4. Observe animations

**Expected Results**:
- ✅ Animations are disabled or significantly reduced
- ✅ Page remains functional and visually appealing
- ✅ Static background maintains dark green theme
- ✅ No animation-related console errors

**Acceptance Criteria**: NFR-010, SC-002

---

### Scenario 1.6: Landing Page Interactions

**Objective**: Verify interactive elements respond to user actions

**Steps**:
1. Open browser to `http://localhost:3000`
2. Hover over "Sign In" button
3. Hover over "Sign Up" button
4. Scroll page (if content extends below fold)

**Expected Results**:
- ✅ Hover states provide visual feedback within 100ms
- ✅ Cursor changes to pointer over interactive elements
- ✅ Scroll triggers parallax or animation effects (if implemented)
- ✅ No lag or jank during interactions

**Acceptance Criteria**: SC-009

---

## User Story 2: User Authentication Journey (P2)

### Scenario 2.1: Navigate to Authentication Page

**Objective**: Access authentication page from landing page

**Steps**:
1. Start at `http://localhost:3000`
2. Click "Sign Up" or "Get Started" button

**Expected Results**:
- ✅ Navigates to `/auth` or authentication page
- ✅ Page loads in under 2 seconds
- ✅ Split-screen layout is visible (sign-in left, sign-up right on desktop)
- ✅ To-Do app imagery is visible on both sides
- ✅ Dark green theme is maintained

**Acceptance Criteria**: FR-006, FR-007, FR-012

---

### Scenario 2.2: Sign Up - Happy Path

**Objective**: Successfully register a new user account

**Steps**:
1. Navigate to authentication page (`/auth`)
2. Locate sign-up form (right side on desktop)
3. Enter valid data:
   - Email: `testuser@example.com`
   - Password: `SecurePass123!`
   - Display Name: `Test User`
4. Click "Sign Up" button

**Expected Results**:
- ✅ Form validates in real-time (within 300ms)
- ✅ Success feedback is displayed
- ✅ User is redirected to `/dashboard` within 2 seconds
- ✅ JWT token is stored (check browser DevTools > Application > Local Storage or Cookies)
- ✅ Total registration time is under 2 minutes (SC-004)

**Acceptance Criteria**: FR-008, FR-010, SC-004

---

### Scenario 2.3: Sign Up - Validation Errors

**Objective**: Verify form validation for invalid inputs

**Test Cases**:

**2.3a: Invalid Email Format**
- Input: `invalidemail`
- Expected: Error message "Invalid email format" (NFR-007: plain language)

**2.3b: Weak Password**
- Input: `weak`
- Expected: Error message explaining password requirements

**2.3c: Missing Required Field**
- Input: Leave "Display Name" empty
- Expected: Error message "Display name is required"

**2.3d: Email Already Exists**
- Input: Email that's already registered
- Expected: Error message "Email already registered" (FR-011: no security details exposed)

**Expected Results for All**:
- ✅ Validation feedback appears within 300ms
- ✅ Error messages use plain language (no technical jargon)
- ✅ Form state is preserved (user doesn't lose other inputs)
- ✅ No security details exposed (don't reveal which emails exist)

**Acceptance Criteria**: FR-010, FR-011, NFR-006, NFR-007

---

### Scenario 2.4: Sign In - Happy Path

**Objective**: Successfully sign in with existing account

**Prerequisites**: User account exists (`testuser@example.com` / `SecurePass123!`)

**Steps**:
1. Navigate to authentication page (`/auth`)
2. Locate sign-in form (left side on desktop)
3. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `SecurePass123!`
4. Click "Sign In" button

**Expected Results**:
- ✅ Authentication completes successfully
- ✅ User is redirected to `/dashboard` within 15 seconds (SC-005)
- ✅ JWT token is stored
- ✅ No sensitive error messages on failure

**Acceptance Criteria**: FR-009, SC-005, SC-012

---

### Scenario 2.5: Sign In - Invalid Credentials

**Objective**: Verify error handling for invalid credentials

**Steps**:
1. Navigate to authentication page (`/auth`)
2. Enter invalid credentials:
   - Email: `testuser@example.com`
   - Password: `WrongPassword123!`
3. Click "Sign In" button

**Expected Results**:
- ✅ Error message: "Invalid email or password" (generic, doesn't reveal which is wrong)
- ✅ Form state is preserved
- ✅ No sensitive information exposed
- ✅ After 5 failed attempts, show rate limit message

**Acceptance Criteria**: FR-011, NFR-007

---

### Scenario 2.6: Authentication Page - Responsive Mobile

**Objective**: Verify split-screen layout adapts to mobile

**Steps**:
1. Navigate to `/auth`
2. Resize to mobile viewport (375px)
3. Observe layout

**Expected Results**:
- ✅ Forms stack vertically (no side-by-side on mobile)
- ✅ Visual hierarchy is maintained (sign-up prioritized or sign-in prioritized)
- ✅ To-Do app imagery scales or hides appropriately
- ✅ Forms remain usable with touch targets 44x44px minimum

**Acceptance Criteria**: FR-013, NFR-005

---

## User Story 3: Dashboard Experience (P3)

### Scenario 3.1: Initial Dashboard Load (New User)

**Objective**: First-time user sees empty dashboard

**Prerequisites**: New user account with no tasks

**Steps**:
1. Sign in as new user
2. Observe dashboard page

**Expected Results**:
- ✅ Dashboard loads and displays within 15 seconds of sign-in (SC-005)
- ✅ Dark green theme is consistent with landing page
- ✅ Empty state message: "No tasks yet" or similar
- ✅ "Add Task" button or input is prominently visible
- ✅ Logout option is visible in header/navigation

**Acceptance Criteria**: FR-014, FR-015, FR-023, FR-020

---

### Scenario 3.2: Create Task - Happy Path

**Objective**: Successfully create a new task

**Steps**:
1. On dashboard, locate "Add Task" button/input
2. Enter task details:
   - Title: `Buy groceries`
   - Description (optional): `Milk, eggs, bread, and coffee`
3. Click "Add" or press Enter

**Expected Results**:
- ✅ Task appears in list with smooth animation (within 300ms)
- ✅ Task displays with title and description
- ✅ Task is marked as "Pending" or incomplete
- ✅ Total action completes in under 3 clicks (SC-006)
- ✅ Task persists on page refresh

**Acceptance Criteria**: FR-016, FR-021, SC-006

---

### Scenario 3.3: Create Task - Validation

**Objective**: Verify task creation validation

**Test Cases**:

**3.3a: Empty Title**
- Input: Leave title empty
- Expected: Error "Title is required"

**3.3b: Title Too Long**
- Input: 201 character title
- Expected: Error "Title must be 200 characters or less"

**3.3c: Description Only**
- Input: Description without title
- Expected: Error "Title is required"

**Expected Results**:
- ✅ Validation feedback within 300ms
- ✅ User-friendly error messages
- ✅ Form state preserved

**Acceptance Criteria**: FR-016, NFR-006, NFR-007

---

### Scenario 3.4: Mark Task Complete

**Objective**: Mark task as complete and observe visual feedback

**Prerequisites**: At least one pending task exists

**Steps**:
1. On dashboard, locate a pending task
2. Click checkbox or "Complete" button

**Expected Results**:
- ✅ Task visually changes (e.g., strikethrough, different color)
- ✅ Smooth animation/transition (within 300ms)
- ✅ Task moves to completed section (if separated)
- ✅ Total action is 1-2 clicks (SC-006)
- ✅ Completion persists on refresh

**Acceptance Criteria**: FR-017, FR-021, SC-006

---

### Scenario 3.5: Mark Task Incomplete

**Objective**: Mark completed task as incomplete

**Prerequisites**: At least one completed task exists

**Steps**:
1. On dashboard, locate a completed task
2. Click checkbox or "Mark Incomplete" button

**Expected Results**:
- ✅ Task returns to pending state
- ✅ Visual feedback with animation
- ✅ Action completes in 1-2 clicks

**Acceptance Criteria**: FR-017, FR-021, SC-006

---

### Scenario 3.6: Edit Task

**Objective**: Update task title and/or description

**Prerequisites**: At least one task exists

**Steps**:
1. Locate task in dashboard
2. Click "Edit" button or double-click task
3. Modify:
   - Title: `Buy groceries and cook dinner`
   - Description: `Added cooking to the plan`
4. Save changes

**Expected Results**:
- ✅ Task updates with new values
- ✅ Smooth transition/animation
- ✅ Total action is 3 clicks or less (SC-006)
- ✅ Changes persist on refresh

**Acceptance Criteria**: FR-018, SC-006

---

### Scenario 3.7: Delete Task

**Objective**: Permanently delete a task

**Prerequisites**: At least one task exists

**Steps**:
1. Locate task in dashboard
2. Click "Delete" button or icon
3. Confirm deletion (if confirmation modal appears)

**Expected Results**:
- ✅ Confirmation modal asks "Are you sure?" (FR-019)
- ✅ Task is removed from list with smooth animation
- ✅ Total action is 2-3 clicks (SC-006)
- ✅ Task is gone after refresh (permanently deleted)

**Acceptance Criteria**: FR-019, SC-006

---

### Scenario 3.8: Dashboard - Multiple Tasks Display

**Objective**: Verify dashboard handles multiple tasks well

**Prerequisites**: User has 10+ tasks (mix of pending and completed)

**Steps**:
1. Sign in to account with multiple tasks
2. Observe dashboard layout

**Expected Results**:
- ✅ Tasks are organized logically (by status, date, or priority)
- ✅ Visual separation between task items
- ✅ Scrolling is smooth
- ✅ No performance degradation (test up to 500 tasks per NFR-004)

**Acceptance Criteria**: FR-015, NFR-004

---

### Scenario 3.9: Dashboard - Responsive Design

**Objective**: Verify dashboard adapts to all screen sizes

**Test Cases**:

**3.9a: Desktop (1920px)**
- Expected: Full layout with all features visible

**3.9b: Tablet (768px)**
- Expected: Adapted layout, touch-friendly targets

**3.9c: Mobile (375px)**
- Expected: Vertical stacking, compact layout, all features accessible

**3.9d: Extreme Small (320px)**
- Expected: Still usable, no broken layout

**Expected Results**:
- ✅ All viewports maintain usability (SC-007)
- ✅ Touch targets minimum 44x44px on mobile (NFR-005)
- ✅ No horizontal scrolling required

**Acceptance Criteria**: FR-022, SC-007, NFR-005

---

### Scenario 3.10: Logout

**Objective**: Sign out and end user session

**Steps**:
1. On dashboard, locate logout button (in header/nav)
2. Click "Logout"

**Expected Results**:
- ✅ User is signed out immediately
- ✅ Redirected to landing page or login page
- ✅ JWT token is cleared from storage
- ✅ Attempting to access `/dashboard` redirects to login

**Acceptance Criteria**: FR-023

---

### Scenario 3.11: Dashboard - Micro-interactions

**Objective**: Verify subtle animations throughout dashboard

**Steps**:
1. On dashboard, perform various actions:
   - Hover over task items
   - Hover over buttons
   - Click "Add Task"
   - Complete a task
   - Delete a task

**Expected Results**:
- ✅ All interactions have visual feedback within 100ms (SC-009)
- ✅ Hover states change cursor to pointer
- ✅ Animations are smooth and don't cause jank
- ✅ Visual style is consistent with dark green theme

**Acceptance Criteria**: FR-021, SC-009

---

## Cross-Cutting Test Scenarios

### Scenario X.1: Session Persistence

**Objective**: Verify user stays logged in across browser sessions

**Steps**:
1. Sign in to account
2. Close browser completely
3. Reopen browser and navigate to `http://localhost:3000/dashboard`

**Expected Results**:
- ✅ User remains authenticated (if within 7 days)
- ✅ Dashboard loads directly without re-login
- ✅ Tasks are preserved

**Acceptance Criteria**: Assumption 12 (7-day session), FR-024

---

### Scenario X.2: Unauthenticated Access Protection

**Objective**: Verify dashboard is protected from unauthenticated access

**Steps**:
1. Clear all browser storage/cookies (sign out)
2. Attempt to navigate directly to `http://localhost:3000/dashboard`

**Expected Results**:
- ✅ User is redirected to `/auth` or landing page
- ✅ Appropriate message: "Please sign in to continue"

**Acceptance Criteria**: Edge case from spec.md

---

### Scenario X.3: Browser Compatibility

**Objective**: Verify feature works across browsers

**Browsers to Test**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Test Cases**:
- Full user journey (P1 → P2 → P3)
- Animations performance
- CSS styling consistency

**Expected Results**:
- ✅ All functionality works in all browsers (NFR-011)
- ✅ Visual consistency maintained
- ✅ Animations perform at 60fps

**Acceptance Criteria**: NFR-011, SC-002

---

### Scenario X.4: Accessibility - Color Contrast

**Objective**: Verify text meets WCAG AA contrast ratios

**Steps**:
1. Use browser DevTools or tool like Axe DevTools
2. Check contrast ratios for all text elements:
   - Landing page headings and body text
   - Auth form labels and inputs
   - Dashboard task text

**Expected Results**:
- ✅ All text has minimum 4.5:1 contrast ratio (WCAG AA)
- ✅ Dark green theme maintains readability

**Acceptance Criteria**: NFR-008

---

### Scenario X.5: Accessibility - Keyboard Navigation

**Objective**: Verify all features are keyboard accessible

**Steps**:
1. Navigate entire application using only keyboard:
   - Tab through landing page
   - Tab through auth forms
   - Tab through dashboard controls
2. Activate elements with Enter/Space

**Expected Results**:
- ✅ All interactive elements are reachable via Tab
- ✅ Focus indicators are visible
- ✅ Elements activate with Enter/Space
- ✅ Logical tab order maintained

**Acceptance Criteria**: NFR-009

---

## Performance Testing

### Performance Test 1: Landing Page Load Time (3G)

**Objective**: Verify SC-008 (<3s load on 3G)

**Steps**:
1. Open Chrome DevTools > Network tab
2. Set throttling to "Slow 3G"
3. Navigate to `http://localhost:3000`
4. Measure time to "Load" event

**Expected Results**:
- ✅ Page load completes in under 3 seconds

**Acceptance Criteria**: SC-008

---

### Performance Test 2: Time to Interactive (Mobile)

**Objective**: Verify NFR-003 (<5s TTI on mobile)

**Steps**:
1. Open Chrome DevTools > Lighthouse
2. Run audit for mobile
3. Check "Time to Interactive" metric

**Expected Results**:
- ✅ TTI is under 5 seconds

**Acceptance Criteria**: NFR-003

---

### Performance Test 3: Animation Frame Rate

**Objective**: Verify SC-002 (60fps animations)

**Steps**:
1. Open Chrome DevTools > Performance tab
2. Record while animations are running
3. Check FPS meter in recording

**Expected Results**:
- ✅ Animations maintain 60fps consistently
- ✅ No significant frame drops

**Acceptance Criteria**: SC-002

---

### Performance Test 4: Dashboard with 500 Tasks

**Objective**: Verify NFR-004 (no degradation with 500 tasks)

**Prerequisites**: Seed database with 500 tasks for test user

**Steps**:
1. Sign in to account with 500 tasks
2. Observe dashboard load time
3. Scroll through task list
4. Perform task operations (complete, edit, delete)

**Expected Results**:
- ✅ Dashboard loads without noticeable delay
- ✅ Scrolling remains smooth
- ✅ Operations complete in expected time (SC-006)

**Acceptance Criteria**: NFR-004

---

## Test Data Setup

### Create Test Users

```bash
# Use backend API or database seeder
POST /api/auth/register
{
  "email": "test1@example.com",
  "password": "TestPass123!",
  "displayName": "Test User 1"
}

POST /api/auth/register
{
  "email": "test2@example.com",
  "password": "TestPass123!",
  "displayName": "Test User 2"
}
```

### Seed Tasks

```bash
# Create 10 tasks for test1@example.com
for i in 1..10:
  POST /api/tasks
  Authorization: Bearer <test1_token>
  {
    "title": "Task $i",
    "description": "Description for task $i"
  }
```

---

## Bug Reporting Template

When finding issues during testing, use this template:

```markdown
**Bug Title**: [Brief description]

**Severity**: [Critical / High / Medium / Low]

**User Story**: [P1 / P2 / P3]

**Scenario**: [Reference scenario number, e.g., 2.3a]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots/Video**:
[Attach if applicable]

**Environment**:
- Browser: [Chrome 120, Firefox 115, etc.]
- OS: [Windows 11, macOS 14, etc.]
- Viewport: [1920x1080, 375x667, etc.]

**Console Errors**:
[Any errors from browser console]
```

---

## Test Coverage Summary

| User Story | Scenarios | Coverage |
|------------|-----------|----------|
| P1: Landing Page | 6 scenarios | 100% of FR-001 to FR-005 |
| P2: Authentication | 6 scenarios | 100% of FR-006 to FR-013 |
| P3: Dashboard | 11 scenarios | 100% of FR-014 to FR-024 |
| Cross-Cutting | 5 scenarios | Edge cases, security, accessibility |
| Performance | 4 tests | All success criteria |

**Total Scenarios**: 32

**Estimated Testing Time**: 4-6 hours for complete manual testing
