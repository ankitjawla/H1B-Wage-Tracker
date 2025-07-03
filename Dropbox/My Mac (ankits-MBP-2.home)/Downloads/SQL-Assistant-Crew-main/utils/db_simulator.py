import sqlite3
import pandas as pd
import os
DB_PATH = "data/sample_db.sqlite"
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
def setup_sample_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Drop tables if they exist (for repeatability in dev)
    cursor.execute("DROP TABLE IF EXISTS order_items;")
    cursor.execute("DROP TABLE IF EXISTS orders;")
    cursor.execute("DROP TABLE IF EXISTS products;")
    cursor.execute("DROP TABLE IF EXISTS customers;")
    cursor.execute("DROP TABLE IF EXISTS employees;")
    cursor.execute("DROP TABLE IF EXISTS departments;")

    # Create richer example tables
    cursor.execute("""
        CREATE TABLE products (
            product_id INTEGER PRIMARY KEY,
            product_name TEXT,
            category TEXT,
            price REAL
        );
    """)
    cursor.execute("""
        CREATE TABLE customers (
            customer_id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT,
            country TEXT,
            signup_date TEXT
        );
    """)
    cursor.execute("""
        CREATE TABLE orders (
            order_id INTEGER PRIMARY KEY,
            customer_id INTEGER,
            order_date TEXT,
            total_amount REAL,
            FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
        );
    """)
    cursor.execute("""
        CREATE TABLE order_items (
            order_item_id INTEGER PRIMARY KEY,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY(order_id) REFERENCES orders(order_id),
            FOREIGN KEY(product_id) REFERENCES products(product_id)
        );
    """)
    cursor.execute("""
        CREATE TABLE employees (
            employee_id INTEGER PRIMARY KEY,
            name TEXT,
            department_id INTEGER,
            hire_date TEXT
        );
    """)
    cursor.execute("""
        CREATE TABLE departments (
            department_id INTEGER PRIMARY KEY,
            department_name TEXT
        );
    """)

    # Populate with mock data
    cursor.executemany("INSERT INTO products VALUES (?, ?, ?, ?);", [
        (1, 'Widget A', 'Widgets', 25.0),
        (2, 'Widget B', 'Widgets', 30.0),
        (3, 'Gadget X', 'Gadgets', 45.0),
        (4, 'Gadget Y', 'Gadgets', 50.0),
        (5, 'Thingamajig', 'Tools', 15.0)
    ])
    cursor.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?);", [
        (1, 'Alice', 'alice@example.com', 'USA', '2023-10-01'),
        (2, 'Bob', 'bob@example.com', 'Canada', '2023-11-15'),
        (3, 'Charlie', 'charlie@example.com', 'USA', '2024-01-10'),
        (4, 'Diana', 'diana@example.com', 'UK', '2024-02-20')
    ])
    cursor.executemany("INSERT INTO orders VALUES (?, ?, ?, ?);", [
        (1, 1, '2024-04-03', 100.0),
        (2, 2, '2024-04-12', 150.0),
        (3, 1, '2024-04-15', 120.0),
        (4, 3, '2024-04-20', 180.0),
        (5, 4, '2024-04-28', 170.0)
    ])
    cursor.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?);", [
        (1, 1, 1, 2, 25.0),
        (2, 1, 2, 1, 30.0),
        (3, 2, 3, 2, 45.0),
        (4, 3, 4, 1, 50.0),
        (5, 4, 5, 3, 15.0),
        (6, 5, 1, 1, 25.0)
    ])
    cursor.executemany("INSERT INTO employees VALUES (?, ?, ?, ?);", [
        (1, 'Eve', 1, '2022-01-15'),
        (2, 'Frank', 2, '2021-07-23'),
        (3, 'Grace', 1, '2023-03-10')
    ])
    cursor.executemany("INSERT INTO departments VALUES (?, ?);", [
        (1, 'Sales'),
        (2, 'Engineering'),
        (3, 'HR')
    ])

    conn.commit()
    conn.close()

def run_query(query):
    try:
        conn = sqlite3.connect(DB_PATH)
        df = pd.read_sql_query(query, conn)
        conn.close()
        return df.head().to_string(index=False)
    except Exception as e:
        return f"Query failed: {e}"

def get_db_schema(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    schema = ""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for table_name, in tables:
        cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
        create_stmt = cursor.fetchone()[0]
        schema += create_stmt + ";\n\n"
    conn.close()
    return schema

def get_structured_schema(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    lines = ["# Database Schema\n"]
    
    for table_name, in tables:
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        # Add table header with description
        lines.append(f"## {table_name}")
        lines.append("| Column | Type | Primary Key | Foreign Key |")
        lines.append("|--------|------|-------------|-------------|")
        
        # Get foreign key information
        cursor.execute(f"PRAGMA foreign_key_list({table_name})")
        fks = {fk[3]: f"References {fk[2]}({fk[4]})" for fk in cursor.fetchall()}
        
        for col in columns:
            name, type_, _, _, is_pk, _ = col
            is_pk_str = "✓" if is_pk else ""
            fk_str = fks.get(name, "")
            lines.append(f"| {name} | {type_} | {is_pk_str} | {fk_str} |")
        lines.append("")  # Add blank line between tables
    
    conn.close()
    return '\n'.join(lines)

# To run this code:
# 1. Make sure you have Python installed with sqlite3 and pandas packages
# 2. Save this file as db_simulator.py
# 3. Run from command line: python db_simulator.py
# This will create a sample database in data/sample_db.sqlite
# You can then use the functions:
# - setup_sample_db(): Creates/resets the database with sample data
# - run_query(query): Executes a SQL query and returns results
# - get_db_schema(db_path): Returns the database schema
# - get_structured_schema(db_path): Returns a formatted list of tables and columns

if __name__ == "__main__":
    setup_sample_db()
    print("Sample database created.")
