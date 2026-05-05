"""
Database helper utilities for safe column value handling.

These helpers address the common issue where GET endpoints return all column values
as strings, but UPDATE operations fail because MySQL ENUM columns, datetime columns,
and other typed columns reject certain string values.
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, Set


def get_column_info(db: Session, table_name: str) -> Dict[str, Dict[str, Any]]:
    """
    Get column metadata (name, type, nullable, default) from a MySQL table.
    Returns dict mapping column_name -> {type, nullable, default, key, extra}.
    """
    rows = db.execute(text(f"SHOW COLUMNS FROM `{table_name}`")).fetchall()
    info = {}
    for row in rows:
        col_name = row[0]
        col_type = row[1]  # e.g. "enum('Y','N')", "int(11)", "datetime", "varchar(255)"
        nullable = row[2] == 'YES'
        key = row[3]
        default = row[4]
        extra = row[5]
        info[col_name] = {
            'type': col_type,
            'nullable': nullable,
            'default': default,
            'key': key,
            'extra': extra,
        }
    return info


def sanitize_value_for_column(value: Any, col_info: Dict[str, Any]) -> Any:
    """
    Sanitize a value based on column type info so it can be safely written to MySQL.
    Handles ENUM, datetime, int, decimal, and other typed columns.
    """
    col_type = col_info['type'].lower()

    # Handle None/empty
    if value is None or value == '':
        if col_info['nullable']:
            return None
        # For non-nullable columns, use sensible defaults
        if 'int' in col_type:
            return 0
        if 'decimal' in col_type or 'float' in col_type or 'double' in col_type:
            return 0
        if 'datetime' in col_type or 'timestamp' in col_type:
            return None  # Will be handled below
        if 'date' in col_type:
            return None
        if col_type.startswith('enum'):
            # Return the first enum value as default
            enum_vals = _parse_enum_values(col_type)
            return enum_vals[0] if enum_vals else ''
        return ''

    str_val = str(value).strip()

    # ENUM columns - validate the value is in the allowed set
    if col_type.startswith('enum'):
        enum_vals = _parse_enum_values(col_type)
        if str_val in enum_vals:
            return str_val
        # Try case-insensitive match
        for ev in enum_vals:
            if ev.lower() == str_val.lower():
                return ev
        # Value not in enum - return the first value or empty
        if col_info['nullable']:
            return None
        return enum_vals[0] if enum_vals else ''

    # SET columns - validate each value
    if col_type.startswith('set'):
        set_vals = _parse_enum_values(col_type)  # same parsing
        if not str_val:
            return ''
        parts = [p.strip() for p in str_val.split(',')]
        valid_parts = [p for p in parts if p in set_vals]
        return ','.join(valid_parts)

    # Datetime columns - handle '0000-00-00 00:00:00' and other invalid dates
    if 'datetime' in col_type or 'timestamp' in col_type:
        if str_val in ('0000-00-00 00:00:00', '0000-00-00', ''):
            if col_info['nullable']:
                return None
            return '1970-01-01 00:00:00'
        return str_val

    # Date columns
    if col_type == 'date':
        if str_val in ('0000-00-00', ''):
            if col_info['nullable']:
                return None
            return '1970-01-01'
        return str_val

    # Integer columns
    if 'int' in col_type:
        try:
            return int(float(str_val))
        except (ValueError, TypeError):
            return 0

    # Decimal/float columns
    if 'decimal' in col_type or 'float' in col_type or 'double' in col_type:
        try:
            return float(str_val)
        except (ValueError, TypeError):
            return 0.0

    # For varchar, text, etc - just return the string
    return str_val


def _parse_enum_values(col_type: str) -> list:
    """Parse ENUM('val1','val2',...) or SET('val1','val2',...) into a list of values."""
    # e.g. "enum('Y','N')" -> ['Y', 'N']
    start = col_type.find('(')
    end = col_type.rfind(')')
    if start == -1 or end == -1:
        return []
    inner = col_type[start+1:end]
    vals = []
    for part in inner.split(','):
        part = part.strip().strip("'\"")
        vals.append(part)
    return vals


def build_safe_update(
    db: Session,
    table_name: str,
    data: Dict[str, Any],
    where_col: str,
    where_val: Any,
    allowed_cols: Optional[list] = None,
    skip_cols: Optional[Set[str]] = None,
) -> bool:
    """
    Build and execute a safe UPDATE statement that respects column types.

    Args:
        db: SQLAlchemy session
        table_name: Name of the table to update
        data: Dict of column_name -> value to update
        where_col: The WHERE column (e.g. 'site_id')
        where_val: The WHERE value
        allowed_cols: Optional list of columns that are allowed to be updated
        skip_cols: Optional set of columns to skip

    Returns:
        True if update was executed, False if no valid columns to update
    """
    col_info = get_column_info(db, table_name)
    skip = skip_cols or set()
    skip.add(where_col)  # Never update the WHERE column itself

    updates = []
    params = {where_col: where_val}

    for key, value in data.items():
        if key in skip:
            continue
        if key not in col_info:
            continue
        if allowed_cols is not None and key not in allowed_cols:
            continue

        safe_value = sanitize_value_for_column(value, col_info[key])
        updates.append(f"`{key}` = :{key}")
        params[key] = safe_value

    if not updates:
        return False

    query = f"UPDATE `{table_name}` SET {', '.join(updates)} WHERE `{where_col}` = :{where_col}"
    db.execute(text(query), params)
    db.commit()
    return True
