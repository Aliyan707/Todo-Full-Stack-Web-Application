# AI-Powered Natural Language Todo Interface

This project implements an AI-powered todo management system that allows users to interact with their todo lists using natural language commands.

## Architecture

The system consists of two main components:

1. **Backend** - Built with FastAPI, SQLModel, and OpenAI Agents SDK
2. **Frontend** - Built with Next.js and OpenAI ChatKit

## Features

- Natural language processing for todo management
- MCP (Model Context Protocol) tools for AI agent integration
- Stateless architecture with Neon PostgreSQL persistence
- User authentication and data isolation
- Conversation history management

## Tech Stack

### Backend
- Python 3.11+
- FastAPI
- SQLModel
- OpenAI Agents SDK
- MCP SDK
- Better Auth
- Neon PostgreSQL

### Frontend
- TypeScript 5.x
- Next.js 14
- React 18+
- OpenAI ChatKit
- Better Auth

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys and database URL
   ```

4. Run the application:
   ```bash
   python -m src.main
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and configure your API URLs
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/{user_id}/chat` - Main chat interface endpoint
- `GET /health` - Health check endpoint

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
OPENAI_API_KEY=your-openai-api-key
NEON_DATABASE_URL=your-neon-database-url
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-openai-domain-key
```

Note: The NEXT_PUBLIC_OPENAI_DOMAIN_KEY is required for authenticating with OpenAI services. You can obtain this key from your OpenAI dashboard.

## Usage Examples

Once the application is running, you can interact with the AI assistant using natural language:

- "Add a task to buy milk"
- "Show my tasks"
- "Mark task 1 as done"
- "Update the grocery task to due tomorrow"
- "Delete the meeting task"

## MCP Tools

The system exposes the following MCP tools for AI agents:

- `add_task` - Create new tasks
- `list_tasks` - Retrieve user's tasks
- `complete_task` - Mark tasks as completed
- `delete_task` - Remove tasks
- `update_task` - Modify existing tasks

## Testing

To run the integration tests:

```bash
cd backend
pytest test_integration.py
```

## Security

- All user data is isolated by user_id
- MCP tools verify user permissions before operations
- Input validation is performed at multiple levels
- Authentication is handled by Better Auth