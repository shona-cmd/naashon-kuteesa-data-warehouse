import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/analytics - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30';

    const periodDays = parseInt(period);

    // Get dashboard metrics
    const metricsResult = await sql(`
      SELECT 
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(*) as total_orders,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM products WHERE is_active = true) as total_products,
        (SELECT COUNT(*) FROM payments WHERE status = 'pending') as pending_payments
      FROM sales
      WHERE created_at >= NOW() - INTERVAL '${periodDays} days'
    `);

    // Get recent sales
    const recentSalesResult = await sql(`
      SELECT 
        s.id,
        s.total_amount,
        s.status,
        s.created_at,
        c.name as customer_name,
        c.phone as customer_phone
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);

    // Get top customers
    const topCustomersResult = await sql(`
      SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.email,
        c.phone,
        COUNT(s.id) as order_count,
        COALESCE(SUM(s.total_amount), 0) as total_sales
      FROM customers c
      LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
      GROUP BY c.id, c.name, c.email, c.phone
      ORDER BY total_sales DESC
      LIMIT 5
    `);

    // Get sales trend
    const trendResult = await sql(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM sales
      WHERE created_at >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Get top products
    const topProductsResult = await sql(`
      SELECT 
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock_quantity,
        COALESCE(SUM(s.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN sale_items si ON p.id = si.product_id
      LEFT JOIN sales s ON si.sale_id = s.id AND s.status = 'completed'
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Get payment status breakdown
    const paymentStatusResult = await sql(`
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount
      FROM payments
      GROUP BY status
    `);

    return NextResponse.json({
      success: true,
      data: {
        metrics: metricsResult[0],
        recent_sales: recentSalesResult,
        top_customers: topCustomersResult,
        sales_trend: trendResult,
        top_products: topProductsResult,
        payment_status: paymentStatusResult,
        period: `${periodDays} days`,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

