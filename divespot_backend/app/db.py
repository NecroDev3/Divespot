from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask import Flask

db = SQLAlchemy()

# Ensure FK constraints are enforced in SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
    except Exception:
        pass

def init_sqlite_pragma(app: Flask):
    # nothing extra; kept for symmetry/clarity
    pass
