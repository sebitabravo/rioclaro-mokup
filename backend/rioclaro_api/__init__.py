"""
Project package initialization.

On Python 3.14+, mysqlclient wheels may be unavailable in some local environments.
If PyMySQL is installed, expose it as MySQLdb so Django can still use mysql backend.
"""

try:
    import pymysql

    pymysql.install_as_MySQLdb()
except Exception:
    # PyMySQL is optional and not needed when using sqlite (e.g. tests/dev).
    pass
