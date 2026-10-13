from app.database import engine
from sqlalchemy import text

def run_migrations():
    print("Running database migrations...")
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE hosted_websites ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);"))
        conn.execute(text("UPDATE users SET username = LOWER(SPLIT_PART(email, '@', 1)) WHERE username IS NULL;"))
        conn.commit()

        users = conn.execute(text("SELECT id, email, username FROM users")).fetchall()
        print("Users:", users)
        sites = conn.execute(text("SELECT id, user_id, subdomain, custom_domain FROM hosted_websites")).fetchall()
        print("Sites:", sites)

if __name__ == "__main__":
    run_migrations()
