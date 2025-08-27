"""add_verified_field_to_users

Revision ID: c4a45b7426f5
Revises: 713f39fa8a87
Create Date: 2025-08-17 15:45:22.708792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4a45b7426f5'
down_revision: Union[str, None] = '713f39fa8a87'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add verified column to users table
    op.add_column('users', sa.Column('verified', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove verified column from users table
    op.drop_column('users', 'verified')
