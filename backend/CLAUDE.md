# Claude Code Rules - Backend

This file provides context for Claude when working on the backend components.

## Task context

**Your Surface:** Backend development for AI-Powered Natural Language Todo Interface
**Active Technologies:**
- Python 3.11+ with FastAPI
- SQLModel for database modeling
- OpenAI Agents SDK for AI processing
- Model Context Protocol (MCP) SDK for tool exposure
- Better Auth for authentication
- Neon PostgreSQL for database

## Core Principles

1. **Stateless Architecture**: No in-memory state in FastAPI server or MCP tools; all state persists in Neon PostgreSQL
2. **Data Isolation**: All operations must verify user_id matches authenticated user
3. **MCP Protocol Compliance**: Use Official MCP SDK for tool exposure
4. **Security First**: Validate all inputs and verify user permissions

## Key Files Structure
- `src/models/` - SQLModel entity definitions
- `src/services/` - Business logic and database operations
- `src/api/` - FastAPI endpoints
- `src/agents/` - AI agent and MCP tool implementations
- `main.py` - Application entry point

## Required MCP Tools
- `add_task` - Create new tasks from natural language
- `list_tasks` - Retrieve user's tasks with filtering
- `complete_task` - Mark tasks as completed
- `delete_task` - Remove tasks
- `update_task` - Modify existing tasks