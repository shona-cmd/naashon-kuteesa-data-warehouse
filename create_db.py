import sqlite3

# Connect to (or create) the database file named after you
conn = sqlite3.connect('naashon_kuteesa.db')
cursor = conn.cursor()

# Create customers table
cursor.execute('''
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    location TEXT
)
''')

# Create products table
cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price REAL
)
''')

# Create sales table (fact table for the warehouse)
cursor.execute('''
CREATE TABLE IF NOT EXISTS sales (
    sale_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    sale_date DATE,
    FOREIGN KEY (customer_id) REFERENCES customers (customer_id),
    FOREIGN KEY (product_id) REFERENCES products (product_id)
)
''')

conn.commit()
print("Database 'naashon_kuteesa.db' created with tables!")

# Insert sample customers
customers_data = [
    (1, 'Alice Johnson', 'alice@email.com', 'New York'),
    (2, 'Bob Smith', 'bob@email.com', 'Los Angeles'),
    (3, 'Carol Davis', 'carol@email.com', 'Chicago')
]
cursor.executemany('INSERT OR REPLACE INTO customers VALUES (?, ?, ?, ?)', customers_data)

# Insert sample products
products_data = [
    (1, 'Laptop', 'Electronics', 999.99),
    (2, 'Mouse', 'Electronics', 29.99),
    (3, 'Book', 'Literature', 19.99)
]
cursor.executemany('INSERT OR REPLACE INTO products VALUES (?, ?, ?, ?)', products_data)

# Insert sample sales
sales_data = [
    (1, 1, 1, 1, '2025-10-01'),
    (2, 2, 2, 2, '2025-10-02'),
    (3, 3, 3, 1, '2025-10-03'),
    (4, 1, 3, 3, '2025-10-05')
]
cursor.executemany('INSERT OR REPLACE INTO sales VALUES (?, ?, ?, ?, ?)', sales_data)

conn.commit()
print("Sample data loaded into 'naashon_kuteesa.db'!")

# Example query: Total sales value by customer (join tables for analysis)
cursor.execute('''
SELECT
    c.name,
    SUM(s.quantity * p.price) AS total_sales
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
JOIN products p ON s.product_id = p.product_id
GROUP BY c.customer_id, c.name
ORDER BY total_sales DESC
''')

results = cursor.fetchall()
print("Total Sales by Customer:")
for row in results:
    print(f"- {row[0]}: ${row[1]:.2f}")

conn.close()
