from sqlalchemy import create_engine, text
from app.core.database import db_url, _scrub_password

if db_url.startswith("sqlite"):
    print("[*] Local SQLite is active. No PostgreSQL database is connected.")
else:
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print(f"[*] Inspecting database schema at: {_scrub_password(db_url)}")
        
        # 1. Get all tables in public schema
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        """))
        tables = [row[0] for row in result.fetchall()]
        print(f"\n[*] Tables found in public schema ({len(tables)}):")
        
        for table in tables:
            # Row count
            count_res = conn.execute(text(f"SELECT COUNT(*) FROM public.\"{table}\";"))
            row_count = count_res.fetchone()[0]
            print(f"- {table} ({row_count} rows)")
            
            # Columns
            col_res = conn.execute(text(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = '{table}';
            """))
            cols = col_res.fetchall()
            for col in cols:
                print(f"  * {col[0]}: {col[1]} (nullable={col[2]}, default={col[3]})")
                
        # 2. Get triggers
        print("\n[*] Triggers found:")
        trig_res = conn.execute(text("""
            SELECT trigger_name, event_manipulation, event_object_table, action_statement
            FROM information_schema.triggers
            WHERE trigger_schema = 'public';
        """))
        for trig in trig_res.fetchall():
            print(f"- {trig[0]} on {trig[2]} ({trig[1]}): {trig[3]}")
            
        # 3. Get custom functions
        print("\n[*] Custom PostgreSQL functions:")
        func_res = conn.execute(text("""
            SELECT routine_name, routine_type
            FROM information_schema.routines
            WHERE routine_schema = 'public';
        """))
        for fn in func_res.fetchall():
            print(f"- {fn[0]} ({fn[1]})")

    engine.dispose()
