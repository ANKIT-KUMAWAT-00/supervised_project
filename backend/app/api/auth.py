from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.dependencies import get_current_user
from ..models import User, StudentProfile, AdminProfile
from ..schemas import UserCreate, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    db.flush()

    if user.role == "student":
        student_prof = StudentProfile(
            user_id=user.id,
            student_id_number=user_in.student_id_number or f"STU-{user.id:04d}",
            department=user_in.department or "Computer Science",
            preferred_noise_level=user_in.preferred_noise_level or "quiet"
        )
        db.add(student_prof)
    elif user.role == "admin":
        admin_prof = AdminProfile(
            user_id=user.id,
            admin_role="System Administrator",
            department="Operations"
        )
        db.add(admin_prof)

    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prof_data = {}
    if current_user.student_profile:
        prof_data = {
            "student_id_number": current_user.student_profile.student_id_number,
            "department": current_user.student_profile.department,
            "year_of_study": current_user.student_profile.year_of_study,
            "preferred_noise_level": current_user.student_profile.preferred_noise_level
        }
    elif current_user.admin_profile:
        prof_data = {
            "admin_role": current_user.admin_profile.admin_role,
            "department": current_user.admin_profile.department
        }
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "profile": prof_data
    }
