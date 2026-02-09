import { sql, getPool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/payments/verify - Verify payment status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id } = body;

    // Hardcoded payment phone number for all transactions
    const phone = '0761485613';

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Find the payment record
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE transaction_id = $1',
      [transaction_id]
    );

    if (paymentResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const payment = paymentResult.rows[0];

    // In production, you would call the payment provider's API to check status
    // For demo, we simulate payment verification
    const simulatedStatus = Math.random() > 0.3 ? 'completed' : 'failed';

    // Update payment status
    await pool.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [simulatedStatus, payment.id]
    );

    // Update sale status if payment completed
    if (simulatedStatus === 'completed') {
      await pool.query(
        'UPDATE sales SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['completed', payment.sale_id]
      );
    }

    // Log the verification
    await pool.query(
      `INSERT INTO payment_transactions (payment_id, action, request_data, response_data)
       VALUES ($1, 'verify', $2, $3)`,
      [payment.id, JSON.stringify({ transaction_id, phone }), JSON.stringify({ status: simulatedStatus })]
    );

    await pool.end();

    return NextResponse.json({
      success: true,
      data: {
        transaction_id: transaction_id,
        status: simulatedStatus,
        amount: payment.amount,
        phone: payment.phone,
        provider: payment.provider,
        verified_at: new Date().toISOString(),
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
