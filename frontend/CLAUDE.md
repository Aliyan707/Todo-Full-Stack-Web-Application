# Claude Code Rules - Frontend

This file provides context for Claude when working on the frontend components.

## Task context

**Your Surface:** Frontend development for AI-Powered Natural Language Todo Interface
**Active Technologies:**
- TypeScript 5.x with React 18+
- OpenAI ChatKit for chat interface
- Better Auth for authentication
- Next.js 15 App Router (if applicable)

## Core Principles

1. **Stateless Integration**: Connect to backend API without storing session state locally
2. **Secure User Isolation**: Always pass user_id with requests to maintain data isolation
3. **Responsive Design**: Ensure UI works across devices
4. **Error Handling**: Gracefully handle API errors and network issues

## Key Files Structure
- `src/components/` - Reusable UI components
- `src/pages/` - Page-level components
- `src/services/` - API clients and authentication
- `src/utils/` - Helper functions
- `pages/index.tsx` - Main chat interface

## Integration Points
- Connect ChatKit to `/api/{user_id}/chat` backend endpoint
- Configure environment variables for authentication
- Handle conversation state management