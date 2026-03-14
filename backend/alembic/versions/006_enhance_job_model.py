"""add filterable columns to jobs table

Revision ID: 006
Revises: 005
Create Date: 2026-03-14
"""
from alembic import op
import sqlalchemy as sa

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None

NEW_COLUMNS = [
    ("salary_min", sa.Integer),
    ("salary_max", sa.Integer),
    ("experience_min", sa.Integer),
    ("experience_max", sa.Integer),
    ("job_type_enum", sa.String(30)),
    ("is_remote", sa.Integer),
    ("city", sa.String(100)),
    ("state", sa.String(100)),
    ("scrape_batch_id", sa.String(36)),
]


def upgrade() -> None:
    for name, col_type in NEW_COLUMNS:
        kwargs = {"nullable": True}
        if name == "is_remote":
            kwargs["server_default"] = "0"
        op.add_column(
            "jobs",
            sa.Column(name, col_type, **kwargs),
        )


def downgrade() -> None:
    for name, _ in reversed(NEW_COLUMNS):
        op.drop_column("jobs", name)
