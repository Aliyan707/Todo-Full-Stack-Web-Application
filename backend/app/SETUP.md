# Backend Setup Guide

## Environment Configuration

### 1. Environment Variables

The `.env` file has been created with the following configuration:

```bash
# BETTER_AUTH_SECRET: 86-character secure random key
# - Used for JWT token signing (HS256 algorithm)
# - Meets minimum requirement of 32 characters
# - Already configured and ready to use

# DATABASE_URL: Neon PostgreSQL connection string
# - Update this with your actual Neon database credentials
# - Get from: https://console.neon.tech

# ALLOWED_ORIGINS: CORS configuration
# - Currently allows localhost:3000 and localhost:3001
# - Update based on your frontend URL
```

### 2. Security Notes

✅ **BETTER_AUTH_SECRET is set** (86 characters - exceeds 32 char minimum)
✅ **`.env` is in `.gitignore`** (secrets won't be committed to git)
⚠️ **Update DATABASE_URL** with your actual Neon PostgreSQL credentials

### 3. Quick Start

```bash
# 1. Update DATABASE_URL in .env with your Neon credentials
# Get from: https://console.neon.tech/app/projects

# 2. Install dependencies with uv
uv sync

# 3. Run database migrations (optional - app creates tables automatically)
# psql $DATABASE_URL -f migrations/001_initial_schema.sql

# 4. Run the application
python -m app.main
# OR with uvicorn directly:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Run tests
pytest
# OR with coverage:
pytest --cov=app --cov-report=html
```

### 4. Testing

The test suite is configured to use the `.env` file automatically:

- **Tests use SQLite in-memory database** (faster, isolated)
- **BETTER_AUTH_SECRET is loaded from `.env`** or uses fallback test secret
- **No external database required for tests** (unless you want full Neon testing)

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=html
```

### 5. API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### 6. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BETTER_AUTH_SECRET` | ✅ Yes | - | JWT signing secret (min 32 chars) |
| `DATABASE_URL` | ✅ Yes | - | Neon PostgreSQL connection string |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | CORS allowed origins |
| `HOST` | No | `0.0.0.0` | Server host |
| `PORT` | No | `8000` | Server port |

### 7. Next Steps

1. **Update DATABASE_URL** in `.env` with your Neon credentials
2. **Start the backend**: `python -m app.main`
3. **Run tests**: `pytest -v`
4. **Access API docs**: http://localhost:8000/docs
5. **Test authentication endpoints** using Swagger UI or curl

### 8. Troubleshooting

**Error: "BETTER_AUTH_SECRET environment variable is not set"**
- ✅ Fixed! `.env` file is created with secure secret

**Error: "BETTER_AUTH_SECRET must be at least 32 characters long"**
- ✅ Fixed! Current secret is 86 characters

**Error: "connection refused" or database errors**
- Update `DATABASE_URL` in `.env` with valid Neon credentials

**Tests failing with import errors**
- ✅ Fixed! `conftest.py` loads environment variables before imports

## Security Reminders

🔒 **Never commit `.env` to git** (already in `.gitignore`)
🔒 **Use different secrets for dev/staging/production**
🔒 **Rotate secrets periodically** (generate new with: `python -c "import secrets; print(secrets.token_urlsafe(64))"`)
🔒 **Keep DATABASE_URL secure** (contains database credentials)
