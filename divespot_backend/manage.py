#!/usr/bin/env python3
import os
import sqlite3
from pathlib import Path
from flask import Flask
from app import create_app
from app.db import db
from app.models import User

MIGRATIONS = ["migrations/001_initial.sql", "migrations/002_seed_spots.sql"]
DB_PATH = "dive_spot.db"

def apply_sql(sql_path: str):
    print(f"> Applying {sql_path}")
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        with open(sql_path, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        conn.commit()

def migrate():
    # simple file-based migration tracker
    mig_table_sql = """
    CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute(mig_table_sql)
        conn.commit()

        for m in MIGRATIONS:
            cur = conn.execute("SELECT 1 FROM _migrations WHERE filename = ?", (m,))
            if cur.fetchone() is None:
                print(f"Running migration {m}")
                with open(m, "r", encoding="utf-8") as f:
                    conn.executescript(f.read())
                conn.execute("INSERT INTO _migrations (filename) VALUES (?)", (m,))
                conn.commit()
            else:
                print(f"Already applied: {m}")

def drop():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("Deleted database file:", DB_PATH)
    else:
        print("No database file to delete.")

def create_tables_via_orm():
    # optional helper if you want to sync ORM without migrations
    app = create_app()
    with app.app_context():
        db.create_all()
    print("ORM create_all finished.")

def create_user_cli(username, password, email, display_name):
    app = create_app()
    with app.app_context():
        user = User(username=username, email=email, display_name=display_name)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        print(f"User {username} created successfully.")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Manage DiveSpot API")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("migrate")
    sub.add_parser("drop")
    sub.add_parser("create-all")
    create_user_parser = sub.add_parser("create-user")
    create_user_parser.add_argument("username", help="Username for the new user")
    create_user_parser.add_argument("password", help="Password for the new user")
    create_user_parser.add_argument("email", help="Email for the new user")
    create_user_parser.add_argument("display_name", help="Display name for the new user")


    args = parser.parse_args()
    if args.cmd == "migrate":
        migrate()
    elif args.cmd == "drop":
        drop()
    elif args.cmd == "create-all":
        create_tables_via_orm()
    elif args.cmd == "create-user":
        create_user_cli(args.username, args.password, args.email, args.display_name)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
