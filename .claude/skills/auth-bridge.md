# Skill: Better-Auth to FastAPI Bridge
Role: Security Specialist

## Context
Better Auth (Next.js) handles authentication and issues JWTs. FastAPI (Python) must verify these tokens using a shared secret.

## Logic Implementation
1. **Validation**: Use `PyJWT` or `jose` in Python to decode the header `Authorization: Bearer <token>`.
2. **Secret**: Use the environment variable `BETTER_AUTH_SECRET`.
3. **Extraction**: Extract the `sub` or `user_id` from the payload.
4. **Dependency**: Create a FastAPI dependency `get_current_user` that can be injected into any route.

## Error Handling
- If token is missing: Return 401 Unauthorized.
- If token is expired: Return 401 Unauthorized.
