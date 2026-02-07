import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sales/by-customer - Get sales summary by customer
export async function GET(request: NextRequest) {
  try {
    const result = await sql(`
      SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.email,
        c.phone,
        c.location,
        COUNT(s.id) as order_count,
        COALESCE(SUM(s.total_amount), 0) as total_sales
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
      GROUP BY c.id, c.name, c.email, c.phone, c.location
      ORDER BY total_sales DESC
    `);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching customer sales:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer sales' },
      { status: 500 }
    );
  }
}

