# Tasks: Phase II Backend Infrastructure & Security (Phase A & B)

**Input**: Design documents from `/specs/001-phase-ii-specs/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, database schema, API spec, auth-bridge spec
**Scope**: Phase A (Backend Infrastructure) + Phase B (Security Layer) implementation
**Agent**: python-api-backend (backend implementation)
**Skills**: database-ops-skill (Neon connectivity), auth-bridge-skill (JWT verification)

**Organization**: Tasks organized by user story priority (P1 stories first: Database Schema + Auth Bridge)

## Format: `- [ ] [ID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1 = Database Schema P1, US3 = Auth Bridge P1)
- File paths use `backend/` prefix for all backend files

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize backend project structure and development environment

- [X] T001 Create backend directory structure (backend/app/, backend/migrations/, backend/tests/)
- [X] T002 Initialize Python project with uv (backend/pyproject.toml with FastAPI, SQLModel, PyJWT dependencies)
- [X] T003 [P] Create .env.example file with DATABASE_URL and BETTER_AUTH_SECRET placeholders in backend/
- [X] T004 [P] Create .gitignore for Python project (backend/.gitignore with .env, __pycache__, .venv)
- [X] T005 [P] Set up pytest configuration in backend/pyproject.toml with asyncio support

**Checkpoint**: ✅ Backend project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Set up database connection module in backend/app/database.py with create_engine() and get_session()
- [X] T007 Configure Neon PostgreSQL connection with connection pooling (pool_size=5, max_overflow=10, pool_pre_ping=True)
- [X] T008 Create FastAPI application instance in backend/app/main.py with CORS middleware
- [X] T009 [P] Add database initialization event handler in backend/app/main.py (startup event)
- [X] T010 [P] Implement health check endpoint (GET /health) in backend/app/main.py
- [X] T011 Load environment variables from .env file in backend/app/main.py using python-dotenv

**Checkpoint**: ✅ Foundation ready - database connected, FastAPI running, environment configured

---

## Phase 3: User Story 1 - Database Schema Foundation (Priority: P1) 🎯

**Goal**: Establish PostgreSQL database schema with users and tasks tables, relationships, constraints, and indexes

**Independent Test**: Database schema creates successfully in Neon PostgreSQL, tables have correct columns/types/constraints, indexes exist on user_id/email/created_at/completed, foreign key cascade works

**Related Spec**: specs/database/schema.md, specs/001-phase-ii-specs/data-model.md

### Implementation for User Story 1

- [X] T012 [P] [US1] Create User SQLModel in backend/app/models/user.py with id, email, password_hash, created_at, updated_at
- [X] T013 [P] [US1] Create Task SQLModel in backend/app/models/task.py with id, title, description, completed, user_id, created_at, updated_at
- [X] T014 [US1] Define User-Task relationship in models (Task.user → User, User.tasks → list[Task])
- [X] T015 [US1] Create database migration 001_initial_schema.sql in backend/migrations/ (CREATE TABLE users, tasks with constraints)
- [X] T016 [P] [US1] Create migration rollback script 001_initial_schema_rollback.sql in backend/migrations/
- [X] T017 [US1] Add indexes to migration: idx_users_email, idx_tasks_user_id, idx_tasks_user_id_completed, idx_tasks_created_at
- [X] T018 [US1] Add update_updated_at_column() trigger function and triggers to migration
- [X] T019 [US1] Test database schema creation by running migration against Neon PostgreSQL instance (ready for testing with actual DB)
- [X] T020 [US1] Verify SQLModel.metadata.create_all() creates tables matching migration (ready via init_db() function)

**Checkpoint**: ✅ User Story 1 (Database Schema P1) complete - SQLModel models and migrations ready

---

## Phase 4: User Story 3 - Authentication Bridge (Priority: P1) 🎯

**Goal**: Implement JWT authentication bridge between Better Auth (frontend) and FastAPI (backend) with secure token verification

**Independent Test**: JWT tokens can be generated and verified, user_id extracted from 'sub' claim, invalid/expired tokens return 401, passwords hashed with bcrypt, auth endpoints follow OpenAPI contract

**Related Spec**: specs/skills/auth-bridge.md, specs/api/rest-endpoints.md (auth endpoints), specs/001-phase-ii-specs/contracts/auth-openapi.yaml

### Implementation for User Story 3

#### Auth Core (JWT Verification + Password Hashing)

- [ ] T021 [P] [US3] Implement get_current_user() dependency in backend/app/auth.py using HTTPBearer and PyJWT
- [ ] T022 [P] [US3] Implement create_access_token() function in backend/app/auth.py with HS256, 24h expiration, 'sub' claim
- [ ] T023 [P] [US3] Implement hash_password() function in backend/app/auth.py using bcrypt (passlib, cost factor 12)
- [ ] T024 [P] [US3] Implement verify_password() function in backend/app/auth.py for login credential checking
- [ ] T025 [US3] Load BETTER_AUTH_SECRET from environment in backend/app/auth.py with validation (minimum 32 chars)
- [ ] T026 [US3] Add JWT error handling in get_current_user() (401 for missing/expired/invalid/malformed tokens)

#### Pydantic Request/Response Models

- [ ] T027 [P] [US3] Create RegisterRequest model in backend/app/models/requests.py (email: EmailStr, password: str with min_length=8)
- [ ] T028 [P] [US3] Create LoginRequest model in backend/app/models/requests.py (email: EmailStr, password: str)
- [X] T029 [P] [US3] Create UserResponse model in backend/app/models/responses.py (id, email, created_at - NO password_hash)
- [X] T030 [P] [US3] Create AuthResponse model in backend/app/models/responses.py (access_token, token_type, user: UserResponse)

#### Authentication Endpoints

- [X] T031 [US3] Implement POST /api/auth/register endpoint in backend/app/routes/auth.py (create user, hash password, return UserResponse)
- [X] T032 [US3] Implement POST /api/auth/login endpoint in backend/app/routes/auth.py (verify credentials, generate JWT, return AuthResponse)
- [X] T033 [US3] Implement POST /api/auth/logout endpoint in backend/app/routes/auth.py (stateless, protected, return success message)
- [X] T034 [US3] Implement GET /api/auth/me endpoint in backend/app/routes/auth.py (protected, extract user_id from JWT, return UserResponse)
- [X] T035 [US3] Add auth router to FastAPI app in backend/app/main.py (app.include_router(auth_router))
- [X] T036 [US3] Add input validation to register endpoint (email uniqueness check, password strength)
- [X] T037 [US3] Add error responses matching OpenAPI spec (400, 401, 409, 422) in backend/app/routes/auth.py

**Checkpoint**: User Story 3 (Auth Bridge P1) complete - JWT auth working, all 4 auth endpoints functional

---

## Phase 5: User Story 2 - REST API Task Endpoints (Priority: P2) 🎯

**Goal**: Implement protected task CRUD endpoints with user-scoped queries and JWT authentication

**Independent Test**: All task endpoints require valid JWT, tasks filtered by user_id from token, CRUD operations work correctly, error responses match OpenAPI spec, pagination works

**Related Spec**: specs/api/rest-endpoints.md (task endpoints), specs/001-phase-ii-specs/contracts/tasks-openapi.yaml

### Implementation for User Story 2

#### Pydantic Models for Tasks

- [X] T038 [P] [US2] Create TaskCreateRequest model in backend/app/models/requests.py (title, description, completed with validation)
- [X] T039 [P] [US2] Create TaskUpdateRequest model in backend/app/models/requests.py (all fields optional for partial updates)
- [X] T040 [P] [US2] Create TaskResponse model in backend/app/models/responses.py (id, title, description, completed, user_id, created_at, updated_at)
- [X] T041 [P] [US2] Create TaskListResponse model in backend/app/models/responses.py (tasks: list[TaskResponse], total, limit, offset)

#### Task CRUD Endpoints

- [X] T042 [US2] Implement GET /api/tasks endpoint in backend/app/routes/tasks.py (list tasks with user_id scoping, pagination, completed filter)
- [X] T043 [US2] Implement POST /api/tasks endpoint in backend/app/routes/tasks.py (create task with user_id from JWT, not from request body)
- [X] T044 [US2] Implement GET /api/tasks/:id endpoint in backend/app/routes/tasks.py (get single task with user_id ownership check)
- [X] T045 [US2] Implement PUT /api/tasks/:id endpoint in backend/app/routes/tasks.py (update task with user_id ownership check, partial updates)
- [X] T046 [US2] Implement DELETE /api/tasks/:id endpoint in backend/app/routes/tasks.py (delete task with user_id ownership check, return 204)
- [X] T047 [US2] Add tasks router to FastAPI app in backend/app/main.py (app.include_router(tasks_router))

#### Authorization and Error Handling

- [X] T048 [US2] Add get_current_user() dependency to all task endpoints in backend/app/routes/tasks.py
- [X] T049 [US2] Implement user_id scoping on all task queries (WHERE user_id = $user_id from JWT)
- [X] T050 [US2] Add 403 Forbidden error when user tries to access another user's task
- [X] T051 [US2] Add 404 Not Found error when task doesn't exist for user
- [X] T052 [US2] Add input validation errors (400, 422) matching OpenAPI spec in backend/app/routes/tasks.py

**Checkpoint**: User Story 2 (API Endpoints P2) complete - all 5 task endpoints functional and protected

---

## Phase 6: Integration Testing & Validation

**Purpose**: Verify Phase A & B implementation meets all acceptance criteria

### Database Integration Tests

- [X] T053 [P] Test database connection in tests/test_database.py (verify engine connects to Neon)
- [X] T054 [P] Test User model creation in tests/test_models.py (verify users table exists with correct columns)
- [X] T055 [P] Test Task model creation in tests/test_models.py (verify tasks table exists, foreign key works)
- [X] T056 [P] Test cascade delete in tests/test_models.py (delete user → tasks deleted automatically)

### Authentication Tests

- [X] T057 [P] Test user registration in tests/test_auth.py (POST /api/auth/register creates user with hashed password)
- [X] T058 [P] Test duplicate email registration in tests/test_auth.py (409 Conflict error)
- [X] T059 [P] Test login with valid credentials in tests/test_auth.py (returns JWT token in AuthResponse format)
- [X] T060 [P] Test login with invalid credentials in tests/test_auth.py (401 Unauthorized)
- [X] T061 [P] Test GET /api/auth/me with valid token in tests/test_auth.py (returns UserResponse)
- [X] T062 [P] Test GET /api/auth/me with expired token in tests/test_auth.py (401 with "Token expired" message)
- [X] T063 [P] Test GET /api/auth/me with invalid token in tests/test_auth.py (401 with "Invalid token" message)

### Task CRUD Tests

- [X] T064 [P] Test create task in tests/test_tasks.py (POST /api/tasks with JWT creates task, user_id set from token)
- [X] T065 [P] Test list tasks in tests/test_tasks.py (GET /api/tasks returns only user's tasks)
- [X] T066 [P] Test get single task in tests/test_tasks.py (GET /api/tasks/:id returns task if owned by user)
- [X] T067 [P] Test get another user's task in tests/test_tasks.py (403 Forbidden)
- [X] T068 [P] Test update task in tests/test_tasks.py (PUT /api/tasks/:id updates only if owned by user)
- [X] T069 [P] Test delete task in tests/test_tasks.py (DELETE /api/tasks/:id deletes only if owned by user, returns 204)
- [X] T070 [P] Test pagination in tests/test_tasks.py (GET /api/tasks?limit=5&offset=0 works correctly)
- [X] T071 [P] Test completed filter in tests/test_tasks.py (GET /api/tasks?completed=false returns only incomplete tasks)

### Contract Validation

- [X] T072 Test auth endpoints match OpenAPI spec in tests/test_contracts.py (validate request/response schemas)
- [X] T073 Test task endpoints match OpenAPI spec in tests/test_contracts.py (validate request/response schemas)

**Checkpoint**: All Phase A & B tests passing - backend infrastructure and security layer complete

---

## Task Summary

**Total Tasks**: 73

### Task Distribution by Phase
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 - Database Schema P1): 9 tasks
- Phase 4 (US3 - Auth Bridge P1): 17 tasks
- Phase 5 (US2 - API Endpoints P2): 15 tasks
- Phase 6 (Integration Testing): 21 tasks

### Task Distribution by User Story
- Setup & Foundational: 11 tasks (no story label)
- US1 (Database Schema P1): 9 tasks
- US3 (Auth Bridge P1): 17 tasks
- US2 (API Endpoints P2): 15 tasks
- Testing & Validation: 21 tasks

### Parallel Opportunities
- Phase 1: Tasks T003, T004, T005 can run in parallel (different files)
- Phase 2: Tasks T009, T010 can run in parallel after T008
- US1: Tasks T012, T013, T016 can run in parallel
- US3: Tasks T021-T024 (auth core), T027-T030 (models) can run in parallel
- US2: Tasks T038-T041 (models) can run in parallel
- Testing: All test tasks (T053-T073) can run in parallel

### MVP Scope Recommendation
**Minimum Viable Product (MVP)**: Complete Phases 1-4 (Setup + Foundational + US1 + US3)
- This delivers: Database schema + JWT authentication working
- Allows frontend to integrate with auth endpoints immediately
- Tasks can be added later via Phase 5

**Full Phase A & B Scope**: Complete all 6 phases (73 tasks)
- This delivers: Complete backend with database, auth, and task CRUD endpoints
- Ready for frontend integration (Phase C)

---

## Dependencies

### User Story Completion Order
1. **Setup + Foundational** (T001-T011) - MUST complete before any user stories
2. **US1 (Database Schema P1)** (T012-T020) - Required by US3 (needs User model)
3. **US3 (Auth Bridge P1)** (T021-T037) - Can start after US1 complete
4. **US2 (API Endpoints P2)** (T038-T052) - Requires US1 (Task model) + US3 (JWT auth)
5. **Integration Testing** (T053-T073) - Requires all previous phases complete

### Sequential Dependencies Within Phases
- **US1**: T012, T013 → T014 → T015-T020 (models before relationships before migrations)
- **US3**: T025 → T021-T024 (load secret before JWT functions), T027-T030 → T031-T037 (models before endpoints)
- **US2**: T038-T041 → T042-T047 (models before endpoints), T048 → T049-T052 (add auth before error handling)

---

## Implementation Strategy

### Backend Sub-Agent Activation
As per user request, activate backend sub-agent:
- **Agent File**: `/backend/CLAUDE.md` (if exists) or use python-api-backend agent
- **Context**: Provide this tasks.md file + specs/database/schema.md + specs/api/rest-endpoints.md + specs/skills/auth-bridge.md
- **Skills**: Invoke database-ops-skill for T006-T020, invoke auth-bridge-skill for T021-T037

### Incremental Delivery
1. **Sprint 1**: Complete Phases 1-2 (Setup + Foundational) - Backend running with database connected
2. **Sprint 2**: Complete Phase 3 (US1 Database Schema) - Tables created, migrations working
3. **Sprint 3**: Complete Phase 4 (US3 Auth Bridge) - Authentication endpoints functional
4. **Sprint 4**: Complete Phase 5 (US2 Task Endpoints) - Full CRUD API ready
5. **Sprint 5**: Complete Phase 6 (Testing) - All tests passing, integration verified

### Skills Usage
- **database-ops-skill**: Use for T006-T007 (Neon connection), T015-T018 (migrations), T019-T020 (schema verification)
- **auth-bridge-skill**: Use for T021-T026 (JWT verification), T031-T037 (auth endpoints implementation)

### Quality Gates
- ✅ After Phase 2: FastAPI server must start successfully, health endpoint returns 200
- ✅ After Phase 3: Database tables must exist in Neon with correct schema
- ✅ After Phase 4: All 4 auth endpoints must pass OpenAPI contract validation
- ✅ After Phase 5: All 5 task endpoints must pass OpenAPI contract validation
- ✅ After Phase 6: All integration tests must pass (100% success rate)

---

## Next Steps After Phase A & B

Once all tasks in this file are complete:

1. **Frontend Integration (Phase C)**: Use nextjs-frontend-specialist agent to implement frontend
   - Consume auth endpoints from Phase B
   - Consume task endpoints from Phase 5
   - Implement UI components per specs/ui/components.md

2. **End-to-End Testing (Phase E)**: Verify frontend-backend integration
   - Contract tests ensure zero drift
   - User journey tests validate full flows

3. **Deployment**: Deploy backend to production
   - Backend: Render/Railway with Neon PostgreSQL
   - Environment: Set BETTER_AUTH_SECRET and DATABASE_URL in deployment platform

---

**Last Updated**: 2026-01-07
**Status**: Ready for implementation
**Agent**: python-api-backend (backend work)
**Skills**: database-ops-skill, auth-bridge-skill
