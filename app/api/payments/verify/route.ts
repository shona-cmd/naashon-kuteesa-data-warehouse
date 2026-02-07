import { sql, getPool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/payments/verify - Verify a payment status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Get payment details
    const paymentResult = await pool.query(
      `SELECT p.*, c.name as customer_name, s.status as sale_status
       FROM payments p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN sales s ON p.sale_id = s.id
       WHERE p.transaction_id = $1`,
      [transaction_id]
    );

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = paymentResult.rows[0];

    // Log the verification attempt
    await pool.query(
      `INSERT INTO payment_transactions (payment_id, action, request_data)
       VALUES ($1, 'verify', $2)`,
      [payment.id, JSON.stringify({ transaction_id })]
    );

    await pool.end();

    // In production, you would call the payment provider API to verify
    // For demo, we simulate verification
    return NextResponse.json({
      success: true,
      data: {
        transaction_id: payment.transaction_id,
        status: payment.status,
        amount: payment.amount,
        phone: payment.phone,
        provider: payment.provider,
        customer_name: payment.customer_name,
        sale_status: payment.sale_status,
        created_at: payment.created_at,
        message: payment.status === 'completed' 
          ? 'Payment verified successfully' 
          : 'Payment is still pending',
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

