-- Database Schema for Naashon Kuteesa Global Data Warehouse
-- Neon PostgreSQL compatible schema with multi-tenancy

-- Drop existing tables (in correct order for foreign keys)
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Organizations table for multi-tenancy
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table for authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  organization_id INTEGER REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers table - stores customer information with phone for mobile money
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table - stores product catalog
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales table - stores sales orders
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  customer_id INTEGER REFERENCES customers(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sale items table - stores individual items in each sale
CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table - stores mobile money payment records
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  sale_id INTEGER REFERENCES sales(id),
  customer_id INTEGER REFERENCES customers(id),
  phone VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  provider VARCHAR(50) DEFAULT 'mpesa', -- 'mpesa', 'stripe', 'flutterwave', 'airtel'
  transaction_id VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  raw_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions - audit trail for all payment operations
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER REFERENCES payments(id),
  action VARCHAR(50) NOT NULL,
  request_data TEXT,
  response_data TEXT,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_payments_sale_id ON payments(sale_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Insert sample products
INSERT INTO products (name, description, category, price, stock_quantity, image_url) VALUES
('Laptop', 'High-performance laptop for work and gaming', 'Electronics', 999.99, 50, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 'Electronics', 29.99, 200, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
('Programming Book', 'Learn programming from scratch', 'Literature', 19.99, 100, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
('Headphones', 'Noise-cancelling wireless headphones', 'Electronics', 149.99, 75, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 'Furniture', 39.99, 150, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400');

-- Insert sample customers
INSERT INTO customers (name, email, phone, location) VALUES
('Alice Johnson', 'alice@email.com', '+254712345678', 'Nairobi, Kenya'),
('Bob Smith', 'bob@email.com', '+254723456789', 'Mombasa, Kenya'),
('Carol Davis', 'carol@email.com', '+254734567890', 'Kisumu, Kenya');

-- Insert sample sales
INSERT INTO sales (customer_id, total_amount, status) VALUES
(1, 999.99, 'completed'),
(2, 89.97, 'completed'),
(3, 39.98, 'pending');

-- Insert sample payments
INSERT INTO payments (sale_id, customer_id, phone, amount, provider, transaction_id, status) VALUES
(1, 1, '+254712345678', 999.99, 'mpesa', 'MPESA001234', 'completed'),
(2, 2, '+254723456789', 89.97, 'mpesa', 'MPESA001235', 'completed'),
(3, 3, '+254734567890', 39.98, 'mpesa', 'MPESA001236', 'pending');

SELECT 'Database schema created successfully!' AS status;

