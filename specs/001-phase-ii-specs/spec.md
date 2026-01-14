# Feature Specification: Phase II Technical Specifications

**Feature Branch**: `001-phase-ii-specs`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Generate high-fidelity technical specifications for Phase II. 1. Database Spec: Update @specs/database/schema.md for PostgreSQL with User-Task relationships (1:N). 2. API Spec: Define @specs/api/rest-endpoints.md ensuring standard REST verbs and JWT protection. 3. Auth Spec: Detail the handshake between Better-Auth (TS) and FastAPI (Py) in @specs/skills/auth-bridge.md. 4. UI Spec: Define components for Task CRUD and Auth in @specs/ui/components.md."

## Clarifications

### Session 2026-01-13

- Q: What is the target response time for API endpoints under normal load? → A: Keep p95 < 200ms (balanced, current spec value, industry standard)
- Q: Which password hashing algorithm should be used for storing user passwords? → A: bcrypt (industry standard, proven security, wide support)
- Q: What is the maximum number of tasks a single user should be able to create? → A: No enforced limit (simplest implementation, add limits if needed later)
- Q: What are the minimum password strength requirements for user registration? → A: Minimum 8 characters, uppercase, lowercase, number (balanced security, industry standard)
- Q: Should the GET /api/tasks endpoint support pagination for users with many tasks? → A: Yes, paginate with limit=50 default (prevents performance issues, scalable from start)

## User Scenarios & Testing

### User Story 1 - Database Schema Foundation (Priority: P1)

As a system architect, I need a well-defined PostgreSQL database schema that establishes the foundational data model for Phase II, including user authentication data and task management with proper relationships, constraints, and indexes.

**Why this priority**: The database schema is the foundation of the entire Phase II system. All other layers (backend API, frontend) depend on this data model. Without a clear schema definition, we cannot proceed with implementation.

**Independent Test**: Can be fully tested by reviewing the schema definition for completeness (tables, columns, types, constraints, relationships, indexes), validating it creates successfully in a PostgreSQL instance, and verifying it supports all Phase II user scenarios without requiring schema changes.

**Acceptance Scenarios**:

1. **Given** the Phase II application requires user authentication, **When** the database schema is reviewed, **Then** it includes a users table with fields for authentication (id, email, password_hash, created_at, updated_at, etc.)
2. **Given** tasks must belong to specific users, **When** the schema is examined, **Then** it includes a tasks table with a user_id foreign key establishing a 1:N relationship (one user to many tasks)
3. **Given** tasks need to track completion status and timestamps, **When** the tasks table is reviewed, **Then** it includes fields for id, title, description, completed, user_id, created_at, updated_at
4. **Given** the system must enforce data integrity, **When** the schema constraints are examined, **Then** foreign keys, NOT NULL constraints, and indexes are properly defined
5. **Given** the database must support efficient queries, **When** the schema is analyzed, **Then** indexes are present on frequently queried columns (user_id, created_at, completed)

---

### User Story 2 - REST API Contract Definition (Priority: P2)

As a full-stack developer, I need a comprehensive REST API specification that defines all endpoints, request/response schemas, HTTP methods, status codes, error handling, and JWT authentication requirements so that frontend and backend teams can work in parallel with a clear contract.

**Why this priority**: The API contract is the interface between frontend and backend. Once defined, both teams can develop independently against this contract. It depends on the database schema (P1) being defined first but is critical before any implementation begins.

**Independent Test**: Can be tested by reviewing the API specification for completeness (all CRUD operations defined, request/response schemas documented, auth requirements specified, error codes mapped), validating it covers all user scenarios from the database schema, and confirming it follows RESTful conventions.

**Acceptance Scenarios**:

1. **Given** users need to manage tasks, **When** the API spec is reviewed, **Then** it defines endpoints for GET /api/tasks (list), POST /api/tasks (create), GET /api/tasks/:id (read), PUT /api/tasks/:id (update), DELETE /api/tasks/:id (delete)
2. **Given** all task operations must be user-scoped, **When** the API endpoints are examined, **Then** each endpoint requires JWT authentication and specifies user_id extraction from token
3. **Given** API consumers need clear contracts, **When** request/response schemas are reviewed, **Then** each endpoint documents expected JSON structure with field names, types, required/optional flags, and validation rules
4. **Given** the system must handle errors gracefully, **When** the API spec is analyzed, **Then** it defines error response structure and maps scenarios to HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
5. **Given** the API follows REST conventions, **When** endpoint paths and methods are examined, **Then** they use standard HTTP verbs (GET for read, POST for create, PUT for update, DELETE for delete) and resource-based URLs

---

### User Story 3 - Authentication Bridge Specification (Priority: P1)

As a security engineer, I need a detailed specification of the authentication handshake between Better Auth (Next.js frontend) and FastAPI (Python backend) using JWT tokens, including token generation, verification, secret management, and error handling, to ensure secure and consistent auth across layers.

**Why this priority**: Authentication is critical for security and must be correctly implemented before any protected features. It's a prerequisite for the API endpoints (P2) since they all require JWT verification. This bridges the frontend and backend auth systems.

**Independent Test**: Can be tested by reviewing the auth-bridge specification for completeness (token structure, signing algorithm, secret management, verification flow, error scenarios), validating it defines clear contracts for both frontend (Better Auth) and backend (FastAPI), and confirming it follows industry-standard JWT practices.

**Acceptance Scenarios**:

1. **Given** users need to authenticate, **When** the auth-bridge spec is reviewed, **Then** it defines how Better Auth issues JWT tokens with user_id claim after successful login
2. **Given** the backend must verify tokens, **When** the JWT verification flow is examined, **Then** it specifies using a shared secret (BETTER_AUTH_SECRET environment variable), HS256 algorithm, and extracting user_id from the 'sub' claim
3. **Given** both systems must share configuration, **When** secret management is reviewed, **Then** it defines BETTER_AUTH_SECRET as a shared environment variable accessible to both Next.js and FastAPI, never committed to version control, stored in deployment platform secrets
4. **Given** invalid tokens must be rejected, **When** error handling is examined, **Then** it specifies returning 401 Unauthorized for missing, expired, or invalid tokens with appropriate error messages
5. **Given** protected endpoints need user context, **When** the FastAPI integration pattern is reviewed, **Then** it defines a get_current_user dependency injection function that extracts and returns user_id from verified tokens

---

### User Story 4 - UI Component Specifications (Priority: P3)

As a frontend developer, I need clear component specifications that define the structure, behavior, props, states, and interactions for all Task CRUD and Authentication UI components so I can implement a consistent, accessible, and user-friendly interface.

**Why this priority**: UI components depend on the API contract (P2) and auth-bridge (P1) being defined. While important for user experience, the UI is the last layer in the dependency chain and can be built once the underlying systems are specified.

**Independent Test**: Can be tested by reviewing the UI component specs for completeness (component hierarchy, props/state definitions, user interactions, loading/error states, accessibility requirements), validating they map to all API endpoints, and confirming they follow Next.js 15 + Better Auth patterns.

**Acceptance Scenarios**:

1. **Given** users need to authenticate, **When** the auth component specs are reviewed, **Then** they define LoginForm, SignupForm, and AuthGuard components with clear props, state management, and Better Auth integration
2. **Given** users need to manage tasks, **When** the task component specs are examined, **Then** they define TaskList, TaskItem, TaskForm (create/edit), and TaskDeleteConfirm components with CRUD interactions
3. **Given** components must handle async operations, **When** state management is reviewed, **Then** each component specifies loading, error, and success states with appropriate UI feedback
4. **Given** the UI must be accessible, **When** component specs are analyzed, **Then** they define semantic HTML, ARIA labels, keyboard navigation, and focus management requirements
5. **Given** components must integrate with the API, **When** API interactions are examined, **Then** each component specifies which API endpoints it calls, how it includes JWT tokens, and how it handles 401/403 errors

---

### Edge Cases

- What happens when database migrations fail during schema evolution? (Migration rollback procedures needed)
- What happens when the shared JWT secret (BETTER_AUTH_SECRET) is rotated? (Token invalidation and user re-authentication required)
- What happens when API endpoints receive requests with expired JWTs? (401 error with clear message, frontend triggers re-authentication)
- What happens when a user tries to access another user's tasks? (403 Forbidden, no data leakage in error message)
- What happens when database connection pool is exhausted? (Backend returns 503 Service Unavailable, implements connection retry logic)
- What happens when frontend components lose network connectivity? (Graceful error messages, retry mechanisms, offline state indicators)
- What happens when request/response schemas change (API versioning)? (Breaking changes require version bump, non-breaking changes are additive)
- What happens when JWT token size exceeds cookie limits? (Use httpOnly cookies with reasonable token size, consider session store for large payloads)

## Requirements

### Functional Requirements

**Database Schema (specs/database/schema.md)**:

- **FR-001**: Database schema MUST define a users table with fields for id (UUID primary key), email (unique, not null), password_hash (bcrypt hashed, not null), created_at (timestamp), updated_at (timestamp)
- **FR-002**: Database schema MUST define a tasks table with fields for id (UUID primary key), title (string, not null, max 200 chars), description (text, nullable), completed (boolean, default false), user_id (UUID foreign key to users.id, not null), created_at (timestamp), updated_at (timestamp)
- **FR-003**: Database schema MUST establish a 1:N relationship between users and tasks via foreign key constraint (tasks.user_id references users.id) with ON DELETE CASCADE
- **FR-004**: Database schema MUST define indexes on frequently queried columns: tasks(user_id), tasks(created_at), tasks(completed), users(email)
- **FR-005**: Database schema MUST specify PostgreSQL-specific features: UUID generation (gen_random_uuid()), timestamp defaults (CURRENT_TIMESTAMP), and automatic updated_at triggers
- **FR-006**: Database schema MUST include migration strategy: versioned migration files, forward and rollback scripts, and instructions for applying to Neon Serverless PostgreSQL

**REST API Endpoints (specs/api/rest-endpoints.md)**:

- **FR-007**: API spec MUST define authentication endpoints: POST /api/auth/register (validate password: minimum 8 characters with at least one uppercase, lowercase, and number; bcrypt hash before storage), POST /api/auth/login (bcrypt verify against stored hash), POST /api/auth/logout, GET /api/auth/me (with request/response schemas)
- **FR-008**: API spec MUST define task CRUD endpoints: GET /api/tasks (list user's tasks with pagination: default limit=50, accepts limit and offset query parameters, returns total count), POST /api/tasks (create task), GET /api/tasks/:id (get single task), PUT /api/tasks/:id (update task), DELETE /api/tasks/:id (delete task)
- **FR-009**: API spec MUST specify request schemas with field names, types, required/optional flags, and validation rules for each endpoint
- **FR-010**: API spec MUST specify response schemas with field names, types, and example payloads for success (200, 201, 400, 401, 403, 404, 422, 500) and error cases
- **FR-011**: API spec MUST indicate which endpoints require JWT authentication (all /api/tasks/* endpoints require Bearer token in Authorization header)
- **FR-012**: API spec MUST define error response structure: consistent JSON format with 'error' (string message) and 'detail' (optional object with field-level errors)
- **FR-013**: API spec MUST follow REST conventions: GET for retrieval, POST for creation, PUT for full update, DELETE for removal, and resource-based URL paths

**Auth-Bridge Specification (specs/skills/auth-bridge.md)**:

- **FR-014**: Auth-bridge spec MUST define JWT token structure: header (alg: HS256, typ: JWT), payload (sub: user_id, exp: expiration timestamp, iat: issued at timestamp)
- **FR-015**: Auth-bridge spec MUST specify token generation flow: Better Auth issues JWT after successful login with user_id in 'sub' claim, signs with BETTER_AUTH_SECRET, sets expiration (e.g., 24 hours)
- **FR-016**: Auth-bridge spec MUST specify token verification flow: FastAPI extracts token from Authorization: Bearer header, decodes with BETTER_AUTH_SECRET, validates signature and expiration, extracts user_id from 'sub' claim
- **FR-017**: Auth-bridge spec MUST define secret management: BETTER_AUTH_SECRET environment variable shared between frontend and backend, minimum 32 characters, never committed to version control, stored in deployment platform secrets
- **FR-018**: Auth-bridge spec MUST define error handling: missing token returns 401 with "Authorization header required", expired token returns 401 with "Token expired", invalid signature returns 401 with "Invalid token"
- **FR-019**: Auth-bridge spec MUST provide FastAPI implementation pattern: get_current_user() dependency injection function using HTTPBearer security scheme and PyJWT library
- **FR-020**: Auth-bridge spec MUST provide Next.js implementation pattern: Better Auth configuration with JWT secret, getAuthToken() helper function to extract token from session/cookie

**UI Component Specifications (specs/ui/components.md)**:

- **FR-021**: UI spec MUST define authentication components: LoginForm (email/password inputs, submit button, error display), SignupForm (email/password/confirmPassword inputs, client-side validation for password strength: minimum 8 characters with at least one uppercase, lowercase, and number, submit button), AuthGuard (wrapper component for protected routes)
- **FR-022**: UI spec MUST define task management components: TaskList (displays user's tasks with pagination controls: previous/next buttons, page indicator, handles offset-based pagination with 50 items per page), TaskItem (single task display with edit/delete actions), TaskForm (create/edit form with title/description inputs), TaskDeleteConfirm (confirmation modal)
- **FR-023**: UI spec MUST specify component props and state: each component lists prop types (TypeScript interfaces), required/optional flags, default values, and internal state variables
- **FR-024**: UI spec MUST define component interactions: click handlers, form submissions, API calls (which endpoint, request payload, response handling), loading/error/success states
- **FR-025**: UI spec MUST specify accessibility requirements: semantic HTML elements (button, form, input), ARIA labels for screen readers, keyboard navigation support (tab order, enter/escape keys), focus management
- **FR-026**: UI spec MUST define styling approach: Tailwind CSS utility classes, responsive breakpoints (mobile-first), dark mode support (if applicable), consistent spacing/typography using design tokens
- **FR-027**: UI spec MUST specify component architecture: Server Components by default (TaskList, TaskItem display), Client Components only when needed ('use client' for TaskForm, LoginForm with event handlers), component composition patterns

### Non-Functional Requirements

**Performance**:

- **NFR-001**: All API endpoints MUST respond within 200ms at the 95th percentile (p95) under normal load conditions

**Security**:

- **NFR-002**: User passwords MUST be hashed using bcrypt algorithm with a cost factor of at least 12 (provides strong security while maintaining reasonable authentication performance)
- **NFR-003**: User passwords MUST meet minimum strength requirements: at least 8 characters with at least one uppercase letter, one lowercase letter, and one number (validated on both frontend and backend)

### Key Entities

**Database Layer**:

- **User**: Represents an authenticated user account with email and password credentials. One user can own many tasks (1:N relationship). Key attributes: unique email, securely hashed password, account timestamps.
- **Task**: Represents a todo item owned by a specific user. Many tasks belong to one user (N:1 relationship). Key attributes: title (required, max 200 chars), description (optional), completion status (boolean), ownership (user_id foreign key), timestamps.

**API Layer**:

- **AuthRequest**: Represents authentication requests (login/register) with email and password fields.
- **AuthResponse**: Represents authentication responses with JWT token and user information.
- **TaskRequest**: Represents task creation/update requests with title, description, and completed fields.
- **TaskResponse**: Represents task data responses with all task fields including id, user_id, and timestamps.
- **ErrorResponse**: Represents error responses with consistent structure for all error scenarios.

**Frontend Layer**:

- **AuthState**: Represents authentication state in the frontend with user info, token, and loading/error states.
- **TaskState**: Represents task management state with task list, active task (for editing), and UI state (loading, error, filters).
- **FormState**: Represents form component state with input values, validation errors, and submission status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Database schema specification enables developers to create all required tables and relationships in PostgreSQL without ambiguity or missing information (100% schema completeness)
- **SC-002**: API specification allows frontend and backend teams to develop independently with a clear contract, reducing integration bugs by 80% compared to ad-hoc development
- **SC-003**: Auth-bridge specification ensures secure JWT implementation with zero authentication bypass vulnerabilities in security review
- **SC-004**: UI component specification provides sufficient detail for frontend developers to implement all components without requiring clarification questions (90% specification clarity)
- **SC-005**: All four specifications collectively cover 100% of Phase II MVP requirements (user authentication + task CRUD) with no gaps requiring additional specification work
- **SC-006**: Database schema supports efficient queries for all API endpoints with response times under 200ms for p95 percentile (via proper indexing)
- **SC-007**: API specification defines error handling that results in 95% of users understanding error messages and knowing how to resolve issues
- **SC-008**: UI component specification ensures accessibility compliance (WCAG 2.1 AA) for all interactive elements, verified by automated and manual testing

## Assumptions

- PostgreSQL is the chosen database (industry-standard RDBMS, supports Neon Serverless)
- UUID is used for primary keys (better for distributed systems, no collision risk)
- Better Auth is the chosen frontend authentication library (modern, JWT-based, Next.js optimized)
- PyJWT is the chosen backend JWT library (industry-standard for Python, actively maintained)
- HS256 (HMAC-SHA256) is the JWT signing algorithm (symmetric, simpler for single-backend architecture)
- JWT tokens expire after 24 hours (reasonable balance between security and user experience)
- httpOnly cookies are used for token storage in frontend (prevents XSS attacks)
- FastAPI dependency injection is used for auth (framework best practice, testable)
- Next.js 15 App Router is used (latest stable version, Server Components architecture)
- Tailwind CSS is the styling framework (utility-first, consistent with project standards)
- All API endpoints return JSON (standard for modern REST APIs)
- Task title has 200 character limit (reasonable for user-visible task names)
- Task description is unlimited length (allows detailed task notes)
- No limit on number of tasks per user (simplifies MVP implementation, can add limits later if abuse patterns emerge)
- Task list endpoint uses pagination with default limit of 50 items (prevents performance issues as users accumulate tasks)
- ON DELETE CASCADE for tasks when user is deleted (task ownership is strict)
- Timestamps use UTC timezone (avoids timezone conversion issues)
- Connection pooling is configured for Neon (serverless best practice)

## Out of Scope

**For This Specification Phase**:

- Actual implementation code (will be covered in plan.md and tasks.md)
- Specific library versions or dependency management (covered in implementation)
- Deployment configuration or infrastructure setup (separate deployment spec)
- Performance testing methodology or load testing procedures (separate testing spec)
- CI/CD pipeline configuration (separate DevOps spec)
- Database backup and disaster recovery procedures (separate operations spec)
- API rate limiting or throttling implementation (may add in future iterations)
- API versioning strategy (may add if breaking changes anticipated)
- Task categories, tags, or priorities (Phase III features)
- Task due dates or reminders (Phase III features)
- Task sharing or collaboration (Phase III features)
- Multi-factor authentication (Phase III security enhancement)
- OAuth or social login providers (Phase III authentication expansion)
- Real-time updates or WebSocket connections (Phase III feature)
- File attachments for tasks (Phase III feature)
- Search functionality (Phase III feature)
- Internationalization or localization (Phase III feature)
- Mobile native apps (Phase III platform expansion)
- Dark mode implementation details (UI feature, not in core spec)

## Dependencies

**External Dependencies**:

- Neon Serverless PostgreSQL service (database hosting)
- Better Auth library (frontend authentication)
- PyJWT library (backend JWT verification)
- Next.js 15 framework (frontend framework)
- FastAPI framework (backend framework)
- SQLModel library (backend ORM)
- Tailwind CSS framework (frontend styling)

**Internal Dependencies** (Specification Order):

1. **Database Schema (P1)**: Must be defined first - all other specs depend on data model
2. **Auth-Bridge (P1)**: Must be defined before API endpoints - API depends on auth mechanism
3. **API Specification (P2)**: Must be defined before UI components - UI depends on API contract
4. **UI Components (P3)**: Defined last - depends on API and auth being specified

**Coordination Requirements**:

- Database schema and API request/response models must align (same field names, types, constraints)
- Auth-bridge JWT claims must match what API endpoints expect (user_id in 'sub' claim)
- API error responses must map to UI error display patterns (consistent error structure)
- UI components must call correct API endpoints with proper request schemas
