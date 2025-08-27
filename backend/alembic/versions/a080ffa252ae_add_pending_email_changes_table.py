"""add_pending_email_changes_table

Revision ID: a080ffa252ae
Revises: c4a45b7426f5
Create Date: 2025-08-17 17:00:35.198388

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a080ffa252ae"
down_revision: Union[str, None] = "c4a45b7426f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create pending_email_changes table
    op.create_table(
        "pending_email_changes",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("current_email", sa.String(length=255), nullable=False),
        sa.Column("new_email", sa.String(length=255), nullable=False),
        sa.Column(
            "current_email_verified", sa.Boolean(), nullable=False, default=False
        ),
        sa.Column("new_email_verified", sa.Boolean(), nullable=False, default=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create index on user_id for faster lookups
    op.create_index(
        op.f("ix_pending_email_changes_user_id"),
        "pending_email_changes",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop the table
    op.drop_index(
        op.f("ix_pending_email_changes_user_id"), table_name="pending_email_changes"
    )
    op.drop_table("pending_email_changes")
