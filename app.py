"""Todo App Backend - Single file for Hugging Face deployment"""
import os
from datetime import datetime, timedelta
from typing import Optional, Generator
from uuid import UUID, uuid4
from contextlib import asynccontextmanager

from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Field as SQLField, Session, SQLModel, create_engine, select, func
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# ============ DATABASE ============
DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

# ============ MODELS ============
class User(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = SQLField(default_factory=uuid4, primary_key=True)
    email: str = SQLField(max_length=255, unique=True, index=True)
    password_hash: str = SQLField(max_length=255)
    created_at: datetime = SQLField(default_factory=datetime.utcnow)
    updated_at: datetime = SQLField(default_factory=datetime.utcnow)

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    id: UUID = SQLField(default_factory=uuid4, primary_key=True)
    title: str = SQLField(max_length=200)
    description: Optional[str] = SQLField(default=None)
    completed: bool = SQLField(default=False)
    user_id: UUID = SQLField(foreign_key="users.id", index=True)
    created_at: datetime = SQLField(default_factory=datetime.utcnow)
    updated_at: datetime = SQLField(default_factory=datetime.utcnow)

# ============ AUTH ============
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", os.getenv("JWT_SECRET_KEY", ""))
if not SECRET_KEY or len(SECRET_KEY) < 32:
    raise ValueError("BETTER_AUTH_SECRET or JWT_SECRET_KEY must be 32+ chars")

ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: UUID) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UUID:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return UUID(user_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ REQUEST/RESPONSE MODELS ============
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    completed: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    completed: bool
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: list[TaskResponse]
    total: int
    limit: int
    offset: int

class MessageResponse(BaseModel):
    message: str

# ============ APP ============
@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(title="Todo API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ============ AUTH ROUTES ============
auth_router = APIRouter(prefix="/api/auth", tags=["Auth"])

@auth_router.post("/register", response_model=UserResponse, status_code=201)
def register(req: RegisterRequest, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == req.email)).first():
        raise HTTPException(409, "Email already registered")
    user = User(email=req.email, password_hash=hash_password(req.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@auth_router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, session: Session = Depends(get_session)):
    try:
        user = session.exec(select(User).where(User.email == req.email)).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(401, "Invalid credentials")
        return AuthResponse(access_token=create_access_token(user.id), user=UserResponse.model_validate(user))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Login error: {str(e)}")

@auth_router.get("/me", response_model=UserResponse)
def get_me(user_id: UUID = Depends(get_current_user), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@auth_router.post("/logout", response_model=MessageResponse)
def logout(user_id: UUID = Depends(get_current_user)):
    return MessageResponse(message="Logged out")

# ============ TASK ROUTES ============
task_router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@task_router.get("", response_model=TaskListResponse)
def list_tasks(user_id: UUID = Depends(get_current_user), session: Session = Depends(get_session),
               limit: int = Query(10, ge=1, le=100), offset: int = Query(0, ge=0), completed: Optional[bool] = None):
    q = select(Task).where(Task.user_id == user_id)
    if completed is not None:
        q = q.where(Task.completed == completed)
    total = session.exec(select(func.count()).select_from(q.subquery())).one()
    tasks = session.exec(q.order_by(Task.created_at.desc()).limit(limit).offset(offset)).all()
    return TaskListResponse(tasks=[TaskResponse.model_validate(t) for t in tasks], total=total, limit=limit, offset=offset)

@task_router.post("", response_model=TaskResponse, status_code=201)
def create_task(req: TaskCreate, user_id: UUID = Depends(get_current_user), session: Session = Depends(get_session)):
    task = Task(title=req.title, description=req.description, completed=req.completed, user_id=user_id)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@task_router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: UUID, user_id: UUID = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.exec(select(Task).where(Task.id == task_id)).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.user_id != user_id:
        raise HTTPException(403, "Access denied")
    return task

@task_router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, req: TaskUpdate, user_id: UUID = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.exec(select(Task).where(Task.id == task_id)).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.user_id != user_id:
        raise HTTPException(403, "Access denied")
    if req.title is not None:
        task.title = req.title
    if req.description is not None:
        task.description = req.description
    if req.completed is not None:
        task.completed = req.completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@task_router.delete("/{task_id}", status_code=204)
def delete_task(task_id: UUID, user_id: UUID = Depends(get_current_user), session: Session = Depends(get_session)):
    task = session.exec(select(Task).where(Task.id == task_id)).first()
    if not task:
        raise HTTPException(404, "Task not found")
    if task.user_id != user_id:
        raise HTTPException(403, "Access denied")
    session.delete(task)
    session.commit()

app.include_router(auth_router)
app.include_router(task_router)

@app.get("/")
def root():
    return {"message": "Todo API", "docs": "/docs"}

@app.get("/health")
def health():
    try:
        with Session(engine) as session:
            session.exec(select(1)).first()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)[:100]}"
    return {"status": "healthy", "database": db_status}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
