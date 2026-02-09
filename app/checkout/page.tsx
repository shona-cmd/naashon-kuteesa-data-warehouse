
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load cart from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    const quantity = urlParams.get('quantity');

    if (productId && quantity) {
      fetchProductAndAddToCart(parseInt(productId), parseInt(quantity));
    } else {
      // Load from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  const fetchProductAndAddToCart = async (productId: number, quantity: number) => {
    try {
      const res = await fetch(`/api/products?id=${productId}`);
      if (res.ok) {
        const data = await res.json();
        const products = data.data || [];
        if (products.length > 0) {
          const product = products[0];
          setCart([{ product, quantity }]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const validatePhone = (phone: string) => {
    // Kenyan phone number validation
    const kenyanPhoneRegex = /^(\+?254|0)?[71]\d{8}$/;
    return kenyanPhoneRegex.test(phone);
  };

  const handlePayment = async () => {
    // Validation
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create sale first
      const saleRes = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: null, // Will be created if needed
          total_amount: calculateTotal(),
          notes: `Order for ${customerName}`,
        }),
      });

      if (!saleRes.ok) {
        throw new Error('Failed to create order');
      }

      const saleData = await saleRes.json();
      const saleId = saleData.data.id;

      // Initiate mobile money payment
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: saleId,
          phone: phone.startsWith('+') ? phone : `+254${phone.slice(1)}`,
          provider: 'mpesa',
          amount: calculateTotal(),
        }),
      });

      if (!paymentRes.ok) {
        throw new Error('Failed to initiate payment');
      }

      const paymentData = await paymentRes.json();
      setTransactionId(paymentData.data?.response?.transaction_id || `TXN${Date.now()}`);
      setPaymentStatus('success');

      // Clear cart
      setCart([]);
      localStorage.removeItem('cart');

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/products" className="text-gray-600 hover:text-gray-900">
                ← Continue Shopping
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                🛒 Checkout
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paymentStatus === 'success' ? (
          /* Success State */
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Initiated!</h2>
              <p className="text-gray-600 mb-4">
                A payment request has been sent to your phone. Please complete the payment on your mobile money app.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="text-lg font-mono font-bold text-primary-600">{transactionId}</p>
              </div>

              <div className="space-y-3">
                <Link href="/" className="btn-primary block w-full">
                  Go to Dashboard
                </Link>
                <Link href="/products" className="btn-secondary block w-full">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cart Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">🛒 Your Cart</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link href="/products" className="btn-primary">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.image_url || 'https://via.placeholder.com/80'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-primary-600 font-semibold">
                            {formatCurrency(item.product.price)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-500 text-sm hover:text-red-700 mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                💳 Payment Details
              </h2>

              {/* Customer Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Mobile Money)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    className="phone-input input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your M-Pesa or Airtel Money number
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 border-2 border-primary-500 bg-primary-50 rounded-lg text-center">
                    <span className="text-2xl">📱</span>
                    <p className="text-sm font-medium">M-Pesa</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg text-center opacity-60">
                    <span className="text-2xl">📲</span>
                    <p className="text-sm font-medium">Airtel</p>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg text-center opacity-60">
                    <span className="text-2xl">💳</span>
                    <p className="text-sm font-medium">Card</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {errorMessage}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={loading || cart.length === 0}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                  loading || cart.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner"></div>
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatCurrency(calculateTotal())}`
                )}
              </button>

              {/* Security Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Your payment is secured with industry-standard encryption
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Why Pay With Mobile Money?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm font-medium">Instant</p>
              <p className="text-xs text-gray-500">Payments in seconds</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🔐</div>
              <p className="text-sm font-medium">Secure</p>
              <p className="text-xs text-gray-500">PIN protected</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="text-sm font-medium">No Fees</p>
              <p className="text-xs text-gray-500">Free transactions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <p className="text-sm font-medium">24/7</p>
              <p className="text-xs text-gray-500">Anytime, anywhere</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


