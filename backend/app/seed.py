from .database import SessionLocal, engine, Base
from .models import User, Task, Report, Feedback, Notification, UserRole
from .auth import get_password_hash
import uuid

def seed_database():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == "admin@test.com").first()
    if existing_admin:
        print("[v] Database already seeded!")
        print("\n=== LOGIN CREDENTIALS ===")
        print("Admin: admin@test.com / admin123")
        print("Mentor: mentor@test.com / mentor123")
        print("Intern: intern@test.com / intern123")
        print("========================\n")
        db.close()
        return
    
    # Create Admin
    admin = User(
        id=str(uuid.uuid4()),
        email="admin@test.com",
        full_name="Admin User",
        role=UserRole.ADMIN,
        hashed_password=get_password_hash("admin123"),
        is_active=True
    )
    db.add(admin)
    
    # Create Mentor
    mentor = User(
        id=str(uuid.uuid4()),
        email="mentor@test.com",
        full_name="Mentor User",
        role=UserRole.MENTOR,
        hashed_password=get_password_hash("mentor123"),
        is_active=True
    )
    db.add(mentor)
    
    # Create Intern
    intern = User(
        id=str(uuid.uuid4()),
        email="intern@test.com",
        full_name="Intern User",
        role=UserRole.INTERN,
        hashed_password=get_password_hash("intern123"),
        is_active=True
    )
    db.add(intern)
    
    db.commit()
    
    print("[v] Database seeded successfully!")
    print("\n=== LOGIN CREDENTIALS ===")
    print("Admin: admin@test.com / admin123")
    print("Mentor: mentor@test.com / mentor123")
    print("Intern: intern@test.com / intern123")
    print("========================\n")
    
    db.close()

if __name__ == "__main__":
    seed_database()