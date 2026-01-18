# Quickstart Guide: AI-Powered Natural Language Todo Interface

## Overview
This guide provides a rapid introduction to setting up and running the AI-powered natural language todo interface.

## Prerequisites

### System Requirements
- Python 3.11+
- Node.js 18+ (for frontend development)
- PostgreSQL compatible database (Neon recommended)
- OpenAI API key
- Better Auth account (or self-hosted instance)

### Environment Setup
1. Clone the repository
2. Install backend dependencies: `pip install -r backend/requirements.txt`
3. Install frontend dependencies: `npm install` in frontend directory
4. Set up environment variables (see Configuration section)

## Configuration

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db
OPENAI_API_KEY=sk-your-openai-api-key-here
NEON_DATABASE_URL=your-neon-database-url
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

#### Frontend (.env)
```
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_CHATKIT_API_KEY=your-chatkit-key
REACT_APP_API_BASE_URL=http://localhost:8000
```

## Installation Steps

### 1. Database Setup
1. Set up Neon PostgreSQL database
2. Run database migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```

### 2. Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Start the FastAPI server: `uvicorn src.main:app --reload`
4. The API will be available at `http://localhost:8000`

### 3. Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. The frontend will be available at `http://localhost:3000`

### 4. MCP Server Setup
1. The MCP server runs as part of the main backend application
2. MCP tools are automatically registered at startup
3. Verify MCP tools are available by checking `/mcp/tools` endpoint

## Running the Application

### Development Mode
1. Start backend: `cd backend && uvicorn src.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Access the application at `http://localhost:3000`

### Production Mode
1. Build frontend: `cd frontend && npm run build`
2. Start backend with production settings: `gunicorn src.main:app`
3. Serve frontend assets through your preferred web server

## Key Components

### MCP Tools Available
- `add_task`: Creates new tasks from natural language
- `list_tasks`: Retrieves user's tasks with filtering
- `complete_task`: Marks tasks as completed
- `delete_task`: Removes tasks
- `update_task`: Modifies existing tasks

### API Endpoints
- `POST /api/{user_id}/chat`: Main chat interface endpoint
- `GET /mcp/tools`: Lists available MCP tools
- `GET /health`: Health check endpoint

## Testing

### Backend Tests
Run backend tests: `pytest tests/`

### Frontend Tests
Run frontend tests: `npm run test`

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correctly configured
2. **OpenAI API**: Verify OPENAI_API_KEY is valid and has sufficient quota
3. **Authentication**: Check Better Auth configuration and secret key
4. **CORS**: Ensure frontend domain is allowed in backend CORS settings

### Debugging Tips
1. Enable debug logging by setting LOG_LEVEL=DEBUG
2. Check the `/health` endpoint for system status
3. Review MCP tool registration in server logs
4. Verify all environment variables are properly set

## Next Steps

1. Customize the AI agent behavior in the agent configuration
2. Extend the MCP toolset with additional functionality
3. Add custom UI components for enhanced user experience
4. Implement additional security measures as needed