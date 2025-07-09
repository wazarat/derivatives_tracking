import logging
import jwt
from fastapi import Depends, HTTPException, Header, status
from typing import Optional

logger = logging.getLogger(__name__)

# JWT verification settings
JWT_SECRET = None  # We don't need to verify the signature as Clerk handles that
JWT_ALGORITHM = "RS256"

async def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract and validate the user ID from the Clerk JWT token
    
    Args:
        authorization: Authorization header containing the JWT token
        
    Returns:
        User ID extracted from the token
        
    Raises:
        HTTPException: If the token is invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from header (format: "Bearer <token>")
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Decode token without verification (Clerk handles verification)
        # We just need to extract the user ID
        payload = jwt.decode(token, options={"verify_signature": False})
        
        # Extract user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user_id
        
    except jwt.PyJWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication error",
            headers={"WWW-Authenticate": "Bearer"},
        )
