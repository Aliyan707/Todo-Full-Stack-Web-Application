from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.chat import router as chat_router
from .api.auth import router as auth_router
from .api.tasks import router as tasks_router
import os
import uvicorn
from .services.mcp_server import MCPTaskServer


def create_app():
    """
    Create and configure the FastAPI application
    """
    app = FastAPI(
        title="AI-Powered Todo Interface API",
        description="API for natural language todo management with AI assistance",
        version="1.0.0"
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, replace with specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(chat_router)
    app.include_router(auth_router, prefix="/api")
    app.include_router(tasks_router, prefix="/api")

    # Health check is included in the chat router

    # Initialize MCP Server if environment variable is set
    if os.getenv("ENABLE_MCP_SERVER", "false").lower() == "true":
        database_url = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")
        mcp_server = MCPTaskServer(database_url)

        # Note: The MCP server would typically run separately
        # This is just for demonstration of how it would be initialized

    return app


app = create_app()


@app.on_event("startup")
async def startup_event():
    """
    Startup event handler
    """
    print("Starting up AI-Powered Todo Interface API...")
    # Any initialization code goes here


@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler
    """
    print("Shutting down AI-Powered Todo Interface API...")
    # Any cleanup code goes here


if __name__ == "__main__":
    # Run the application with uvicorn
    uvicorn.run(
        "src.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("RELOAD", "false").lower() == "true"
    )