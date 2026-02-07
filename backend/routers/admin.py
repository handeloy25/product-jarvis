from fastapi import APIRouter
from database import get_connection
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["admin"])

DEMO_DATA = {
    "positions": [
        {"title": "Product Manager", "department": "Product", "hourly_cost_min": 65, "hourly_cost_max": 95},
        {"title": "Senior Developer", "department": "Technical", "hourly_cost_min": 75, "hourly_cost_max": 110},
        {"title": "Developer", "department": "Technical", "hourly_cost_min": 50, "hourly_cost_max": 75},
        {"title": "UX Designer", "department": "Design", "hourly_cost_min": 55, "hourly_cost_max": 85},
        {"title": "SEO Specialist", "department": "SEO", "hourly_cost_min": 45, "hourly_cost_max": 70},
        {"title": "Performance Marketer", "department": "Performance Marketing", "hourly_cost_min": 50, "hourly_cost_max": 80},
        {"title": "CRO Analyst", "department": "CRO", "hourly_cost_min": 55, "hourly_cost_max": 85},
        {"title": "Data Analyst", "department": "Data & Analytics", "hourly_cost_min": 55, "hourly_cost_max": 90},
    ],
    "software": [
        {"name": "Jira", "description": "Project management and issue tracking", "monthly_cost": 1500},
        {"name": "Figma", "description": "Design and prototyping tool", "monthly_cost": 750},
        {"name": "AWS", "description": "Cloud infrastructure", "monthly_cost": 8500},
        {"name": "SEMrush", "description": "SEO and competitive research", "monthly_cost": 450},
        {"name": "Google Ads", "description": "Paid advertising platform", "monthly_cost": 200},
        {"name": "Hotjar", "description": "User behavior analytics and heatmaps", "monthly_cost": 300},
    ],
    "service_departments": [
        {"name": "Technical", "description": "Software development and engineering"},
        {"name": "SEO", "description": "Search engine optimization"},
        {"name": "Performance Marketing", "description": "Paid advertising and acquisition"},
        {"name": "Design", "description": "UX/UI design and branding"},
        {"name": "CRO", "description": "Conversion rate optimization"},
        {"name": "Data & Analytics", "description": "Data analysis and business intelligence"},
    ],
    "service_types": [
        {"name": "Ongoing Support", "description": "Recurring monthly support and maintenance", "is_recurring": 1, "department_name": "Technical"},
        {"name": "Ad-hoc Development", "description": "One-time development requests", "is_recurring": 0, "department_name": "Technical"},
        {"name": "Link Building", "description": "SEO link acquisition and outreach", "is_recurring": 1, "department_name": "SEO"},
        {"name": "Technical SEO Audit", "description": "SEO technical site analysis", "is_recurring": 0, "department_name": "SEO"},
        {"name": "Keyword Research", "description": "SEO keyword analysis and strategy", "is_recurring": 0, "department_name": "SEO"},
        {"name": "Campaign Management", "description": "Recurring marketing campaign management", "is_recurring": 1, "department_name": "Performance Marketing"},
        {"name": "Ad-hoc Campaign", "description": "One-time campaign setup", "is_recurring": 0, "department_name": "Performance Marketing"},
        {"name": "UI/UX Design", "description": "User interface and experience design", "is_recurring": 0, "department_name": "Design"},
        {"name": "Design Retainer", "description": "Ongoing design support", "is_recurring": 1, "department_name": "Design"},
        {"name": "CRO Testing", "description": "A/B testing and optimization", "is_recurring": 1, "department_name": "CRO"},
        {"name": "CRO Audit", "description": "Comprehensive conversion audit", "is_recurring": 0, "department_name": "CRO"},
        {"name": "Data Analysis", "description": "Business intelligence reporting", "is_recurring": 1, "department_name": "Data & Analytics"},
        {"name": "Dashboard Build", "description": "One-time dashboard development", "is_recurring": 0, "department_name": "Data & Analytics"},
    ],
}

DEMO_PRODUCTS = [
    {
        "name": "SEO Content Generator",
        "description": "AI-powered tool to generate SEO-optimized content at scale, helping the SEO team service all brands more efficiently",
        "requestor_type": "service_department",
        "requestor_name": "SEO",
        "status": "In Development",
        "product_type": "Internal",
        "estimated_value": 180000,
        "fee_percent": 0,
        "departments": [("Technical", "lead"), ("SEO", "supporting")],
        "tasks": [
            ("Product Manager", "Requirements gathering and roadmap", 40, 38),
            ("Senior Developer", "AI integration and backend architecture", 120, 95),
            ("Developer", "Frontend dashboard development", 80, 82),
            ("UX Designer", "UI/UX design for content editor", 30, 28),
            ("SEO Specialist", "SEO rules engine configuration", 25, 20),
        ],
        "software": [("AWS", 15), ("Jira", 10)],
    },
    {
        "name": "Campaign Performance Dashboard",
        "description": "Real-time dashboard for tracking campaign performance across all channels and brands",
        "requestor_type": "service_department",
        "requestor_name": "Performance Marketing",
        "status": "Ideation",
        "product_type": "Internal",
        "estimated_value": 95000,
        "fee_percent": 0,
        "departments": [("Technical", "lead"), ("Data & Analytics", "supporting"), ("Performance Marketing", "supporting")],
        "tasks": [
            ("Product Manager", "Stakeholder interviews and requirements", 20, 0),
            ("Data Analyst", "Data pipeline design", 35, 0),
            ("Senior Developer", "Backend API development", 60, 0),
            ("Developer", "Frontend visualization components", 45, 0),
            ("UX Designer", "Dashboard UX design", 20, 0),
        ],
        "software": [("AWS", 10), ("Jira", 5)],
    },
    {
        "name": "Lines.com Mobile App Redesign",
        "description": "Complete redesign of the Lines.com mobile app to improve user engagement and conversion",
        "requestor_type": "business_unit",
        "business_unit": "Lines.com",
        "status": "In Development",
        "product_type": "Internal",
        "estimated_value": 450000,
        "fee_percent": 10,
        "departments": [("Technical", "lead"), ("Design", "supporting"), ("CRO", "supporting")],
        "tasks": [
            ("Product Manager", "Product strategy and roadmap", 60, 55),
            ("UX Designer", "User research and wireframes", 80, 85),
            ("UX Designer", "High-fidelity mockups", 60, 72),
            ("Senior Developer", "iOS development", 150, 110),
            ("Senior Developer", "Android development", 150, 95),
            ("Developer", "API integration", 80, 60),
            ("CRO Analyst", "A/B testing strategy", 30, 15),
        ],
        "software": [("Figma", 40), ("AWS", 20), ("Jira", 15), ("Hotjar", 30)],
    },
    {
        "name": "Landing Page Builder SaaS",
        "description": "No-code landing page builder for small businesses. B2B SaaS product targeting marketing agencies and SMBs",
        "requestor_type": "service_department",
        "requestor_name": "Technical",
        "status": "In Development",
        "product_type": "External",
        "estimated_value": 2500000,
        "fee_percent": 0,
        "departments": [("Technical", "lead"), ("Design", "supporting"), ("CRO", "supporting")],
        "tasks": [
            ("Product Manager", "Market research and product strategy", 80, 75),
            ("UX Designer", "Product design system", 100, 95),
            ("Senior Developer", "Core platform architecture", 200, 180),
            ("Senior Developer", "Template engine development", 160, 140),
            ("Developer", "Component library", 120, 100),
            ("Developer", "User dashboard", 80, 65),
            ("CRO Analyst", "Conversion optimization features", 40, 30),
        ],
        "software": [("AWS", 25), ("Figma", 20), ("Jira", 15)],
    },
    {
        "name": "Affiliate Tracking Platform",
        "description": "Enterprise affiliate tracking and attribution platform. B2B product for affiliate networks and advertisers",
        "requestor_type": "service_department",
        "requestor_name": "Data & Analytics",
        "status": "Ideation",
        "product_type": "External",
        "estimated_value": 3200000,
        "fee_percent": 0,
        "departments": [("Technical", "lead"), ("Data & Analytics", "lead")],
        "tasks": [
            ("Product Manager", "Competitive analysis and positioning", 40, 0),
            ("Data Analyst", "Attribution model design", 60, 0),
            ("Senior Developer", "Platform architecture planning", 40, 0),
        ],
        "software": [("AWS", 5), ("Jira", 5)],
    },
]

DEMO_SERVICES = [
    {
        "name": "Technical Support for Lines.com",
        "description": "Ongoing technical support, bug fixes, and maintenance for Lines.com platform",
        "department_name": "Technical",
        "business_unit": "Lines.com",
        "service_type_name": "Ongoing Support",
        "status": "Active",
        "fee_percent": 8,
        "tasks": [
            ("Senior Developer", "Production support and incident response", 40, 35, 1, "monthly"),
            ("Developer", "Bug fixes and patches", 60, 58, 1, "monthly"),
            ("Developer", "Performance monitoring", 20, 18, 1, "monthly"),
        ],
        "software": [("AWS", 10), ("Jira", 15)],
    },
    {
        "name": "SEO Retainer for Refills.com",
        "description": "Monthly SEO optimization, content strategy, and ranking improvements",
        "department_name": "SEO",
        "business_unit": "Refills.com",
        "service_type_name": "Link Building",
        "status": "Active",
        "fee_percent": 12,
        "tasks": [
            ("SEO Specialist", "Keyword research and strategy", 15, 14, 1, "monthly"),
            ("SEO Specialist", "On-page optimization", 20, 22, 1, "monthly"),
            ("SEO Specialist", "Link building outreach", 25, 20, 1, "monthly"),
            ("Data Analyst", "SEO performance reporting", 10, 8, 1, "monthly"),
        ],
        "software": [("SEMrush", 50)],
    },
    {
        "name": "Q1 CRO Audit for HighRoller.com",
        "description": "Comprehensive conversion rate optimization audit and recommendations",
        "department_name": "CRO",
        "business_unit": "HighRoller.com",
        "service_type_name": "CRO Audit",
        "status": "Active",
        "fee_percent": 10,
        "tasks": [
            ("CRO Analyst", "Funnel analysis", 20, 18, 0, None),
            ("CRO Analyst", "Heatmap and session analysis", 15, 12, 0, None),
            ("UX Designer", "Wireframe recommendations", 10, 8, 0, None),
            ("Data Analyst", "Statistical analysis of test results", 12, 0, 0, None),
        ],
        "software": [("Hotjar", 40), ("Google Ads", 20)],
    },
]


@router.post("/seed-demo-data")
def seed_demo_data():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        position_ids = {}
        for pos in DEMO_DATA["positions"]:
            cursor.execute(
                "INSERT INTO positions (title, department, hourly_cost_min, hourly_cost_max) VALUES (?, ?, ?, ?)",
                (pos["title"], pos["department"], pos["hourly_cost_min"], pos["hourly_cost_max"])
            )
            position_ids[pos["title"]] = cursor.lastrowid
        
        software_ids = {}
        for sw in DEMO_DATA["software"]:
            cursor.execute(
                "INSERT INTO software_costs (name, description, monthly_cost) VALUES (?, ?, ?)",
                (sw["name"], sw["description"], sw["monthly_cost"])
            )
            software_ids[sw["name"]] = cursor.lastrowid
        
        dept_ids = {}
        for dept in DEMO_DATA["service_departments"]:
            cursor.execute(
                "INSERT INTO service_departments (name, description) VALUES (?, ?)",
                (dept["name"], dept["description"])
            )
            dept_ids[dept["name"]] = cursor.lastrowid
        
        service_type_ids = {}
        for st in DEMO_DATA["service_types"]:
            dept_id = dept_ids.get(st["department_name"])
            cursor.execute(
                "INSERT INTO service_types (name, description, is_recurring, department_id) VALUES (?, ?, ?, ?)",
                (st["name"], st["description"], st["is_recurring"], dept_id)
            )
            service_type_ids[st["name"]] = cursor.lastrowid
        
        for product in DEMO_PRODUCTS:
            requestor_id = None
            business_unit = None
            
            if product["requestor_type"] == "service_department":
                requestor_id = dept_ids.get(product["requestor_name"])
            else:
                business_unit = product.get("business_unit")
            
            cursor.execute("""
                INSERT INTO products (name, description, business_unit, requestor_type, requestor_id, 
                                     status, product_type, estimated_value, fee_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                product["name"], product["description"], business_unit,
                product["requestor_type"], requestor_id, product["status"],
                product["product_type"], product["estimated_value"], product["fee_percent"]
            ))
            product_id = cursor.lastrowid
            
            for dept_name, role in product["departments"]:
                dept_id = dept_ids.get(dept_name)
                if dept_id:
                    cursor.execute("""
                        INSERT INTO product_service_departments (product_id, department_id, role)
                        VALUES (?, ?, ?)
                    """, (product_id, dept_id, role))
            
            for task in product["tasks"]:
                pos_title, task_name, est_hours, actual_hours = task
                pos_id = position_ids.get(pos_title)
                if pos_id:
                    cursor.execute("""
                        INSERT INTO tasks (product_id, position_id, name, estimated_hours, actual_hours, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (product_id, pos_id, task_name, est_hours, actual_hours if actual_hours > 0 else None, 
                          datetime.now() if actual_hours > 0 else None))
            
            for sw_name, alloc_pct in product["software"]:
                sw_id = software_ids.get(sw_name)
                if sw_id:
                    cursor.execute("""
                        INSERT INTO product_software_allocations (product_id, software_id, allocation_percent)
                        VALUES (?, ?, ?)
                    """, (product_id, sw_id, alloc_pct))
        
        for service in DEMO_SERVICES:
            dept_id = dept_ids.get(service["department_name"])
            st_id = service_type_ids.get(service["service_type_name"])
            
            cursor.execute("""
                INSERT INTO services (name, description, service_department_id, business_unit, 
                                     service_type_id, status, fee_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                service["name"], service["description"], dept_id, service["business_unit"],
                st_id, service["status"], service["fee_percent"]
            ))
            service_id = cursor.lastrowid
            
            for task in service["tasks"]:
                pos_title, task_name, est_hours, actual_hours, is_recurring, recurrence_type = task
                pos_id = position_ids.get(pos_title)
                if pos_id:
                    cursor.execute("""
                        INSERT INTO service_tasks (service_id, position_id, name, estimated_hours, 
                                                  actual_hours, is_recurring, recurrence_type, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (service_id, pos_id, task_name, est_hours, 
                          actual_hours if actual_hours > 0 else None,
                          is_recurring, recurrence_type,
                          datetime.now() if actual_hours > 0 else None))
            
            for sw_name, alloc_pct in service["software"]:
                sw_id = software_ids.get(sw_name)
                if sw_id:
                    cursor.execute("""
                        INSERT INTO service_software_allocations (service_id, software_id, allocation_percent)
                        VALUES (?, ?, ?)
                    """, (service_id, sw_id, alloc_pct))
        
        conn.commit()
    
    return {
        "success": True,
        "data": {
            "message": "Demo data seeded successfully",
            "counts": {
                "positions": len(DEMO_DATA["positions"]),
                "software": len(DEMO_DATA["software"]),
                "service_departments": len(DEMO_DATA["service_departments"]),
                "service_types": len(DEMO_DATA["service_types"]),
                "products": len(DEMO_PRODUCTS),
                "services": len(DEMO_SERVICES),
            }
        },
        "error": None
    }


@router.delete("/clear-all-data")
def clear_all_data():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        tables = [
            "service_software_allocations",
            "service_tasks",
            "services",
            "service_types",
            "product_software_allocations",
            "product_service_departments",
            "valuation_history",
            "product_valuations",
            "tasks",
            "products",
            "software_costs",
            "service_departments",
            "positions",
            "knowledge_base",
        ]
        
        for table in tables:
            cursor.execute(f"DELETE FROM {table}")
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
        
        conn.commit()
    
    return {
        "success": True,
        "data": {"message": "All data cleared successfully"},
        "error": None
    }
