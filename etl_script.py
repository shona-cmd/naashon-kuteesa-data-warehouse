import sqlite3
import pandas as pd
from datetime import datetime

# Connect to your warehouse
conn = sqlite3.connect('naashon_kuteesa.db')
cursor = conn.cursor()

# Step 1: Extract - Read from CSV
df = pd.read_csv('sales_source.csv')

# Step 2: Transform
# Clean data: Standardize emails, calculate total_price, convert date
df['email'] = df['email'].str.lower().str.strip()
df['total_price'] = df['quantity'] * df['raw_price']
df['sale_date'] = pd.to_datetime(df['sale_date'])

# Get or insert customer IDs (upsert logic)
for _, row in df.iterrows():
    cursor.execute('''
    INSERT OR IGNORE INTO customers (customer_id, name, email, location)
    VALUES ((SELECT COALESCE(MAX(customer_id), 0) + 1 FROM customers), ?, ?, 'Unknown')
    ''', (row['customer_name'], row['email']))
    cursor.execute('SELECT customer_id FROM customers WHERE name = ? AND email = ?', (row['customer_name'], row['email']))
    customer_id = cursor.fetchone()[0]

    # Get or insert product ID
    cursor.execute('SELECT product_id FROM products WHERE name = ?', (row['product_name'],))
    product_result = cursor.fetchone()
    if product_result:
        product_id = product_result[0]
    else:
        cursor.execute('SELECT COALESCE(MAX(product_id), 0) + 1 FROM products')
        product_id = cursor.fetchone()[0]
        cursor.execute('INSERT INTO products (product_id, name, category, price) VALUES (?, ?, ?, ?)',
                       (product_id, row['product_name'], row['category'], row['raw_price']))

    # Load into sales (upsert by transaction_id, but since it's new, just insert)
    cursor.execute('''
    INSERT INTO sales (sale_id, customer_id, product_id, quantity, sale_date)
    VALUES ((SELECT COALESCE(MAX(sale_id), 0) + 1 FROM sales), ?, ?, ?, ?)
    ''', (customer_id, product_id, row['quantity'], row['sale_date']))

conn.commit()
print(f"ETL complete! Loaded {len(df)} new records into 'naashon_kuteesa.db'.")

# --- Sales Trend Plotting ---
import matplotlib.pyplot as plt

# Reconnect for reporting (optional, since conn is still open)
sales_df = pd.read_sql_query('''
SELECT 
    s.sale_date,
    SUM(s.quantity * p.price) AS daily_sales
FROM sales s
JOIN products p ON s.product_id = p.product_id
GROUP BY s.sale_date
ORDER BY s.sale_date
''', conn)

# Plot
plt.figure(figsize=(10, 6))
plt.plot(sales_df['sale_date'], sales_df['daily_sales'], marker='o', color='b', linewidth=2)
plt.title("Daily Sales Trend in Naashon Kuteesa Warehouse")
plt.xlabel("Sale Date")
plt.ylabel("Total Sales ($)")
plt.grid(True)
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()  # Or plt.savefig('sales_trend.png') to save as image

conn.close()
