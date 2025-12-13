#!/usr/bin/env python3
"""Script to reset the test database schema."""

import os
os.environ["APP_ENV"] = "test"

from utils import db

if __name__ == "__main__":
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()
    print("✓ Test database schema reset successfully!")
