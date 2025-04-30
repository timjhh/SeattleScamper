import logging

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

from ..config import settings
from ..database.models import User
from ..database.database import SessionDep
from .models import TokenData
from .crypto import get_password_hash, verify_password
from sqlmodel import select

logging.basicConfig(
    level=logging.INFO,
    filename="app.log",
    filemode="a",
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logging.getLogger("passlib").setLevel(logging.ERROR)

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_user(db: SessionDep, username: str):
    """
    Get the first user who's username matched the input.
    """
    user = db.exec(select(User).where(User.username == username)).first()
    logger.info("user: %s", user)
    return user


def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    logger.info("username: %s, hash: %s", username, get_password_hash(password))
    try:
        if verify_password(password, user.hashed_password):
            return user
        else:
            return False
    except Exception:
        logger.error("failed to verify password")
        return False


async def get_current_user(
    db: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.hash_algorithm]
        )
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.InvalidTokenError:
        raise credentials_exception
    if token_data.username is None:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user
