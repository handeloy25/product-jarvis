import sqlite3
from pathlib import Path
from contextlib import contextmanager

DATABASE_PATH = Path(__file__).parent.parent / "data" / "jarvis.db"

def get_db_path() -> Path:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    return DATABASE_PATH

@contextmanager
def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                department TEXT NOT NULL,
                hourly_cost_min REAL NOT NULL,
                hourly_cost_max REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                business_unit TEXT,
                service_department TEXT,
                requestor_type TEXT CHECK (requestor_type IN ('business_unit', 'service_department')),
                requestor_id INTEGER,
                status TEXT NOT NULL DEFAULT 'Ideation',
                product_type TEXT NOT NULL DEFAULT 'Internal',
                estimated_value REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requestor_id) REFERENCES service_departments(id) ON DELETE SET NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                position_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                estimated_hours REAL NOT NULL,
                actual_hours REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'General',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_valuations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL UNIQUE,
                valuation_date DATE DEFAULT CURRENT_DATE,
                confidence_level TEXT DEFAULT 'Medium',
                confidence_notes TEXT,
                
                -- Internal: Time Savings
                hours_saved_per_user_per_week REAL,
                number_of_affected_users INTEGER,
                average_hourly_cost REAL,
                
                -- Internal: Error Reduction
                current_errors_per_month INTEGER,
                cost_per_error REAL,
                expected_error_reduction_percent REAL,
                
                -- Internal: Cost Avoidance
                alternative_solution_cost REAL,
                alternative_solution_period TEXT,
                
                -- Internal: Risk Mitigation
                risk_description TEXT,
                risk_probability_percent REAL,
                risk_cost_if_occurs REAL,
                risk_reduction_percent REAL,
                
                -- External: Market Sizing
                target_customer_segment TEXT,
                total_potential_customers INTEGER,
                serviceable_percent REAL,
                achievable_market_share_percent REAL,
                
                -- External: Revenue Projection
                price_per_unit REAL,
                pricing_model TEXT,
                average_deal_size REAL,
                sales_cycle_months INTEGER,
                conversion_rate_percent REAL,
                
                -- External: Customer Economics
                gross_margin_percent REAL,
                expected_customer_lifetime_months INTEGER,
                customer_acquisition_cost REAL,
                
                -- External: Competitive Reference
                competitor_name TEXT,
                competitor_pricing REAL,
                differentiation_summary TEXT,
                
                -- Both: Weight Split
                internal_value_weight REAL DEFAULT 50,
                external_value_weight REAL DEFAULT 50,
                
                -- Strategic Assessment (All Types)
                reach_score INTEGER,
                impact_score REAL,
                strategic_alignment_score INTEGER,
                differentiation_score INTEGER,
                urgency_score INTEGER,
                
                -- Calculated Outputs
                annual_time_savings_value REAL,
                annual_error_reduction_value REAL,
                annual_cost_avoidance_value REAL,
                annual_risk_mitigation_value REAL,
                total_economic_value REAL,
                three_year_revenue_projection REAL,
                customer_ltv REAL,
                strategic_multiplier REAL,
                final_value_low REAL,
                final_value_high REAL,
                rice_score REAL,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS software_costs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                monthly_cost REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_software_allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                software_id INTEGER NOT NULL,
                allocation_percent REAL NOT NULL DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (software_id) REFERENCES software_costs(id) ON DELETE CASCADE,
                UNIQUE(product_id, software_id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS valuation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                valuation_date DATE NOT NULL,
                confidence_level TEXT,
                total_economic_value REAL,
                three_year_revenue_projection REAL,
                strategic_multiplier REAL,
                final_value_low REAL,
                final_value_high REAL,
                rice_score REAL,
                snapshot_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS service_departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS product_service_departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                department_id INTEGER NOT NULL,
                role TEXT NOT NULL DEFAULT 'supporting' CHECK (role IN ('lead', 'supporting')),
                raci TEXT DEFAULT 'Responsible' CHECK (raci IN ('Responsible', 'Accountable', 'Consulted', 'Informed')),
                allocation_percent REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (department_id) REFERENCES service_departments(id) ON DELETE CASCADE,
                UNIQUE(product_id, department_id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS service_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                is_recurring INTEGER DEFAULT 0,
                department_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES service_departments(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                service_department_id INTEGER NOT NULL,
                business_unit TEXT NOT NULL,
                service_type_id INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'Active',
                fee_percent REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_department_id) REFERENCES service_departments(id) ON DELETE CASCADE,
                FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS service_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_id INTEGER NOT NULL,
                position_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                estimated_hours REAL NOT NULL,
                actual_hours REAL,
                is_recurring INTEGER DEFAULT 0,
                recurrence_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
                FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS service_software_allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_id INTEGER NOT NULL,
                software_id INTEGER NOT NULL,
                allocation_percent REAL NOT NULL DEFAULT 100,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
                FOREIGN KEY (software_id) REFERENCES software_costs(id) ON DELETE CASCADE,
                UNIQUE(service_id, software_id)
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'viewer',
                department_id INTEGER REFERENCES service_departments(id),
                password_hash TEXT,
                invite_token TEXT,
                invite_status TEXT DEFAULT 'none',
                supabase_user_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS business_units (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                head_position_id INTEGER REFERENCES positions(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS business_unit_team (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                business_unit_id INTEGER NOT NULL REFERENCES business_units(id) ON DELETE CASCADE,
                position_id INTEGER NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(business_unit_id, position_id)
            )
        """)

        cursor.execute("PRAGMA table_info(products)")
        columns = [row[1] for row in cursor.fetchall()]
        if 'requestor_type' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN requestor_type TEXT CHECK (requestor_type IN ('business_unit', 'service_department'))")
        if 'requestor_id' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN requestor_id INTEGER")
        if 'fee_percent' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN fee_percent REAL DEFAULT 0")
        if 'requestor_business_unit_id' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN requestor_business_unit_id INTEGER REFERENCES business_units(id)")
        if 'bu_approval_status' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN bu_approval_status TEXT CHECK (bu_approval_status IN ('pending', 'approved', 'rejected'))")
        if 'bu_approved_at' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN bu_approved_at TIMESTAMP")
        if 'bu_approved_by' not in columns:
            cursor.execute("ALTER TABLE products ADD COLUMN bu_approved_by TEXT")

        cursor.execute("""
            UPDATE products
            SET requestor_type = 'business_unit'
            WHERE business_unit IS NOT NULL
            AND business_unit != ''
            AND requestor_type IS NULL
        """)
        
        cursor.execute("PRAGMA table_info(tasks)")
        task_columns = [row[1] for row in cursor.fetchall()]
        if 'updated_at' not in task_columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN updated_at TIMESTAMP")
        if 'external_id' not in task_columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN external_id VARCHAR")
        if 'status' not in task_columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN status VARCHAR DEFAULT 'open'")
        if 'assignee_name' not in task_columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN assignee_name VARCHAR")
        if 'due_date' not in task_columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN due_date DATE")
        
        cursor.execute("PRAGMA table_info(service_tasks)")
        service_task_columns = [row[1] for row in cursor.fetchall()]
        if 'updated_at' not in service_task_columns:
            cursor.execute("ALTER TABLE service_tasks ADD COLUMN updated_at TIMESTAMP")
        if 'external_id' not in service_task_columns:
            cursor.execute("ALTER TABLE service_tasks ADD COLUMN external_id VARCHAR")
        if 'status' not in service_task_columns:
            cursor.execute("ALTER TABLE service_tasks ADD COLUMN status VARCHAR DEFAULT 'open'")
        if 'assignee_name' not in service_task_columns:
            cursor.execute("ALTER TABLE service_tasks ADD COLUMN assignee_name VARCHAR")
        if 'due_date' not in service_task_columns:
            cursor.execute("ALTER TABLE service_tasks ADD COLUMN due_date DATE")
        
        cursor.execute("PRAGMA table_info(service_types)")
        service_type_columns = [row[1] for row in cursor.fetchall()]
        if 'department_id' not in service_type_columns:
            cursor.execute("ALTER TABLE service_types ADD COLUMN department_id INTEGER REFERENCES service_departments(id)")

        cursor.execute("PRAGMA table_info(services)")
        services_columns = [row[1] for row in cursor.fetchall()]
        if 'business_unit_id' not in services_columns:
            cursor.execute("ALTER TABLE services ADD COLUMN business_unit_id INTEGER REFERENCES business_units(id)")

        cursor.execute("PRAGMA table_info(product_valuations)")
        val_columns = [row[1] for row in cursor.fetchall()]
        
        new_val_columns = [
            ("expected_adoption_rate_percent", "REAL"),
            ("training_cost_per_user", "REAL"),
            ("rollout_months", "INTEGER"),
            ("time_to_full_productivity_weeks", "INTEGER"),
            ("process_standardization_annual_value", "REAL"),
            ("monthly_churn_rate_percent", "REAL"),
            ("annual_marketing_spend", "REAL"),
            ("annual_sales_team_cost", "REAL"),
            ("year_1_customers", "INTEGER"),
            ("year_2_customers", "INTEGER"),
            ("year_3_customers", "INTEGER"),
            ("adoption_adjusted_annual_value", "REAL"),
            ("total_training_cost", "REAL"),
            ("ltv_cac_ratio", "REAL"),
            ("customer_payback_months", "REAL"),
            ("net_three_year_revenue", "REAL"),
            ("year_1_revenue", "REAL"),
            ("year_2_revenue", "REAL"),
            ("year_3_revenue", "REAL"),
        ]
        
        for col_name, col_type in new_val_columns:
            if col_name not in val_columns:
                cursor.execute(f"ALTER TABLE product_valuations ADD COLUMN {col_name} {col_type}")
        
        new_product_doc_columns = [
            ("raw_valuation_output", "TEXT"),
            ("raw_valuation_output_updated_at", "TIMESTAMP"),
            ("user_flow", "TEXT"),
            ("user_flow_updated_at", "TIMESTAMP"),
            ("specifications", "TEXT"),
            ("specifications_updated_at", "TIMESTAMP"),
            ("persona_feedback", "TEXT"),
            ("persona_feedback_updated_at", "TIMESTAMP"),
            ("valuation_complete", "INTEGER DEFAULT 0"),
            ("valuation_type", "TEXT"),
            ("valuation_confidence", "TEXT DEFAULT 'Low'"),
            ("quick_estimate_inputs", "TEXT"),
        ]
        
        for col_name, col_type in new_product_doc_columns:
            if col_name not in columns:
                cursor.execute(f"ALTER TABLE products ADD COLUMN {col_name} {col_type}")

        migrate_business_units(conn)
        seed_default_admin(conn)

        conn.commit()


def seed_default_admin(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] > 0:
        return

    cursor.execute(
        "INSERT INTO users (email, name, role, invite_status) VALUES (?, ?, ?, ?)",
        ("admin@productjarvis.io", "Admin User", "admin", "accepted")
    )


def migrate_business_units(conn):
    """
    Migrate legacy business_unit text values to the new business_units table.
    Creates business_units entries and links them via foreign keys.
    """
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM business_units")
    if cursor.fetchone()[0] > 0:
        return

    unique_bus = set()

    cursor.execute("""
        SELECT DISTINCT business_unit FROM products
        WHERE business_unit IS NOT NULL AND business_unit != ''
    """)
    for row in cursor.fetchall():
        unique_bus.add(row[0])

    cursor.execute("""
        SELECT DISTINCT business_unit FROM services
        WHERE business_unit IS NOT NULL AND business_unit != ''
    """)
    for row in cursor.fetchall():
        unique_bus.add(row[0])

    bu_name_to_id = {}
    for bu_name in unique_bus:
        cursor.execute(
            "INSERT INTO business_units (name) VALUES (?)",
            (bu_name,)
        )
        bu_name_to_id[bu_name] = cursor.lastrowid

    for bu_name, bu_id in bu_name_to_id.items():
        cursor.execute("""
            UPDATE products
            SET requestor_business_unit_id = ?
            WHERE business_unit = ?
            AND requestor_type = 'business_unit'
            AND requestor_business_unit_id IS NULL
        """, (bu_id, bu_name))

        cursor.execute("""
            UPDATE services
            SET business_unit_id = ?
            WHERE business_unit = ?
            AND business_unit_id IS NULL
        """, (bu_id, bu_name))
