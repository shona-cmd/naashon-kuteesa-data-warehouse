import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    let query = `
      SELECT id, name, description, category, price, stock_quantity, image_url, is_active, created_at
      FROM products
      WHERE 1=1
    `;
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (active !== null) {
      params.push(active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const products = await sql(query, params);

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, price, stock_quantity, image_url } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const result = await sql(
      `INSERT INTO products (name, description, category, price, stock_quantity, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || null, category || null, price, stock_quantity || 0, image_url || null]
    );

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

