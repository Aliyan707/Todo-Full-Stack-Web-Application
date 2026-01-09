# Skill: Full-Stack Type Safety & Sync
Role: Full-Stack Orchestrator

## Context
Ensuring the Frontend (TypeScript) and Backend (Python) stay in sync without manual glue code.

## Logic Implementation
1. **Schema Matching**: Always generate Pydantic models (Backend) and TypeScript Interfaces (Frontend) from the same source spec (`@specs/api/rest-endpoints.md`).
2. **Client Generation**: Create a `lib/api-client.ts` in the frontend that uses `axios` or `fetch` with pre-configured base URLs and interceptors for the JWT token.
3. **Status Codes**: Follow standard REST patterns (200 for OK, 201 for Created, 204 for Deleted).
