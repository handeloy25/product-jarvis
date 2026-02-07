# TaskFlow Auth Implementation Reference

These files were shared by the TaskFlow team as reference for implementing authentication in Product Jarvis. Copy and adapt these to match PJ's structure.

---

## File 1: `backend/services/auth_service.py`

```python
"""
Authentication Service Interface

Provides pluggable authentication implementations:
- DevAuthService: Development mode with user selector (no real auth)
- SupabaseAuthService: Production mode with Supabase JWT auth

Switch between modes via AUTH_MODE in config.py:
- "dev": Uses DevAuthService (default for local development)
- "supabase": Uses SupabaseAuthService (requires Supabase project)

TODO for production:
1. Set AUTH_MODE=supabase in .env
2. Configure SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET
3. Deploy send-email Edge Function for invite emails
4. Set FRONTEND_URL to production domain for email links
"""
from abc import ABC, abstractmethod
from typing import Optional, Tuple
from datetime import datetime, timedelta
import secrets
import hashlib
import jwt

from sqlalchemy.orm import Session
from pydantic import BaseModel

from config import settings


class AuthUser(BaseModel):
    id: int
    email: str
    name: str
    role: str
    department_id: Optional[int] = None
    pj_employee_id: Optional[int] = None


class TokenPayload(BaseModel):
    sub: int
    email: str
    exp: datetime


class AuthServiceInterface(ABC):
    @abstractmethod
    def validate_token(self, token: str, db: Session) -> Optional[AuthUser]:
        pass

    @abstractmethod
    def login(self, email: str, password: str, db: Session) -> Optional[Tuple[str, AuthUser]]:
        pass

    @abstractmethod
    def create_user(self, email: str, password: str, employee_id: int, db: Session) -> bool:
        pass

    @abstractmethod
    def verify_invite_token(self, token: str, db: Session) -> Optional[int]:
        pass

    @abstractmethod
    def set_password(self, employee_id: int, password: str, db: Session) -> bool:
        pass


class DevAuthService(AuthServiceInterface):
    """
    Development mode auth - no real authentication.
    Token is simply the employee ID. User selector dropdown allows switching.
    """
    def validate_token(self, token: str, db: Session) -> Optional[AuthUser]:
        from models.employee import Employee
        try:
            user_id = int(token)
            employee = db.query(Employee).filter(Employee.id == user_id).first()
            if employee:
                return AuthUser(
                    id=employee.id,
                    email=employee.email,
                    name=employee.name,
                    role=employee.role,
                    department_id=employee.department_id,
                    pj_employee_id=employee.pj_employee_id,
                )
        except (ValueError, TypeError):
            pass
        return None

    def login(self, email: str, password: str, db: Session) -> Optional[Tuple[str, AuthUser]]:
        from models.employee import Employee
        employee = db.query(Employee).filter(Employee.email == email).first()
        if employee:
            token = str(employee.id)
            user = AuthUser(
                id=employee.id,
                email=employee.email,
                name=employee.name,
                role=employee.role,
                department_id=employee.department_id,
                pj_employee_id=employee.pj_employee_id,
            )
            return (token, user)
        return None

    def create_user(self, email: str, password: str, employee_id: int, db: Session) -> bool:
        return True

    def verify_invite_token(self, token: str, db: Session) -> Optional[int]:
        from models.employee import Employee
        employee = db.query(Employee).filter(Employee.invite_token == token).first()
        if employee and employee.invite_status == "pending":
            return employee.id
        return None

    def set_password(self, employee_id: int, password: str, db: Session) -> bool:
        from models.employee import Employee
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if employee:
            employee.password_hash = _hash_password(password)
            employee.invite_status = "accepted"
            employee.invite_token = None
            db.commit()
            return True
        return False


class SupabaseAuthService(AuthServiceInterface):
    """
    Production auth using Supabase.
    Validates JWTs issued by Supabase Auth, creates users via Admin API.

    Required environment variables:
    - SUPABASE_URL: Your Supabase project URL
    - SUPABASE_KEY: Supabase anon key (for user-facing operations)
    - SUPABASE_JWT_SECRET: JWT secret from Supabase dashboard (for token validation)
    """
    def __init__(self):
        self.jwt_secret = settings.SUPABASE_JWT_SECRET
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY

    def validate_token(self, token: str, db: Session) -> Optional[AuthUser]:
        from models.employee import Employee
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
            email = payload.get("email")
            if not email:
                return None

            employee = db.query(Employee).filter(Employee.email == email).first()
            if employee:
                return AuthUser(
                    id=employee.id,
                    email=employee.email,
                    name=employee.name,
                    role=employee.role,
                    department_id=employee.department_id,
                    pj_employee_id=employee.pj_employee_id,
                )
        except jwt.PyJWTError:
            pass
        return None

    def login(self, email: str, password: str, db: Session) -> Optional[Tuple[str, AuthUser]]:
        import httpx
        from models.employee import Employee

        try:
            response = httpx.post(
                f"{self.supabase_url}/auth/v1/token?grant_type=password",
                json={"email": email, "password": password},
                headers={
                    "apikey": self.supabase_key,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            if response.status_code == 200:
                data = response.json()
                access_token = data.get("access_token")

                employee = db.query(Employee).filter(Employee.email == email).first()
                if employee and access_token:
                    user = AuthUser(
                        id=employee.id,
                        email=employee.email,
                        name=employee.name,
                        role=employee.role,
                        department_id=employee.department_id,
                        pj_employee_id=employee.pj_employee_id,
                    )
                    return (access_token, user)
        except httpx.HTTPError:
            pass
        return None

    def create_user(self, email: str, password: str, employee_id: int, db: Session) -> bool:
        import httpx
        from models.employee import Employee

        try:
            response = httpx.post(
                f"{self.supabase_url}/auth/v1/admin/users",
                json={
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                },
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )
            if response.status_code in (200, 201):
                data = response.json()
                supabase_user_id = data.get("id")

                employee = db.query(Employee).filter(Employee.id == employee_id).first()
                if employee:
                    employee.supabase_user_id = supabase_user_id
                    db.commit()
                return True
        except httpx.HTTPError:
            pass
        return False

    def verify_invite_token(self, token: str, db: Session) -> Optional[int]:
        from models.employee import Employee
        employee = db.query(Employee).filter(Employee.invite_token == token).first()
        if employee and employee.invite_status == "pending":
            return employee.id
        return None

    def set_password(self, employee_id: int, password: str, db: Session) -> bool:
        from models.employee import Employee
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if employee:
            if self.create_user(employee.email, password, employee_id, db):
                employee.invite_status = "accepted"
                employee.invite_token = None
                db.commit()
                return True
        return False


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_invite_token() -> str:
    return secrets.token_urlsafe(32)


def get_auth_service() -> AuthServiceInterface:
    """
    Factory function returning the appropriate auth service based on AUTH_MODE.
    Called once at module load to create the singleton `auth_service`.
    """
    if settings.AUTH_MODE == "supabase":
        return SupabaseAuthService()
    return DevAuthService()


auth_service = get_auth_service()
```

---

## File 2: `backend/routers/auth.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from config import settings
from auth import CurrentUser, get_current_user
from schemas.auth import (
    LoginRequest, LoginResponse, AuthUserResponse,
    AcceptInviteRequest, AcceptInviteResponse,
    InviteUserResponse, AuthModeResponse
)
from services.auth_service import auth_service, generate_invite_token, AuthUser
from models.employee import Employee

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/mode", response_model=AuthModeResponse)
async def get_auth_mode():
    return AuthModeResponse(
        mode=settings.AUTH_MODE,
        supabase_configured=bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login(request.email, request.password, db)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token, user = result
    return LoginResponse(
        token=token,
        user=AuthUserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            department_id=user.department_id
        )
    )


@router.post("/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=AuthUserResponse)
async def get_me(
    authorization: Optional[str] = Header(default=None),
    x_user_id: Optional[int] = Header(default=None),
    db: Session = Depends(get_db)
):
    if settings.AUTH_MODE == "dev":
        user_id = x_user_id or 1
        employee = db.query(Employee).filter(Employee.id == user_id).first()
        if employee:
            return AuthUserResponse(
                id=employee.id,
                name=employee.name,
                email=employee.email,
                role=employee.role,
                department_id=employee.department_id
            )
        raise HTTPException(status_code=401, detail="Invalid user")

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = authorization.replace("Bearer ", "")
    user = auth_service.validate_token(token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return AuthUserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department_id=user.department_id
    )


@router.post("/accept-invite", response_model=AcceptInviteResponse)
async def accept_invite(request: AcceptInviteRequest, db: Session = Depends(get_db)):
    employee_id = auth_service.verify_invite_token(request.token, db)
    if not employee_id:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")

    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    success = auth_service.set_password(employee_id, request.password, db)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to set password")

    return AcceptInviteResponse(
        success=True,
        message="Account created successfully. You can now log in."
    )


@router.get("/verify-invite/{token}")
async def verify_invite_token(token: str, db: Session = Depends(get_db)):
    employee_id = auth_service.verify_invite_token(token, db)
    if not employee_id:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")

    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    return {
        "valid": True,
        "email": employee.email,
        "name": employee.name
    }


@router.post("/employees/{employee_id}/invite", response_model=InviteUserResponse)
async def invite_user(
    employee_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ("executive", "admin", "dept_head"):
        raise HTTPException(status_code=403, detail="Not authorized to invite users")

    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    if employee.invite_status == "accepted":
        raise HTTPException(status_code=400, detail="User has already accepted their invite")

    token = generate_invite_token()
    employee.invite_token = token
    employee.invite_status = "pending"
    db.commit()

    invite_url = f"{settings.FRONTEND_URL}/accept-invite?token={token}"

    return InviteUserResponse(
        success=True,
        invite_url=invite_url,
        message=f"Invite created for {employee.email}. Share the URL with them."
    )
```

---

## File 3: `backend/schemas/auth.py`

```python
from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department_id: Optional[int] = None


class LoginResponse(BaseModel):
    token: str
    user: AuthUserResponse


class AcceptInviteRequest(BaseModel):
    token: str
    password: str


class AcceptInviteResponse(BaseModel):
    success: bool
    message: str


class InviteUserResponse(BaseModel):
    success: bool
    invite_url: str
    message: str


class AuthModeResponse(BaseModel):
    mode: str
    supabase_configured: bool
```

---

## Adaptation Notes for Product Jarvis

### 1. Model Differences

TaskFlow uses SQLAlchemy with an `Employee` model. PJ uses SQLite directly. You'll need to:
- Either add SQLAlchemy to PJ, or
- Adapt the queries to use raw SQL with PJ's `get_connection()` pattern

### 2. Config Settings

Add these to `backend/config.py`:
```python
import os

AUTH_MODE = os.getenv("AUTH_MODE", "dev")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
```

### 3. Dependencies to Add

```bash
pip install PyJWT httpx
```

Add to `requirements.txt`:
```
PyJWT>=2.8.0
httpx>=0.25.0
```

### 4. Database Schema Updates

Add columns to your users/employees table:
```sql
ALTER TABLE users ADD COLUMN invite_token TEXT;
ALTER TABLE users ADD COLUMN invite_status TEXT DEFAULT 'none';
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN supabase_user_id TEXT;
```

### 5. Frontend Components Needed

- `LoginPage.jsx` - Email/password form
- `AcceptInvitePage.jsx` - Set password form
- `AuthContext.jsx` - Token storage, auth state
- Protected route wrapper

---

## Implementation Priority

1. **Phase 1 (Dev mode):** Get DevAuthService working with user selector
2. **Phase 2 (Supabase):** Set up Supabase project, add SupabaseAuthService
3. **Phase 3 (Invite flow):** Implement invite emails with Edge Function

This matches TaskFlow's approach - dev mode first, then layer in production auth.
