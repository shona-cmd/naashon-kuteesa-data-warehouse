import sqlite3
import csv

# Connect to the database
conn = sqlite3.connect('naashon_kuteesa.db')
cursor = conn.cursor()

# Load data from CSV and insert into database
with open('sales_data.csv', 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Insert or update customer
        cursor.execute('''
        INSERT OR REPLACE INTO customers (customer_id, name, email, location)
        VALUES ((SELECT customer_id FROM customers WHERE name = ?), ?, ?, ?)
        ''', (row['customer_name'], row['customer_name'], row['email'], 'Unknown'))  # Assuming location is unknown from CSV

        # Get customer_id
        cursor.execute('SELECT customer_id FROM customers WHERE name = ?', (row['customer_name'],))
        customer_id = cursor.fetchone()[0]

        # Insert or update product
        cursor.execute('''
        INSERT OR REPLACE INTO products (product_id, name, category, price)
        VALUES ((SELECT product_id FROM products WHERE name = ?), ?, ?, ?)
        ''', (row['product_name'], row['product_name'], row['category'], float(row['raw_price'])))

        # Get product_id
        cursor.execute('SELECT product_id FROM products WHERE name = ?', (row['product_name'],))
        product_id = cursor.fetchone()[0]

        # Insert sale
        cursor.execute('''
        INSERT INTO sales (customer_id, product_id, quantity, sale_date)
        VALUES (?, ?, ?, ?)
        ''', (customer_id, product_id, int(row['quantity']), row['sale_date']))

conn.commit()
print("Data from CSV loaded into 'naashon_kuteesa.db'!")
conn.close()
