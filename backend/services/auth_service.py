from typing import Optional, Tuple
from datetime import datetime
import secrets
import hashlib

from config import settings
from database import get_connection


class AuthUser:
    def __init__(self, id: int, email: str, name: str, role: str, department_id: Optional[int] = None):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.department_id = department_id


class DevAuthService:
    def validate_token(self, token: str) -> Optional[AuthUser]:
        try:
            user_id = int(token)
            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
                row = cursor.fetchone()
                if row:
                    return AuthUser(
                        id=row["id"],
                        email=row["email"],
                        name=row["name"],
                        role=row["role"],
                        department_id=row["department_id"] if "department_id" in row.keys() else None,
                    )
        except (ValueError, TypeError):
            pass
        return None

    def login(self, email: str, password: str) -> Optional[Tuple[str, AuthUser]]:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            row = cursor.fetchone()
            if row:
                token = str(row["id"])
                user = AuthUser(
                    id=row["id"],
                    email=row["email"],
                    name=row["name"],
                    role=row["role"],
                    department_id=row["department_id"] if "department_id" in row.keys() else None,
                )
                return (token, user)
        return None

    def verify_invite_token(self, token: str) -> Optional[int]:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE invite_token = ? AND invite_status = 'pending'", (token,))
            row = cursor.fetchone()
            if row:
                return row["id"]
        return None

    def set_password(self, user_id: int, password: str) -> bool:
        with get_connection() as conn:
            cursor = conn.cursor()
            password_hash = _hash_password(password)
            cursor.execute(
                "UPDATE users SET password_hash = ?, invite_status = 'accepted', invite_token = NULL, updated_at = ? WHERE id = ?",
                (password_hash, datetime.now().isoformat(), user_id)
            )
            conn.commit()
            return cursor.rowcount > 0


class SupabaseAuthService:
    def __init__(self):
        self.jwt_secret = settings.SUPABASE_JWT_SECRET
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY

    def validate_token(self, token: str) -> Optional[AuthUser]:
        try:
            import jwt
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"],
                audience="authenticated"
            )
            email = payload.get("email")
            if not email:
                return None

            with get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                row = cursor.fetchone()
                if row:
                    return AuthUser(
                        id=row["id"],
                        email=row["email"],
                        name=row["name"],
                        role=row["role"],
                        department_id=row["department_id"] if "department_id" in row.keys() else None,
                    )
        except Exception:
            pass
        return None

    def login(self, email: str, password: str) -> Optional[Tuple[str, AuthUser]]:
        import httpx

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

                with get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                    row = cursor.fetchone()
                    if row and access_token:
                        user = AuthUser(
                            id=row["id"],
                            email=row["email"],
                            name=row["name"],
                            role=row["role"],
                            department_id=row["department_id"] if "department_id" in row.keys() else None,
                        )
                        return (access_token, user)
        except Exception:
            pass
        return None

    def verify_invite_token(self, token: str) -> Optional[int]:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE invite_token = ? AND invite_status = 'pending'", (token,))
            row = cursor.fetchone()
            if row:
                return row["id"]
        return None

    def set_password(self, user_id: int, password: str) -> bool:
        import httpx

        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                return False

            try:
                response = httpx.post(
                    f"{self.supabase_url}/auth/v1/admin/users",
                    json={
                        "email": row["email"],
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

                    cursor.execute(
                        "UPDATE users SET supabase_user_id = ?, invite_status = 'accepted', invite_token = NULL, updated_at = ? WHERE id = ?",
                        (supabase_user_id, datetime.now().isoformat(), user_id)
                    )
                    conn.commit()
                    return True
            except Exception:
                pass
        return False


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def generate_invite_token() -> str:
    return secrets.token_urlsafe(32)


def get_auth_service():
    if settings.AUTH_MODE == "supabase":
        return SupabaseAuthService()
    return DevAuthService()


auth_service = get_auth_service()
