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
