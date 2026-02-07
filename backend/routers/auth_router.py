from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional

from config import settings
from database import get_connection
from schemas.auth import (
    LoginRequest, LoginResponse, AuthUserResponse,
    AcceptInviteRequest, AcceptInviteResponse,
    InviteUserResponse, AuthModeResponse
)
from services.auth_service import auth_service, generate_invite_token, AuthUser

router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_current_user(
    authorization: Optional[str] = Header(default=None),
    x_user_id: Optional[int] = Header(default=None, alias="X-User-Id"),
) -> AuthUser:
    if settings.AUTH_MODE == "dev":
        user_id = x_user_id or 1
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if row:
                return AuthUser(
                    id=row["id"],
                    name=row["name"],
                    email=row["email"],
                    role=row["role"],
                    department_id=row["department_id"] if "department_id" in row.keys() else None,
                )
        raise HTTPException(status_code=401, detail="Invalid user")

    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    token = authorization.replace("Bearer ", "")
    user = auth_service.validate_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user


@router.get("/mode", response_model=AuthModeResponse)
async def get_auth_mode():
    return AuthModeResponse(
        mode=settings.AUTH_MODE,
        supabase_configured=bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    )


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    result = auth_service.login(request.email, request.password)
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
async def get_me(current_user: AuthUser = Depends(get_current_user)):
    return AuthUserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department_id=current_user.department_id
    )


@router.post("/accept-invite", response_model=AcceptInviteResponse)
async def accept_invite(request: AcceptInviteRequest):
    user_id = auth_service.verify_invite_token(request.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")

    if len(request.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    success = auth_service.set_password(user_id, request.password)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to set password")

    return AcceptInviteResponse(
        success=True,
        message="Account created successfully. You can now log in."
    )


@router.get("/verify-invite/{token}")
async def verify_invite_token(token: str):
    user_id = auth_service.verify_invite_token(token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT email, name FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()

    return {
        "valid": True,
        "email": row["email"],
        "name": row["name"]
    }


@router.post("/users/{user_id}/invite", response_model=InviteUserResponse)
async def invite_user(
    user_id: int,
    current_user: AuthUser = Depends(get_current_user)
):
    if current_user.role not in ("executive", "admin", "dept_head"):
        raise HTTPException(status_code=403, detail="Not authorized to invite users")

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        if row["invite_status"] == "accepted":
            raise HTTPException(status_code=400, detail="User has already accepted their invite")

        token = generate_invite_token()
        cursor.execute(
            "UPDATE users SET invite_token = ?, invite_status = 'pending' WHERE id = ?",
            (token, user_id)
        )
        conn.commit()

    invite_url = f"{settings.FRONTEND_URL}/accept-invite?token={token}"

    return InviteUserResponse(
        success=True,
        invite_url=invite_url,
        message=f"Invite created for {row['email']}. Share the URL with them."
    )


@router.get("/users")
async def list_users(current_user: AuthUser = Depends(get_current_user)):
    if current_user.role not in ("executive", "admin", "dept_head"):
        raise HTTPException(status_code=403, detail="Not authorized to view users")

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, name, role, department_id, invite_status FROM users ORDER BY name")
        rows = cursor.fetchall()

    return {
        "success": True,
        "data": [
            {
                "id": row["id"],
                "email": row["email"],
                "name": row["name"],
                "role": row["role"],
                "department_id": row["department_id"] if "department_id" in row.keys() else None,
                "invite_status": row["invite_status"] if "invite_status" in row.keys() else None,
            }
            for row in rows
        ]
    }
