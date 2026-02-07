import { sql, getPool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/etl - Process ETL operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = 'process', data } = body;

    const pool = await getPool();

    let result: any = {};

    switch (action) {
      case 'initialize':
        // Initialize database tables
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

        // Seed sample data
        const productCount = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(productCount.rows[0].count) === 0) {
          await pool.query(`
            INSERT INTO products (name, description, category, price, stock_quantity, image_url) VALUES
            ('Laptop', 'High-performance laptop', 'Electronics', 999.99, 50, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
            ('Wireless Mouse', 'Ergonomic wireless mouse', 'Electronics', 29.99, 200, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'),
            ('Programming Book', 'Learn programming', 'Literature', 19.99, 100, 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400');
          `);
          
          await pool.query(`
            INSERT INTO customers (name, email, phone, location) VALUES
            ('Alice Johnson', 'alice@email.com', '+254712345678', 'Nairobi'),
            ('Bob Smith', 'bob@email.com', '+254723456789', 'Mombasa');
          `);
        }

        result = { message: 'Database initialized successfully' };
        break;

      case 'process_csv':
        // Process CSV data (for future CSV upload feature)
        if (!data) {
          return NextResponse.json(
            { success: false, error: 'CSV data is required for processing' },
            { status: 400 }
          );
        }

        // Parse and process CSV rows
        const rows = Array.isArray(data) ? data : [];
        let processed = 0;

        for (const row of rows) {
          try {
            // Insert or update customer
            const customerResult = await pool.query(
              `INSERT INTO customers (name, email, phone, location)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
               RETURNING id`,
              [row.customer_name, row.email, row.phone, row.location || 'Unknown']
            );

            // Insert sale
            await pool.query(
              `INSERT INTO sales (customer_id, total_amount, status)
               VALUES ($1, $2, 'pending')`,
              [customerResult.rows[0].id, row.total_amount]
            );

            processed++;
          } catch (err) {
            console.error('Error processing row:', err);
          }
        }

        result = { processed, message: `Processed ${processed} rows` };
        break;

      case 'refresh':
        // Refresh materialized views or cache
        result = { message: 'Cache refreshed successfully' };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    await pool.end();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('ETL error:', error);
    return NextResponse.json(
      { success: false, error: 'ETL operation failed' },
      { status: 500 }
    );
  }
}

// GET /api/etl - Get ETL status
export async function GET() {
  try {
    const pool = await getPool();

    // Get table counts
    const [customers, products, sales, payments] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM sales'),
      pool.query('SELECT COUNT(*) FROM payments'),
    ]);

    await pool.end();

    return NextResponse.json({
      success: true,
      data: {
        tables: {
          customers: parseInt(customers.rows[0].count),
          products: parseInt(products.rows[0].count),
          sales: parseInt(sales.rows[0].count),
          payments: parseInt(payments.rows[0].count),
        },
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('ETL status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get ETL status' },
      { status: 500 }
    );
  }
}

