# Implementation Plan: Phase II Cloud-Native Full-Stack Todo Application

**Branch**: `001-phase-ii-specs` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase-ii-specs/spec.md`

## Summary

Evolve Phase I (in-memory Python CLI todo app) into Phase II (cloud-native full-stack web application) using a multi-phase implementation strategy. The approach separates concerns into Backend Infrastructure (FastAPI + Neon DB), Security Layer (JWT auth-bridge), Frontend Foundation (Next.js 15 + Better Auth), Core Feature Migration (Phase I logic → web dashboard), and Testing & Synchronization (zero-drift verification).

**Key Innovation**: Layered implementation enabling parallel development after database foundation. Backend and auth can progress independently, followed by frontend consuming the established API contract.

## Technical Context

**Language/Version**:
- Backend: Python 3.11+ (FastAPI ecosystem)
- Frontend: TypeScript 5.x (Next.js 15 requirement)
- Database: PostgreSQL 15+ (Neon Serverless)

**Primary Dependencies**:
- Backend: FastAPI 0.109+, SQLModel 0.0.14+, PyJWT/python-jose 3.3+, Pydantic 2.x, uvicorn, passlib[bcrypt]
- Frontend: Next.js 15.x, React 18+, Better Auth 1.x, Tailwind CSS 3.x, TypeScript 5.x
- Database: Neon Serverless PostgreSQL, psycopg2-binary/asyncpg

**Storage**:
- Production: Neon Serverless PostgreSQL (cloud-hosted, autoscaling)
- Development: Local PostgreSQL or Neon development branch
- Session: Better Auth manages auth sessions, backend stateless (JWT only)

**Testing**:
- Backend: pytest + pytest-asyncio (API tests), httpx (async client tests)
- Frontend: Vitest + React Testing Library (component tests), Playwright (E2E)
- Integration: Contract tests between frontend API client and backend endpoints
- Security: JWT token validation tests, user_id scoping verification

**Target Platform**:
- Backend: Linux server (containerizable, serverless-friendly)
- Frontend: Next.js App Router (Vercel deployment recommended)
- Database: Neon Serverless (PostgreSQL-compatible)
- Browsers: Modern evergreen browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

**Project Type**: Web (full-stack with separate frontend/backend)

**Performance Goals**:
- API: <200ms p95 latency for CRUD operations
- Frontend: First Contentful Paint <1.5s, Time to Interactive <3.5s
- Database: Queries optimized with indexes (<50ms for user-scoped task queries)
- Concurrent Users: Support 1000+ concurrent users (Neon autoscaling)

**Constraints**:
- Security: All user data must be scoped by user_id (no cross-user data leakage)
- Auth: JWT tokens expire after 24 hours (no infinite sessions)
- Database: Neon connection pooling (max 100 connections, configure pool size)
- Frontend: Server Components default (Client Components only when necessary)
- Compatibility: No IE11 support (modern browsers only)

**Scale/Scope**:
- MVP: 2 database tables (users, tasks), 9 API endpoints (4 auth + 5 tasks), 7 UI components
- Users: Initially <10k users, scalable to 100k+ with Neon autoscaling
- Data: Unlimited tasks per user (paginated queries with limit/offset)
- Features: Phase II scope limited to authentication + task CRUD (no categories, tags, sharing, etc.)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Phase II Governance Framework Compliance** (Initial Check):

### The Three Pillars ✅

1. **Spec-Driven Development (SDD)**: ✅ PASS
   - Specification exists: `specs/001-phase-ii-specs/spec.md` (4 user stories, 27 functional requirements)
   - Technical specs exist: `specs/database/schema.md`, `specs/api/rest-endpoints.md`, `specs/skills/auth-bridge.md`, `specs/ui/components.md`
   - Implementation plan (this document) derives from specifications
   - Tasks will be generated from plan via `/sp.tasks` command

2. **Agent-Based Delegation**: ✅ PASS
   - Backend work → python-api-backend agent (`.claude/agents/python-api-backend.md`)
   - Frontend work → nextjs-frontend-specialist agent (`.claude/agents/nextjs-frontend-specialist.md`)
   - Integration coordination → full-stack-orchestrator agent (main architect)
   - Clear boundaries: backend = FastAPI/database, frontend = Next.js/UI

3. **Skill-Powered Intelligence**: ✅ PASS
   - `auth-bridge-skill` referenced for JWT verification (`.claude/skills/auth-bridge.md`, `specs/skills/auth-bridge.md`)
   - `database-ops-skill` referenced for Neon PostgreSQL connection (`.claude/skills/database-ops.md`)
   - `api-sync-skill` referenced for type synchronization (`.claude/skills/api-sync.md`)
   - All authentication logic follows auth-bridge patterns
   - All database operations follow database-ops patterns
   - All API contracts follow api-sync patterns

### The Four Guarantees ✅

1. **Zero Drift**: ✅ PLANNED
   - Database schema (`specs/database/schema.md`) defines source of truth for field names/types
   - Backend Pydantic models mirror database schema (SQLModel ensures this)
   - Frontend TypeScript interfaces mirror backend Pydantic models
   - Synchronization checklist defined in governance framework (will be verified in Phase E: Testing & Sync)

2. **Auth First**: ✅ PLANNED
   - Phase B dedicated to Security Layer (auth-bridge implementation)
   - All protected endpoints verify JWT before Phase D (Core Feature Migration)
   - No task operations accessible without valid user_id from JWT token
   - Auth completion criteria: JWT verification, user_id extraction, 401 error handling, frontend auth guards

3. **Context Synchronization**: ✅ PLANNED
   - Phase A (Backend Infrastructure) → Phase B (Security Layer) → Phase C (Frontend Foundation) sequential dependencies
   - Phase D (Core Feature Migration) coordinates backend + frontend in sync
   - Phase E (Testing & Sync) validates synchronization with integration tests
   - Agent delegation ensures changes propagate across layers

4. **Traceability**: ✅ PASS
   - PHR created for specification phase (`history/prompts/001-phase-ii-specs/0001-*.spec.prompt.md`)
   - PHR will be created for plan phase (this document)
   - PHRs will be created for tasks phase, implementation phases (red, green, refactor)
   - ADR suggestions triggered for significant decisions (e.g., technology stack choice)

### Quality Standards Compliance ✅

**Code Quality**: ✅ PLANNED
- Backend: PEP 8, type hints everywhere, docstrings, pytest coverage
- Frontend: TypeScript strict mode, ESLint, Prettier, component tests
- Both: Smallest viable change principle, no over-engineering

**Security Standards**: ✅ PLANNED
- JWT verification on all protected endpoints
- user_id scoping on all database queries
- BETTER_AUTH_SECRET environment variable (never committed)
- Input validation (Pydantic backend, TypeScript frontend)
- SQL injection prevention (SQLModel parameterized queries)

**Performance Standards**: ✅ PLANNED
- Database indexes on user_id, created_at, completed, email
- Connection pooling configured for Neon
- Frontend code splitting, lazy loading, next/image optimization
- API response times monitored (target <200ms p95)

### Gate Evaluation (Initial): ✅ PASS

**No Constitution Violations Detected**. Proceed to Phase 0: Outline & Research.

---

### Constitution Check Re-Evaluation (After Phase 1 Design Artifacts)

**Date**: 2026-01-07
**Artifacts Reviewed**:
- ✅ `specs/001-phase-ii-specs/data-model.md` (User & Task entities, field mappings, validation strategy)
- ✅ `specs/001-phase-ii-specs/contracts/auth-openapi.yaml` (OpenAPI spec for authentication endpoints)
- ✅ `specs/001-phase-ii-specs/contracts/tasks-openapi.yaml` (OpenAPI spec for task endpoints)
- ✅ `specs/001-phase-ii-specs/quickstart.md` (Developer onboarding guide with environment setup)
- ✅ `CLAUDE.md` (Updated with Phase II technologies)

**Verification Results**:

1. **Spec-Driven Development (SDD)**: ✅ VERIFIED
   - Complete data model specification exists with cross-layer field mappings (database → API → frontend)
   - OpenAPI contracts formalize API behavior (request/response schemas, error codes, authentication requirements)
   - Quickstart guide enables developers to follow specifications for implementation
   - No implementation code exists yet (specs first, code later)

2. **Agent-Based Delegation**: ✅ VERIFIED
   - Agent context file (`CLAUDE.md`) updated with Phase II technologies for delegation clarity
   - Clear separation of concerns in specifications:
     - Backend: `specs/database/schema.md`, `specs/api/rest-endpoints.md`, `contracts/*-openapi.yaml`
     - Frontend: `specs/ui/components.md`, Better Auth integration in quickstart
     - Auth-Bridge: `specs/skills/auth-bridge.md` defines cross-layer JWT handshake
   - Delegation boundaries remain intact (no overlapping agent responsibilities)

3. **Skill-Powered Intelligence**: ✅ VERIFIED
   - Auth-bridge skill patterns documented in `specs/skills/auth-bridge.md` and `contracts/auth-openapi.yaml`
   - Database-ops skill patterns implicit in `specs/database/schema.md` (connection pooling, migration strategy, query patterns)
   - API-sync skill patterns encoded in `data-model.md` (field name mappings, case conversion rules, timestamp handling)

4. **Zero Drift Guarantee**: ✅ VERIFIED
   - `data-model.md` includes comprehensive field mapping tables (database ↔ API ↔ frontend)
   - Case conversion rules documented (`snake_case` → `camelCase` transformations)
   - Type conversion rules documented (UUID → string, datetime → ISO 8601 → Date)
   - OpenAPI schemas enforce API contract consistency

5. **Auth First Guarantee**: ✅ VERIFIED
   - `auth-openapi.yaml` defines complete authentication contract before task endpoints
   - All task endpoints in `tasks-openapi.yaml` require `BearerAuth` security scheme
   - Quickstart guide includes JWT token setup and verification steps
   - Auth-bridge specification establishes JWT verification pattern

6. **Context Synchronization Guarantee**: ✅ VERIFIED
   - Quickstart guide provides end-to-end setup (database → backend → frontend)
   - OpenAPI contracts enable automated client generation (zero drift via code generation)
   - Data model explicitly documents transformation rules across layers

7. **Traceability Guarantee**: ✅ VERIFIED (pending PHR creation)
   - Specification phase PHR exists (`history/prompts/001-phase-ii-specs/0001-*.spec.prompt.md`)
   - Planning phase PHR pending (will be created after this re-evaluation)
   - ADR suggestions documented in plan (3 architectural decisions)

**Quality Standards**:
- ✅ OpenAPI specs follow OpenAPI 3.0.3 standard
- ✅ Data model includes validation rules at all layers
- ✅ Quickstart guide includes troubleshooting section for common issues
- ✅ Security best practices documented (httpOnly cookies, secret management, user-scoped queries)

**Final Gate Evaluation**: ✅ PASS

**Recommendation**: Proceed to Phase 2 (Multi-Phase Implementation Strategy execution). All design artifacts are complete, consistent, and compliant with Phase II Governance Framework.

## Multi-Phase Implementation Strategy

The implementation follows a layered approach (Phases A through E) enabling parallel development where appropriate while respecting dependencies:

```
Phase A: Backend Infrastructure (Foundation)
    ↓
Phase B: Security Layer (Auth-Bridge) ──┐
    ↓                                    │ (Can develop in parallel)
Phase C: Frontend Foundation ───────────┘
    ↓
Phase D: Core Feature Migration (Coordinated)
    ↓
Phase E: Testing & Sync (Validation)
```

### Phase A: Backend Infrastructure (FastAPI + Neon DB + SQLModel)

**Objective**: Establish backend foundation with database connection, schema migrations, and FastAPI server setup.

**Prerequisites**: None (first phase)

**Agent**: python-api-backend

**Deliverables**:
1. **Database Connection** (`backend/app/database.py`):
   - `create_engine()` with Neon DATABASE_URL
   - `get_session()` FastAPI dependency for session management
   - `init_db()` function to create tables on startup
   - Connection pooling configuration (pool_size=5, max_overflow=10)

2. **SQLModel Models** (`backend/app/models/`):
   - `User` model matching `specs/database/schema.md` (id, email, password_hash, created_at, updated_at)
   - `Task` model matching `specs/database/schema.md` (id, title, description, completed, user_id, created_at, updated_at)
   - Relationships defined (Task.user → User)
   - Triggers for auto-updating updated_at (handled at DB level)

3. **Database Migrations** (`backend/migrations/`):
   - `001_initial_schema.sql` (create users + tasks tables with constraints/indexes)
   - `001_initial_schema_rollback.sql` (drop tables, functions, triggers)
   - Migration application script or Alembic configuration

4. **FastAPI Application Setup** (`backend/app/main.py`):
   - FastAPI app initialization
   - CORS middleware configuration (allow frontend origin)
   - Database initialization on startup event
   - Health check endpoint (GET /health)
   - Environment variable loading (.env support)

**Acceptance Criteria**:
- [ ] FastAPI server starts successfully (uvicorn app.main:app)
- [ ] Database connection established to Neon PostgreSQL
- [ ] SQLModel tables created in database (users, tasks)
- [ ] Health check endpoint returns 200 OK
- [ ] Environment variables loaded (DATABASE_URL, BETTER_AUTH_SECRET)
- [ ] No manual schema creation (SQLModel.metadata.create_all or migration script)

**Testing**:
- Database connection test (verify engine connects)
- Model creation test (verify tables exist with correct columns)
- Health endpoint test (GET /health returns {"status": "healthy"})

**Files Modified/Created**:
- `backend/app/main.py` (new)
- `backend/app/database.py` (new)
- `backend/app/models/user.py` (new)
- `backend/app/models/task.py` (new)
- `backend/migrations/001_initial_schema.sql` (new)
- `backend/.env.example` (new - template for environment variables)
- `backend/pyproject.toml` or `requirements.txt` (dependencies)

---

### Phase B: Security Layer (Auth-Bridge Skill Implementation)

**Objective**: Implement JWT verification bridge between Better Auth (frontend) and FastAPI (backend) following `specs/skills/auth-bridge.md`.

**Prerequisites**: Phase A complete (database models exist for User table)

**Agent**: python-api-backend

**Deliverables**:
1. **JWT Verification Module** (`backend/app/auth.py`):
   - `get_current_user()` FastAPI dependency using HTTPBearer security
   - JWT token decoding with PyJWT/python-jose
   - Secret key from BETTER_AUTH_SECRET environment variable
   - User ID extraction from 'sub' claim
   - Error handling (401 for missing/expired/invalid tokens)
   - `create_access_token()` helper for login endpoint

2. **Password Hashing Utilities** (`backend/app/auth.py` or `backend/app/utils/security.py`):
   - `hash_password()` using bcrypt (passlib)
   - `verify_password()` for login verification
   - Minimum cost factor 12 for bcrypt

3. **Authentication Endpoints** (`backend/app/routes/auth.py`):
   - POST /api/auth/register (create user, hash password, return user data)
   - POST /api/auth/login (verify credentials, generate JWT, return token + user)
   - POST /api/auth/logout (stateless, just return success)
   - GET /api/auth/me (protected, return current user from JWT)

4. **Request/Response Models** (`backend/app/models/requests.py`, `backend/app/models/responses.py`):
   - `RegisterRequest` (email, password)
   - `LoginRequest` (email, password)
   - `AuthResponse` (access_token, token_type, user)
   - `UserResponse` (id, email, created_at)

**Acceptance Criteria**:
- [ ] JWT tokens generated with HS256 algorithm, 24-hour expiration
- [ ] Tokens include user_id in 'sub' claim
- [ ] `get_current_user()` dependency extracts user_id from valid tokens
- [ ] `get_current_user()` raises 401 HTTPException for invalid/expired tokens
- [ ] POST /api/auth/register creates user with hashed password
- [ ] POST /api/auth/login returns JWT token after credential verification
- [ ] GET /api/auth/me returns user data for authenticated requests
- [ ] All auth endpoints follow `specs/api/rest-endpoints.md` contracts

**Testing**:
- Register user test (verify password hashed, user created)
- Login success test (valid credentials → JWT token returned)
- Login failure test (invalid credentials → 401 error)
- Token verification test (valid token → user_id extracted)
- Expired token test (expired token → 401 error)
- Invalid token test (malformed token → 401 error)

**Files Modified/Created**:
- `backend/app/auth.py` (new)
- `backend/app/routes/auth.py` (new)
- `backend/app/models/requests.py` (new)
- `backend/app/models/responses.py` (new)
- `backend/app/main.py` (modified - include auth routes)

---

### Phase C: Frontend Foundation (Next.js 15 + Better Auth Integration)

**Objective**: Set up Next.js 15 App Router project with Better Auth, Tailwind CSS, and TypeScript, establishing frontend authentication foundation.

**Prerequisites**: Phase B complete (backend auth endpoints available for testing)

**Agent**: nextjs-frontend-specialist

**Deliverables**:
1. **Next.js 15 Project Setup** (`frontend/`):
   - `npx create-next-app@latest` with TypeScript + Tailwind CSS + App Router
   - ESLint + Prettier configuration
   - Environment variables setup (.env.local with BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL)

2. **Better Auth Configuration** (`frontend/lib/auth.ts`):
   - Better Auth initialization with JWT plugin
   - Shared secret (BETTER_AUTH_SECRET) matching backend
   - Token expiration 24 hours (matching backend)
   - Session management (httpOnly cookies)

3. **API Client Module** (`frontend/lib/api-client.ts`):
   - `apiClient<T>()` generic fetch wrapper
   - Automatic Authorization header with JWT token
   - Error handling (401 → redirect to login)
   - TypeScript return type inference

4. **TypeScript Type Definitions** (`frontend/lib/types.ts`):
   - `User` interface (id, email, created_at)
   - `Task` interface (id, title, description, completed, user_id, created_at, updated_at)
   - `AuthResponse` interface (access_token, token_type, user)
   - API response types matching `specs/api/rest-endpoints.md`

5. **Authentication Components** (per `specs/ui/components.md`):
   - `LoginForm` component (`frontend/components/auth/LoginForm.tsx`)
   - `SignupForm` component (`frontend/components/auth/SignupForm.tsx`)
   - `AuthGuard` wrapper component (`frontend/components/auth/AuthGuard.tsx`)

6. **Authentication Pages**:
   - `/login` page (`frontend/app/login/page.tsx`)
   - `/signup` page (`frontend/app/signup/page.tsx`)
   - Landing page redirect logic (authenticated → /dashboard, unauthenticated → /login)

7. **Tailwind CSS Configuration**:
   - Color palette (primary: blue-600, error: red-600, etc.)
   - Typography scale
   - Responsive breakpoints

**Acceptance Criteria**:
- [ ] Next.js 15 dev server runs (npm run dev)
- [ ] Better Auth configured with JWT support
- [ ] Login form submits credentials to POST /api/auth/login
- [ ] JWT token stored in httpOnly cookie after successful login
- [ ] API client includes Authorization header with JWT token
- [ ] AuthGuard redirects unauthenticated users to /login
- [ ] TypeScript types match backend Pydantic models
- [ ] Tailwind CSS styling applied to components
- [ ] All components follow `specs/ui/components.md` specifications

**Testing**:
- Login form submission test (mock API, verify request payload)
- API client auth header test (verify Bearer token included)
- AuthGuard redirect test (unauthenticated → /login)
- TypeScript compilation test (no type errors)

**Files Modified/Created**:
- `frontend/package.json` (dependencies)
- `frontend/lib/auth.ts` (new)
- `frontend/lib/api-client.ts` (new)
- `frontend/lib/types.ts` (new)
- `frontend/components/auth/LoginForm.tsx` (new)
- `frontend/components/auth/SignupForm.tsx` (new)
- `frontend/components/auth/AuthGuard.tsx` (new)
- `frontend/app/login/page.tsx` (new)
- `frontend/app/signup/page.tsx` (new)
- `frontend/tailwind.config.ts` (configured)

---

### Phase D: Core Feature Migration (Phase I Logic → Web Dashboard)

**Objective**: Migrate Phase I task CRUD logic to Phase II web application, implementing backend API endpoints and frontend dashboard components in coordinated fashion.

**Prerequisites**: Phases A, B, C complete (infrastructure, auth, frontend foundation ready)

**Agents**: python-api-backend (backend), nextjs-frontend-specialist (frontend), full-stack-orchestrator (coordination)

**Sub-Phase D1: Backend Task API Endpoints**

**Agent**: python-api-backend

**Deliverables**:
1. **Task CRUD Endpoints** (`backend/app/routes/tasks.py`):
   - GET /api/tasks (list all user's tasks with pagination)
   - POST /api/tasks (create new task for authenticated user)
   - GET /api/tasks/:id (get single task if belongs to user)
   - PUT /api/tasks/:id (update task if belongs to user)
   - DELETE /api/tasks/:id (delete task if belongs to user)

2. **Request/Response Models** (`backend/app/models/requests.py`, `backend/app/models/responses.py`):
   - `TaskCreateRequest` (title, description?, completed?)
   - `TaskUpdateRequest` (title?, description?, completed?)
   - `TaskResponse` (id, title, description, completed, user_id, created_at, updated_at)
   - `TaskListResponse` (tasks, total, limit, offset)

3. **Business Logic** (in route handlers or `backend/app/services/tasks.py`):
   - User-scoped queries (filter by user_id from JWT)
   - Input validation (title 1-200 chars, etc.)
   - Error handling (404 for not found, 403 for unauthorized)

**Acceptance Criteria**:
- [ ] All 5 task endpoints implemented per `specs/api/rest-endpoints.md`
- [ ] Every endpoint requires JWT authentication (uses `get_current_user` dependency)
- [ ] All queries filter by user_id (no cross-user data access)
- [ ] Pagination implemented for GET /api/tasks (limit/offset)
- [ ] Error responses follow consistent JSON structure
- [ ] HTTP status codes correct (200, 201, 204, 400, 401, 404, 422)

**Testing**:
- Create task test (authenticated user → task created with user_id)
- List tasks test (user only sees their own tasks)
- Update task test (user can update own task, 404 for others)
- Delete task test (user can delete own task, 404 for others)
- Unauthorized access test (no token → 401, other user's task → 404)

**Files Modified/Created**:
- `backend/app/routes/tasks.py` (new)
- `backend/app/models/requests.py` (modified - add task models)
- `backend/app/models/responses.py` (modified - add task models)
- `backend/app/main.py` (modified - include task routes)

**Sub-Phase D2: Frontend Task Dashboard Components**

**Agent**: nextjs-frontend-specialist

**Deliverables**:
1. **Task Management Components** (per `specs/ui/components.md`):
   - `TaskList` Server Component (`frontend/components/tasks/TaskList.tsx`)
   - `TaskListClient` Client Component (`frontend/components/tasks/TaskListClient.tsx`)
   - `TaskItem` Client Component (`frontend/components/tasks/TaskItem.tsx`)
   - `TaskForm` Client Component (`frontend/components/tasks/TaskForm.tsx`)
   - `TaskDeleteConfirm` Client Component (`frontend/components/tasks/TaskDeleteConfirm.tsx`)

2. **Dashboard Page** (`frontend/app/dashboard/page.tsx`):
   - AuthGuard wrapper (redirect unauthenticated users)
   - TaskList rendering
   - Add task button/form

3. **API Integration**:
   - Task fetching (GET /api/tasks via apiClient)
   - Task creation (POST /api/tasks)
   - Task update (PUT /api/tasks/:id)
   - Task deletion (DELETE /api/tasks/:id)
   - Optimistic updates for better UX

4. **State Management**:
   - Local state for task list (useState)
   - Filter state (all/completed/incomplete)
   - Loading/error states for async operations

**Acceptance Criteria**:
- [ ] Dashboard displays user's tasks fetched from backend
- [ ] Users can create new tasks (form submission → POST /api/tasks)
- [ ] Users can edit tasks (inline edit or modal → PUT /api/tasks/:id)
- [ ] Users can delete tasks (confirmation modal → DELETE /api/tasks/:id)
- [ ] Users can toggle task completion (checkbox → PUT /api/tasks/:id)
- [ ] Filter buttons work (show all/completed/incomplete tasks)
- [ ] Loading states displayed during API calls
- [ ] Error messages shown for failed operations
- [ ] All components match `specs/ui/components.md` specifications

**Testing**:
- Component rendering test (TaskList displays tasks)
- Form submission test (TaskForm calls apiClient with correct payload)
- Delete confirmation test (modal shows, delete on confirm)
- Filter test (completed filter only shows completed tasks)
- Error handling test (API failure → error message displayed)

**Files Modified/Created**:
- `frontend/components/tasks/TaskList.tsx` (new)
- `frontend/components/tasks/TaskListClient.tsx` (new)
- `frontend/components/tasks/TaskItem.tsx` (new)
- `frontend/components/tasks/TaskForm.tsx` (new)
- `frontend/components/tasks/TaskDeleteConfirm.tsx` (new)
- `frontend/app/dashboard/page.tsx` (new)
- `frontend/lib/types.ts` (modified - ensure Task types match backend)

**Sub-Phase D3: Feature Parity Verification**

**Agent**: full-stack-orchestrator (main architect)

**Objective**: Verify Phase II web app achieves feature parity with Phase I CLI app.

**Phase I Feature Checklist**:
- [ ] Add task (title + optional description) → Web: TaskForm component
- [ ] List tasks with status → Web: TaskList component (with filter)
- [ ] Update task (title/description) → Web: TaskForm in edit mode
- [ ] Delete task → Web: TaskDeleteConfirm modal
- [ ] Mark complete/incomplete → Web: Checkbox in TaskItem
- [ ] User session (implicit in CLI) → Web: JWT authentication + user_id scoping

**Migration Notes**:
- Phase I used auto-incrementing integer IDs → Phase II uses UUIDs (better for distributed systems)
- Phase I was single-user → Phase II is multi-user with user_id scoping
- Phase I had no persistence → Phase II persists to PostgreSQL
- Phase I had no authentication → Phase II requires login

**Acceptance Criteria**:
- [ ] All Phase I features replicated in Phase II web app
- [ ] User experience improved (persistent storage, multi-user, web UI)
- [ ] No feature regressions (all CRUD operations work)

---

### Phase E: Testing & Sync (Frontend-Backend Contract Verification)

**Objective**: Ensure zero drift between frontend TypeScript types and backend Pydantic models, verify auth protection, and validate integration.

**Prerequisites**: Phase D complete (all features implemented)

**Agents**: full-stack-orchestrator (coordination), python-api-backend (backend tests), nextjs-frontend-specialist (frontend tests)

**Deliverables**:
1. **Synchronization Checklist Verification** (from governance framework):
   - [ ] Database schema matches backend models (SQLModel)
   - [ ] Backend API contracts match frontend API client (request/response shapes)
   - [ ] TypeScript types match API response shapes (User, Task, AuthResponse, etc.)
   - [ ] Auth requirements consistent across all layers (JWT on all protected endpoints)
   - [ ] Error handling covers all failure modes (401, 403, 404, 422, 500)
   - [ ] Test coverage includes integration points (frontend → backend → database)

2. **Contract Tests** (`backend/tests/contract/`, `frontend/tests/contract/`):
   - API endpoint contract tests (verify request/response schemas match spec)
   - TypeScript type tests (verify frontend types match backend Pydantic models)
   - Auth flow tests (register → login → authenticated request)

3. **Integration Tests** (`backend/tests/integration/`, `frontend/tests/e2e/`):
   - End-to-end user flow (signup → login → create task → list tasks → update → delete → logout)
   - Auth protection tests (unauthenticated access → 401, wrong user → 404)
   - Cross-origin tests (CORS configured correctly)

4. **Auth Completion Criteria Verification**:
   - [ ] Backend routes verify JWT tokens (all /api/tasks/* endpoints)
   - [ ] User context extracted and used in business logic (user_id filtering)
   - [ ] Frontend auth guards prevent unauthorized access (AuthGuard component)
   - [ ] API client includes auth headers (Authorization: Bearer <token>)
   - [ ] Error handling covers auth failures (401 → redirect to login, 403 → access denied)
   - [ ] Tests verify auth behavior (success and failure cases)

5. **Zero Drift Verification Report** (`specs/001-phase-ii-specs/drift-check.md`):
   - Database schema vs SQLModel models comparison
   - Pydantic models vs TypeScript interfaces comparison
   - API contract (spec) vs implementation comparison
   - Discrepancies identified and resolved

**Acceptance Criteria**:
- [ ] All synchronization checklist items pass
- [ ] Contract tests pass (schemas match between layers)
- [ ] Integration tests pass (E2E flows work)
- [ ] Auth protection verified on all protected endpoints
- [ ] Zero drift confirmed (types aligned across all layers)
- [ ] Performance targets met (API <200ms p95, FCP <1.5s)

**Testing**:
- Run backend test suite (pytest backend/tests/)
- Run frontend test suite (npm test in frontend/)
- Run E2E test suite (Playwright tests)
- Manual testing of full user journey

**Files Modified/Created**:
- `backend/tests/contract/test_api_contracts.py` (new)
- `backend/tests/integration/test_task_flow.py` (new)
- `frontend/tests/contract/api-types.test.ts` (new)
- `frontend/tests/e2e/task-management.spec.ts` (new)
- `specs/001-phase-ii-specs/drift-check.md` (new - verification report)

---

## Project Structure

### Documentation (this feature)

```text
specs/001-phase-ii-specs/
├── spec.md                    # Feature specification (completed)
├── plan.md                    # This file (implementation plan)
├── research.md                # Phase 0 output (technology decisions)
├── data-model.md              # Phase 1 output (entity design)
├── quickstart.md              # Phase 1 output (developer onboarding)
├── contracts/                 # Phase 1 output (API contracts)
│   ├── auth-openapi.yaml      # OpenAPI spec for auth endpoints
│   └── tasks-openapi.yaml     # OpenAPI spec for task endpoints
├── drift-check.md             # Phase E output (zero drift verification)
├── checklists/
│   └── requirements.md        # Spec quality checklist (completed)
└── tasks.md                   # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Backend (Python + FastAPI)
backend/
├── app/
│   ├── main.py                # FastAPI application entry point
│   ├── database.py            # Database connection and session management
│   ├── auth.py                # JWT verification and password hashing
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py            # User SQLModel
│   │   ├── task.py            # Task SQLModel
│   │   ├── requests.py        # Pydantic request models
│   │   └── responses.py       # Pydantic response models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py            # Auth endpoints (register, login, logout, me)
│   │   └── tasks.py           # Task CRUD endpoints
│   └── services/              # (Optional) Business logic layer
│       └── tasks.py
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 001_initial_schema_rollback.sql
├── tests/
│   ├── __init__.py
│   ├── conftest.py            # Pytest fixtures
│   ├── contract/
│   │   └── test_api_contracts.py
│   ├── integration/
│   │   ├── test_auth_flow.py
│   │   └── test_task_flow.py
│   └── unit/
│       ├── test_auth.py
│       └── test_models.py
├── .env.example               # Environment variable template
├── pyproject.toml             # UV/Poetry dependencies
└── README.md                  # Backend setup instructions

# Frontend (TypeScript + Next.js 15)
frontend/
├── app/
│   ├── layout.tsx             # Root layout (Server Component)
│   ├── page.tsx               # Landing page (redirect logic)
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── signup/
│   │   └── page.tsx           # Signup page
│   └── dashboard/
│       ├── layout.tsx         # Dashboard layout (AuthGuard)
│       └── page.tsx           # Dashboard page (TaskList)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx      # Client Component
│   │   ├── SignupForm.tsx     # Client Component
│   │   └── AuthGuard.tsx      # Client Component
│   └── tasks/
│       ├── TaskList.tsx       # Server Component
│       ├── TaskListClient.tsx # Client Component
│       ├── TaskItem.tsx       # Client Component
│       ├── TaskForm.tsx       # Client Component
│       └── TaskDeleteConfirm.tsx  # Client Component
├── lib/
│   ├── auth.ts                # Better Auth configuration
│   ├── api-client.ts          # API fetch wrapper
│   └── types.ts               # TypeScript interfaces (User, Task, etc.)
├── tests/
│   ├── contract/
│   │   └── api-types.test.ts
│   └── e2e/
│       └── task-management.spec.ts
├── .env.local.example         # Environment variable template
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind CSS configuration
└── README.md                  # Frontend setup instructions

# Database migrations (optional - if using Alembic instead of manual SQL)
backend/alembic/
├── env.py
├── script.py.mako
└── versions/
    └── 001_initial_schema.py

# Shared documentation
specs/
├── database/schema.md         # Database schema spec (reference)
├── api/rest-endpoints.md      # API endpoints spec (reference)
├── skills/auth-bridge.md      # Auth-bridge spec (reference)
└── ui/components.md           # UI components spec (reference)
```

**Structure Decision**: **Web application (Option 2)** - Separate `backend/` and `frontend/` directories for clear separation of concerns. Backend is Python + FastAPI, frontend is TypeScript + Next.js 15. This structure enables independent deployment (backend to serverless platform, frontend to Vercel) and allows specialized agents to work in isolated directories (python-api-backend in `backend/`, nextjs-frontend-specialist in `frontend/`).

## Complexity Tracking

**No Constitution Violations Detected**. This section is not required.

## Data Flow Architecture

```
User (Browser)
    ↓
[Next.js Frontend - Server Components + Client Components]
    ↓ (HTTPS)
[Better Auth - JWT Token Generation]
    ↓ (httpOnly Cookie + Authorization Header)
[Next.js API Client - apiClient<T>()]
    ↓ (HTTPS + Authorization: Bearer <JWT>)
[FastAPI Backend - CORS Middleware]
    ↓
[Auth Middleware - get_current_user() dependency]
    ↓ (Extract user_id from JWT 'sub' claim)
[Task Routes - FastAPI endpoints]
    ↓ (Filter by user_id)
[SQLModel ORM - Parameterized queries]
    ↓ (SQL via psycopg2/asyncpg)
[Neon Serverless PostgreSQL - users + tasks tables]
    ↓ (Connection pooling)
[Database Response]
    ↑ (SQL results)
[SQLModel Models - User, Task]
    ↑ (Python objects)
[Pydantic Response Models - TaskResponse, UserResponse]
    ↑ (JSON serialization)
[FastAPI JSON Response]
    ↑ (HTTPS)
[apiClient<T>() - Type-safe fetch]
    ↑ (TypeScript types)
[React State - useState/useEffect]
    ↑ (Component props)
[UI Components - TaskList, TaskItem, etc.]
    ↑ (DOM updates)
User (Browser sees updated UI)
```

## Error Handling Strategy

### Frontend Error Scenarios

| Scenario | Detection | Handler | User Experience |
|----------|-----------|---------|-----------------|
| Network failure | fetch() throws | apiClient catch block | "Unable to connect. Please check your internet connection." |
| 401 Unauthorized | response.status === 401 | apiClient redirect | Redirect to /login, preserve return URL |
| 403 Forbidden | response.status === 403 | apiClient error display | "Access denied. You don't have permission for this action." |
| 404 Not Found | response.status === 404 | Component error state | "Task not found. It may have been deleted." |
| 422 Validation Error | response.status === 422 | Form field errors | Display field-level validation messages |
| 500 Server Error | response.status === 500 | Generic error message | "Something went wrong. Please try again later." |

### Backend Error Scenarios

| Scenario | Detection | Handler | HTTP Status |
|----------|-----------|---------|-------------|
| Missing JWT token | No Authorization header | get_current_user raises HTTPException | 401 |
| Invalid JWT signature | jwt.decode() raises JWTError | get_current_user raises HTTPException | 401 |
| Expired JWT token | exp claim < current time | jwt.decode() raises JWTError | 401 |
| Task not found | SQLModel query returns None | raise HTTPException | 404 |
| Task belongs to other user | user_id filter excludes task | raise HTTPException (404, not 403 to prevent info leak) | 404 |
| Validation error | Pydantic raises ValidationError | FastAPI auto-handler | 422 |
| Database connection failure | Engine raises OperationalError | Try-except, log error, raise HTTPException | 500 |

## Performance Optimization Strategy

### Database Optimizations

1. **Indexes** (defined in `specs/database/schema.md`):
   - `idx_tasks_user_id` on tasks(user_id) - most common query filter
   - `idx_tasks_user_id_completed` composite on tasks(user_id, completed) - filtered list queries
   - `idx_tasks_created_at` on tasks(created_at DESC) - chronological sorting
   - `idx_users_email` unique on users(email) - login queries

2. **Connection Pooling**:
   - SQLModel engine: pool_size=5, max_overflow=10
   - Neon supports up to 100 concurrent connections per database
   - pool_pre_ping=True to avoid stale connections
   - pool_recycle=3600 to refresh connections hourly

3. **Query Optimization**:
   - Always filter by user_id first (most selective)
   - Use LIMIT/OFFSET for pagination (avoid loading all tasks)
   - Avoid N+1 queries (use selectinload if fetching related data)

### Frontend Optimizations

1. **Code Splitting**:
   - Next.js automatic code splitting by route
   - Dynamic imports for modals (TaskDeleteConfirm)
   - Lazy load below-the-fold components

2. **Image Optimization**:
   - Use next/image component for all images
   - Automatic format conversion (WebP)
   - Lazy loading and blur placeholders

3. **Caching**:
   - Server Components fetch data on server (automatic caching)
   - React Query or SWR for client-side caching (optional enhancement)
   - HTTP caching headers from backend (Cache-Control)

4. **Bundle Size**:
   - Tree-shaking enabled by default (Next.js)
   - Import only what's needed from libraries
   - Monitor bundle analyzer (next-bundle-analyzer)

### Backend Optimizations

1. **Async Routes**:
   - Use async def for all route handlers
   - AsyncSession for database operations (optional enhancement)
   - Concurrent operations with asyncio.gather() where appropriate

2. **Response Compression**:
   - Gzip middleware for JSON responses
   - Reduce payload size for large task lists

3. **Rate Limiting** (Phase III enhancement):
   - slowapi or similar for rate limiting
   - Prevent abuse of auth endpoints (5 login attempts per minute)

## Security Hardening

### Secrets Management

1. **Environment Variables**:
   - `BETTER_AUTH_SECRET`: Shared JWT signing key (64+ chars, cryptographically random)
   - `DATABASE_URL`: Neon PostgreSQL connection string
   - `NEXT_PUBLIC_API_URL`: Backend API URL (only NEXT_PUBLIC_* exposed to client)

2. **Secret Rotation**:
   - Quarterly scheduled rotation for BETTER_AUTH_SECRET
   - On-demand rotation if compromise suspected
   - Rotation procedure: deploy backend with new secret → deploy frontend → invalidate old tokens (all users re-login)

3. **Never Commit Secrets**:
   - `.env` files in `.gitignore`
   - `.env.example` templates with placeholder values only
   - Deployment platform secrets (Vercel env vars, Render env vars)

### Input Validation

1. **Backend** (Pydantic):
   - Email format validation (EmailStr)
   - Password length validation (min 8 chars)
   - Title length validation (1-200 chars)
   - SQL injection prevention (parameterized queries via SQLModel)

2. **Frontend** (TypeScript + HTML5):
   - Real-time validation on input (email pattern, minLength, maxLength)
   - Client-side validation is UX enhancement, NOT security
   - Always validate on backend (never trust client)

### Cross-Site Scripting (XSS) Prevention

1. **React Auto-Escaping**:
   - React escapes all text content by default
   - Never use dangerouslySetInnerHTML unless absolutely necessary (and sanitize with DOMPurify)

2. **Content Security Policy** (optional enhancement):
   - Add CSP headers to restrict script sources
   - Prevent inline script execution

### Cross-Site Request Forgery (CSRF) Protection

1. **SameSite Cookies**:
   - Better Auth sets SameSite=Lax (prevents CSRF on GET requests)
   - httpOnly=true (prevents JavaScript access to cookies)

2. **CORS Configuration**:
   - Backend allows only frontend origin (no wildcard *)
   - Credentials allowed for httpOnly cookies

### SQL Injection Prevention

1. **Parameterized Queries**:
   - SQLModel/SQLAlchemy uses parameterized queries automatically
   - NEVER use string concatenation for SQL (f"SELECT * FROM tasks WHERE id = '{id}'" is forbidden)

2. **ORM Safety**:
   - SQLModel validates types (UUID, int, str, bool)
   - Type mismatch raises error before query execution

## Deployment Strategy

### Development Environment

**Backend**:
1. Install Python 3.11+ (preferably via pyenv or asdf)
2. Install UV package manager: `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. Clone repository, navigate to `backend/`
4. Create `.env` from `.env.example`, set DATABASE_URL (Neon dev branch) and BETTER_AUTH_SECRET
5. Install dependencies: `uv pip install -r requirements.txt` or `uv sync`
6. Run migrations: `psql $DATABASE_URL -f migrations/001_initial_schema.sql`
7. Start dev server: `uv run uvicorn app.main:app --reload --port 8000`

**Frontend**:
1. Install Node.js 18+ and npm/pnpm
2. Navigate to `frontend/`
3. Create `.env.local` from `.env.local.example`, set BETTER_AUTH_SECRET (same as backend) and NEXT_PUBLIC_API_URL=http://localhost:8000
4. Install dependencies: `npm install` or `pnpm install`
5. Start dev server: `npm run dev` (port 3000)

**Database**:
- Option 1: Neon development branch (recommended)
- Option 2: Local PostgreSQL 15+ with createdb/dropdb for testing

### Production Deployment

**Backend** (Render, Railway, or similar):
1. Create PostgreSQL database (Neon production branch)
2. Set environment variables: DATABASE_URL, BETTER_AUTH_SECRET
3. Deploy from GitHub repo (auto-deploy on main branch push)
4. Run migrations on first deploy
5. Health check endpoint: GET /health

**Frontend** (Vercel recommended):
1. Connect GitHub repository to Vercel
2. Set environment variables: BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL (backend URL)
3. Framework preset: Next.js
4. Deploy (automatic on main branch push)
5. Custom domain configuration (optional)

**Database** (Neon Serverless):
1. Production branch with autoscaling enabled
2. Point-in-time recovery enabled (7-day retention minimum)
3. Connection pooling configured
4. Monitoring enabled (query performance, connection count)

### CI/CD Pipeline (Phase III enhancement)

**GitHub Actions Workflow**:
1. On PR: Run tests (backend pytest, frontend Vitest)
2. On PR: Run linters (flake8/black, ESLint/Prettier)
3. On merge to main: Auto-deploy backend (Render/Railway)
4. On merge to main: Auto-deploy frontend (Vercel)
5. On deploy: Run smoke tests (health check, login flow)

## Risk Analysis

### Top 3 Risks

1. **JWT Secret Compromise** (HIGH SEVERITY):
   - **Impact**: Attacker can forge tokens, impersonate any user
   - **Probability**: Low (if secret stored securely, never committed)
   - **Mitigation**:
     - Generate strong secret (64+ chars, cryptographically random)
     - Store in deployment platform secrets (not in code)
     - Rotate quarterly
     - Monitor for unusual login patterns
     - Implement token revocation if compromise detected

2. **Database Connection Pool Exhaustion** (MEDIUM SEVERITY):
   - **Impact**: API requests fail with 500 errors, service degradation
   - **Probability**: Medium (under high load or slow queries)
   - **Mitigation**:
     - Configure connection pooling (pool_size=5, max_overflow=10)
     - Monitor connection count (Neon dashboard)
     - Set connection timeout (pool_timeout=10)
     - Optimize slow queries (review query plans)
     - Scale Neon to higher tier if needed

3. **Frontend-Backend Type Drift** (MEDIUM SEVERITY):
   - **Impact**: Runtime errors, API integration bugs, data corruption
   - **Probability**: Medium (if types updated independently)
   - **Mitigation**:
     - Phase E: Testing & Sync validates zero drift
     - Contract tests verify request/response schemas
     - TypeScript types generated from backend (or manually synced)
     - Code reviews check for type changes
     - API versioning strategy if breaking changes needed

### Mitigation Strategies

**Secret Rotation Kill Switch**:
- Procedure to rotate BETTER_AUTH_SECRET in <1 hour if compromised
- Backend deployment pipeline accepts both old and new secrets temporarily
- Frontend deployment with new secret invalidates all existing tokens

**Database Failover**:
- Neon autoscaling handles load spikes
- Increase pool_size if connection errors observed
- Implement circuit breaker pattern (fail fast, don't overwhelm DB)

**Type Safety Enforcement**:
- TypeScript strict mode enabled
- Pydantic strict mode enabled
- Contract tests run in CI/CD pipeline
- Manual sync checklist during code reviews

## Architectural Decision Records (ADRs)

**Significant Decisions Detected** (per governance framework ADR three-part test):

### ADR-001: Full-Stack Technology Stack (Next.js 15 + FastAPI + Neon PostgreSQL)

**Impact**: ✅ Long-term consequences (entire Phase II architecture)
**Alternatives**: ✅ Multiple options considered (MERN stack, Django + React, Ruby on Rails)
**Scope**: ✅ Cross-cutting (affects all layers, sets precedent)

**Suggestion**:
```
📋 Architectural decision detected: Full-Stack Technology Stack (Next.js 15 + FastAPI + Neon PostgreSQL)
   Document reasoning and tradeoffs? Run `/sp.adr full-stack-technology-stack`
```

**Key Trade-offs**:
- Next.js 15: Modern React framework, App Router architecture, Vercel deployment, BUT learning curve for Server Components
- FastAPI: Fast async Python, auto-generated OpenAPI docs, type hints, BUT newer than Django/Flask
- Neon PostgreSQL: Serverless autoscaling, branching for dev/test, BUT newer than managed Postgres (RDS, Cloud SQL)

### ADR-002: JWT-Based Authentication (Better Auth + PyJWT)

**Impact**: ✅ Long-term consequences (all protected endpoints, session management)
**Alternatives**: ✅ Multiple options considered (session cookies, OAuth2, Passport.js)
**Scope**: ✅ Cross-cutting (affects frontend, backend, security)

**Suggestion**:
```
📋 Architectural decision detected: JWT-Based Authentication with Better Auth (frontend) and PyJWT (backend)
   Document reasoning and tradeoffs? Run `/sp.adr jwt-based-authentication`
```

**Key Trade-offs**:
- JWT: Stateless, scalable, works across origins, BUT cannot revoke individual tokens (must wait for expiration)
- Better Auth: Modern, Next.js optimized, JWT plugin, BUT newer than NextAuth.js
- Shared secret (HS256): Simpler than asymmetric (RS256), BUT requires secret sharing between frontend/backend

### ADR-003: Monorepo Structure (backend/ + frontend/ in single repo)

**Impact**: ✅ Long-term consequences (deployment, versioning, CI/CD)
**Alternatives**: ✅ Multiple options considered (separate repos, monorepo with workspaces)
**Scope**: ✅ Cross-cutting (affects development workflow, deployment)

**Suggestion**:
```
📋 Architectural decision detected: Monorepo structure with separate backend/ and frontend/ directories
   Document reasoning and tradeoffs? Run `/sp.adr monorepo-structure`
```

**Key Trade-offs**:
- Monorepo: Easier coordination, shared specs, single PR for full-stack changes, BUT potential for tight coupling
- Separate directories: Clear separation of concerns, independent deployments, BUT not fully isolated repos
- Alternative: Separate repos would require duplicate specs, more coordination overhead

**Note**: These ADRs are SUGGESTIONS only. User must approve ADR creation. Never auto-create ADRs (per governance framework).

## Next Steps

**This plan document is now complete.** The next steps are:

1. **User reviews and approves plan** (this document)

2. **Generate research.md** (Phase 0 output - already covered in this plan, can skip if approved)

3. **Generate data-model.md** (Phase 1 output - extract entities from spec)

4. **Generate API contracts** (Phase 1 output - OpenAPI specs for auth + tasks endpoints)

5. **Generate quickstart.md** (Phase 1 output - developer onboarding guide)

6. **Update agent context** (Phase 1 - run `.specify/scripts/bash/update-agent-context.sh claude`)

7. **Run `/sp.tasks`** command to generate tasks.md from this plan

8. **Run `/sp.implement`** command to execute tasks via specialized agents:
   - Phase A → python-api-backend agent
   - Phase B → python-api-backend agent
   - Phase C → nextjs-frontend-specialist agent
   - Phase D → both agents (coordinated by full-stack-orchestrator)
   - Phase E → full-stack-orchestrator (integration verification)

**Plan Status**: ✅ COMPLETE - Ready for Phase 1 artifact generation and task decomposition.

**Branch**: 001-phase-ii-specs
**Spec**: specs/001-phase-ii-specs/spec.md
**Plan**: specs/001-phase-ii-specs/plan.md (this file)
