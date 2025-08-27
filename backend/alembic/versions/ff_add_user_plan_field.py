"""add user plan field

Revision ID: ff_add_user_plan
Revises: f0e21cdcad5b
Create Date: 2025-08-27 00:00:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ff_add_user_plan"
down_revision = "f0e21cdcad5b"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("plan", sa.String(length=20), nullable=False, server_default="free"),
    )
    # Drop server default after backfilling existing rows
    op.alter_column("users", "plan", server_default=None)


def downgrade():
    op.drop_column("users", "plan")
