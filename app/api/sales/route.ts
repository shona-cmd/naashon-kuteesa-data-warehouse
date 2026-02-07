import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sales - List all sales
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        s.id,
        s.customer_id,
        s.total_amount,
        s.status,
        s.notes,
        s.created_at,
        c.name as customer_name,
        c.phone as customer_phone
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    if (customerId) {
      params.push(parseInt(customerId));
      query += ` AND s.customer_id = $${params.length}`;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const sales = await sql(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM sales WHERE 1=1';
    const countParams = [];
    if (status) {
      countParams.push(status);
      countQuery += ` AND status = $1`;
    }
    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0]?.count || '0');

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        limit,
        offset,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, total_amount, notes } = body;

    if (!total_amount) {
      return NextResponse.json(
        { success: false, error: 'Total amount is required' },
        { status: 400 }
      );
    }

    const result = await sql(
      `INSERT INTO sales (customer_id, total_amount, status, notes)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *`,
      [customer_id || null, total_amount, notes || null]
    );

    return NextResponse.json({
      success: true,
      data: result[0],
      message: 'Sale created successfully',
    });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}

