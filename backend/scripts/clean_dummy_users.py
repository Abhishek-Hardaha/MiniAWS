import psycopg2

def main():
    conn = psycopg2.connect("postgresql://miniaws:miniaws123@127.0.0.1:5432/miniaws_db")
    cur = conn.cursor()
    
    dummy_ids = [
        "usr_aarav_sharma",
        "usr_sarah_connor",
        "usr_c205c4e459fd",
        "usr_541505e7ae4f"
    ]
    dummy_emails = [
        "aarav@miniaws.com",
        "sarah@miniaws.com",
        "john.wick@miniaws.com",
        "elena@miniaws.com"
    ]
    
    cur.execute(
        "DELETE FROM users WHERE id = ANY(%s) OR email = ANY(%s)",
        (dummy_ids, dummy_emails)
    )
    conn.commit()
    print("SUCCESS: Deleted dummy profiles.")
    
    cur.execute("SELECT id, email, full_name, username FROM users ORDER BY created_at ASC")
    remaining = cur.fetchall()
    print(f"Remaining users ({len(remaining)}):")
    for u in remaining:
        print(f" - {u[2]} ({u[1]}) [ID: {u[0]}]")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    main()
