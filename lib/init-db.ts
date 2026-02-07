import { sql, getPool } from './db';

export async function initializeDatabase() {
  const pool = await getPool();
  
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20) NOT NULL,
        location TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER REFERENCES sales(id),
        customer_id INTEGER REFERENCES customers(id),
        phone VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        provider VARCHAR(50) DEFAULT 'mpesa',
        transaction_id VARCHAR(100) UNIQUE,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        raw_response TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed sample data if tables are empty
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await seedDatabase(pool);
    }

    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function seedDatabase(pool: any) {
  // Insert sample products
  await pool.query(`
    INSERT INTO products (name, description, category, price, stock_quantity, image_url) VALUES
    ('Laptop', 'High-performance laptop for work and gaming', 'Electronics', 999.99, 50, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
    ('Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 'Electronics', 29.99, 200, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
    ('Programming Book', 'Learn programming from scratch', 'Literature', 19.99, 100, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400'),
    ('Headphones', 'Noise-cancelling wireless headphones', 'Electronics', 149.99, 75, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
    ('Desk Lamp', 'LED desk lamp with adjustable brightness', 'Furniture', 39.99, 150, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400')
  `);

  // Insert sample customers
  await pool.query(`
    INSERT INTO customers (name, email, phone, location) VALUES
    ('Alice Johnson', 'alice@email.com', '+254712345678', 'Nairobi, Kenya'),
    ('Bob Smith', 'bob@email.com', '+254723456789', 'Mombasa, Kenya'),
    ('Carol Davis', 'carol@email.com', '+254734567890', 'Kisumu, Kenya')
  `);

  console.log('Sample data seeded successfully');
}

