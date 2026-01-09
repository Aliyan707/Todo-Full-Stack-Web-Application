---
id: 002
title: Phase II Governance Framework Initialization
stage: constitution
date: 2026-01-07
surface: agent
model: claude-sonnet-4-5
feature: governance
branch: main
user: Cs
command: /sp.constitution
labels: ["governance", "architecture", "phase-ii", "orchestration", "delegation", "spec-driven-development"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/phase-ii-governance.md
tests:
  - (none - documentation artifact)
---

## Prompt

Initialize the Phase II Governance Framework.
- Role: Act as the Main Architect Agent.
- Delegation: Use /frontend/CLAUDE.md for UI and /backend/CLAUDE.md for API logic.
- Intelligence: All logic must be powered by .claude/skills/ (Auth-Bridge, Database-Ops, API-Sync).
- Strict Rule: No manual code writing. All work must be spec-driven.
- Goal: Evolve Phase I (CLI) into Phase II (Cloud-Native Full-Stack Web App).

## Response snapshot

**Action Taken**: Created comprehensive Phase II Governance Framework document at `.specify/memory/phase-ii-governance.md` (v2.0.0).

**Key Deliverables**:

1. **Constitutional Principles Established**:
   - The Three Pillars: Spec-Driven Development (SDD), Agent-Based Delegation, Skill-Powered Intelligence
   - The Four Guarantees: Zero Drift, Auth First, Context Synchronization, Traceability

2. **Architecture Overview Defined**:
   - Phase I (complete): In-memory Python CLI todo app
   - Phase II (target): Next.js 15 + Better Auth (frontend) ↔ FastAPI + SQLModel (backend) ↔ Neon Serverless PostgreSQL (database)
   - Technology stack mandates (non-negotiable)

3. **Agent Roles and Delegation Protocol**:
   - **Main Architect Agent** (Full-Stack Orchestrator): System-level coordination, spec management, delegation, integration verification
   - **Frontend Specialist Agent** (`nextjs-frontend-specialist`): Next.js 15, React, TypeScript, Tailwind CSS, Better Auth
   - **Backend Specialist Agent** (`python-api-backend`): FastAPI, SQLModel, database operations, JWT verification
   - Clear triggers, quality gates, and delegation format for each agent

4. **Skill-Based Intelligence Layer**:
   - **auth-bridge-skill**: JWT verification bridging Better Auth (Next.js) and FastAPI
   - **database-ops-skill**: Neon PostgreSQL connection and SQLModel session management
   - **api-sync-skill**: Frontend-Backend type safety and contract synchronization
   - Mandatory implementation patterns for each skill

5. **Strict Development Workflow (6 Phases)**:
   - Phase 1: Specification (MANDATORY) - Create/update feature spec
   - Phase 2: Architectural Planning (MANDATORY) - Create implementation plan, apply ADR test
   - Phase 3: Task Decomposition (MANDATORY) - Generate testable tasks
   - Phase 4: Implementation Delegation - Route to specialized agents
   - Phase 5: Integration Verification (MANDATORY) - Synchronization checklist, auth verification, end-to-end testing
   - Phase 6: Documentation and Traceability (MANDATORY) - Create PHR, update tracking

6. **Quality Standards and Enforcement**:
   - Code Quality: TypeScript strict mode, Python type hints, PEP 8, responsive design, accessibility
   - Security Standards: JWT verification, user_id scoping, input validation, secrets management
   - Performance Standards: FCP < 1.5s, TTI < 3.5s, API p95 < 200ms

7. **Context Synchronization Rules**:
   - Backend changes → Frontend updates (types, API client, error handling, auth guards)
   - Database schema changes → Cascade through all layers (migration, models, DTOs, types, UI)
   - Frontend requirements → Backend verification (endpoints, interaction patterns)

8. **Human-as-Tool Strategy**:
   - Escalation scenarios: Ambiguous requirements, architectural uncertainty, unforeseen dependencies, completion checkpoints
   - Escalation format with situation/options/recommendation/question

9. **PHR and ADR Protocols**:
   - When to create PHRs (after every implementation work, planning, debugging, spec/task/plan creation)
   - PHR creation process (detect stage, generate title/slug, resolve route, agent-native flow, validations, report)
   - ADR three-part significance test (impact, alternatives, scope)

10. **Default Policies**: Clarify and plan first, smallest viable change, explicit over implicit, test-driven mindset, reasoning is private, cite sources

11. **Execution Contract**: Confirm surface and success criteria, list constraints/invariants/non-goals, produce artifact with acceptance checks, add follow-ups and risks, create PHR, surface ADR suggestion

12. **Minimum Acceptance Criteria**: Testable acceptance criteria, error paths stated, smallest viable change, code references, type safety, auth protection, integration verified, documentation updated

13. **Quick Reference Appendices**: Agent delegation cheat sheet, skill invocation cheat sheet, directory structure reference

**Success Criteria**: This governance framework succeeds when all layers remain synchronized, every feature has auth protection, all work derives from specs, integration points are tested/documented, sub-agents receive clear delegation, PHRs capture decisions, system evolves incrementally, and users understand progress.

**Next Steps**:
1. User reviews and approves governance framework
2. Begin Phase II feature planning (e.g., user authentication, task management API, frontend dashboard)
3. Apply governance framework to first Phase II feature

## Outcome

- ✅ Impact: Established comprehensive governance framework for Phase I → Phase II evolution. All future work now follows strict spec-driven development with agent-based delegation and skill-powered intelligence.
- 🧪 Tests: (none - documentation artifact)
- 📁 Files: Created `.specify/memory/phase-ii-governance.md` (12,000+ words, 16 sections, complete reference)
- 🔁 Next prompts: User approval of governance framework → First Phase II feature specification (e.g., `/sp.specify user-authentication`) → Implementation following governance workflow
- 🧠 Reflection: Successfully translated user's Phase II requirements into comprehensive governance document. Framework enforces zero manual coding, maintains context synchronization across all layers, and ensures auth-first development. Agent roles clearly defined with no overlap. Skill-based intelligence ensures consistency in auth, database, and API patterns.

## Evaluation notes (flywheel)

- Failure modes observed: (none - initial constitution creation)
- Graders run and results (PASS/FAIL):
  - ✅ PASS: All sections complete with no placeholders
  - ✅ PASS: Agent roles clearly delineated with no overlap
  - ✅ PASS: Skill invocation patterns explicitly defined
  - ✅ PASS: Workflow phases mandatory and sequenced
  - ✅ PASS: Quality gates and acceptance criteria comprehensive
  - ✅ PASS: Escalation protocols and human-as-tool strategy clear
- Prompt variant (if applicable): Standard constitution initialization
- Next experiment (smallest change to try): Apply governance framework to first Phase II feature (user authentication) to validate workflow effectiveness
