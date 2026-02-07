import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sales/trend - Get daily sales trend
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const result = await sql(`
      SELECT 
        DATE(s.created_at) as date,
        COUNT(s.id) as order_count,
        COALESCE(SUM(s.total_amount), 0) as total_sales
      FROM sales s
      WHERE s.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(s.created_at)
      ORDER BY date ASC
    `);

    return NextResponse.json({
      success: true,
      data: result,
      period: `${days} days`,
    });
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales trend' },
      { status: 500 }
    );
  }
}

