import { sql, getPool } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// POST /api/payments/initiate - Initialize a mobile money payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sale_id, phone, provider = 'mpesa', amount } = body;

    if (!sale_id || !phone) {
      return NextResponse.json(
        { success: false, error: 'Sale ID and phone number are required' },
        { status: 400 }
      );
    }

    const pool = await getPool();

    // Get sale details
    const saleResult = await pool.query(
      'SELECT * FROM sales WHERE id = $1',
      [sale_id]
    );

    if (saleResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    const sale = saleResult.rows[0];
    const paymentAmount = amount || sale.total_amount;
    const transactionId = `${provider.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

    // Create payment record
    const paymentResult = await pool.query(
      `INSERT INTO payments (sale_id, customer_id, phone, amount, provider, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [sale_id, sale.customer_id, phone, paymentAmount, provider, transactionId]
    );

    // Log the transaction
    await pool.query(
      `INSERT INTO payment_transactions (payment_id, action, request_data)
       VALUES ($1, 'initiate', $2)`,
      [paymentResult.rows[0].id, JSON.stringify({ sale_id, phone, provider, transactionId })]
    );

    await pool.end();

    // In production, you would call the actual payment provider API here
    // For demo, we simulate a successful payment initiation
    const simulatedResponse = {
      message: 'Payment initiated successfully',
      transaction_id: transactionId,
      phone: phone,
      amount: paymentAmount,
      provider: provider,
      status: 'pending',
      instructions: `A payment request has been sent to ${phone}. Please complete the payment on your phone.`
    };

    return NextResponse.json({
      success: true,
      data: {
        payment: paymentResult.rows[0],
        response: simulatedResponse,
      },
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}

// GET /api/payments - Get payment status/history
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transaction_id');
    const saleId = searchParams.get('sale_id');
    const status = searchParams.get('status');

    let query = `
      SELECT 
        p.*,
        c.name as customer_name,
        c.phone as customer_phone,
        s.status as sale_status
      FROM payments p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN sales s ON p.sale_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (transactionId) {
      params.push(transactionId);
      query += ` AND p.transaction_id = $${params.length}`;
    }

    if (saleId) {
      params.push(parseInt(saleId));
      query += ` AND p.sale_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    query += ' ORDER BY p.created_at DESC LIMIT 50';

    const payments = await sql(query, params);

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

