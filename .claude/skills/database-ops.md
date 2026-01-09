# Skill: Neon Serverless & SQLModel Operations
Role: Database Engineer

## Context
Managing persistent storage in a serverless environment using PostgreSQL.

## Logic Implementation
1. **Connection**: Use `create_engine` from SQLModel with the `DATABASE_URL`.
2. **Session Management**: Provide a generator function `get_session` for FastAPI dependency injection.
3. **Schema Sync**: Use `SQLModel.metadata.create_all(engine)` during the backend startup event to ensure tables exist in Neon.
4. **Data Integrity**: Ensure every `Task` record is strictly bound to a `user_id`.

## Optimization
- Use `selectinload` or similar for relationship fetching if needed.
- Ensure connection pooling is handled for serverless environments.
