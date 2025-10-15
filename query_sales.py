import sqlite3

conn = sqlite3.connect('naashon_kuteesa.db')
cursor = conn.cursor()

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
