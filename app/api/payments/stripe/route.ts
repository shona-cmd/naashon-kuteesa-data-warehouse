import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

// POST /api/payments/stripe - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'usd', sale_id, payment_method_id } = body;

    if (!amount || !sale_id) {
      return NextResponse.json(
        { success: false, error: 'Amount and sale_id required' },
        { status: 400 }
      );
    }

    // Get sale details
    const sales = await sql`
      SELECT * FROM sales WHERE id = ${sale_id}
    `;

    if (sales.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    const sale = sales[0];

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      payment_method: payment_method_id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        sale_id: sale_id.toString(),
        user_id: session.user.id,
      },
    });

    // Store payment record
    const payments = await sql`
      INSERT INTO payments (
        organization_id, sale_id, customer_id, amount, provider,
        transaction_id, status, payment_method
      ) VALUES (
        ${sale.organization_id}, ${sale_id}, ${sale.customer_id},
        ${amount}, 'stripe', ${paymentIntent.id}, 'pending', 'card'
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          status: paymentIntent.status,
        },
        payment: payments[0],
      },
    });
  } catch (error: any) {
    console.error('Stripe payment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// GET /api/payments/stripe - Get payment methods
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get user's saved payment methods
    const paymentMethods = await sql`
      SELECT * FROM stripe_payment_methods
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get payment methods' },
      { status: 500 }
    );
  }
}

