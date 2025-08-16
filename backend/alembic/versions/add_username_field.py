"""Add username field to users table

Revision ID: add_username_field
Revises: ea4159cee233
Create Date: 2025-01-27 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = "add_username_field"
down_revision = "ea4159cee233"
branch_labels = None
depends_on = None


def upgrade():
    # Add username column (nullable initially to allow existing users)
    op.add_column("users", sa.Column("username", sa.String(50), nullable=True))

    # Create unique index on username
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    # Backfill existing users with generated usernames
    # This ensures no conflicts when we make username non-null
    connection = op.get_bind()

    # Get all existing users without usernames
    users = connection.execute(
        sa.text("SELECT id FROM users WHERE username IS NULL")
    ).fetchall()

    # Generate unique usernames for each user
    for user in users:
        user_id = user[0]
        # Generate username like 'user_<first_8_chars_of_id>'
        username = f"user_{str(user_id)[:8]}"

        # Ensure uniqueness by checking if username exists
        counter = 1
        original_username = username
        while connection.execute(
            sa.text("SELECT 1 FROM users WHERE username = :username"),
            {"username": username},
        ).fetchone():
            username = f"{original_username}_{counter}"
            counter += 1

        # Update the user with the generated username
        connection.execute(
            sa.text("UPDATE users SET username = :username WHERE id = :user_id"),
            {"username": username, "user_id": user_id},
        )

    # Now make username non-nullable
    op.alter_column("users", "username", nullable=False)


def downgrade():
    # Remove the unique index
    op.drop_index("ix_users_username", table_name="users")

    # Remove the username column
    op.drop_column("users", "username")
