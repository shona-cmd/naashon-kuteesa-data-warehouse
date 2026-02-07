
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleBuyNow = (product: Product) => {
    // Navigate to checkout with product
    window.location.href = `/checkout?product_id=${product.id}&quantity=1`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                🛍️ Products
              </h1>
            </div>
            <div className="flex items-center">
              <Link href="/checkout" className="btn-primary">
                🛒 Cart
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Our Products</h2>
          <p className="text-gray-600 mt-2">
            Quality products with competitive prices. Pay securely with mobile money!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category!)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="relative">
                <img
                  src={product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.name}
                  className="product-image"
                />
                {product.stock_quantity < 10 && (
                  <span className="absolute top-2 right-2 badge badge-warning">
                    Only {product.stock_quantity} left
                  </span>
                )}
              </div>
              <div className="product-info">
                <p className="text-sm text-primary-600 font-medium">
                  {product.category}
                </p>
                <h3 className="product-title">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                    <p className="text-sm text-gray-500">
                      {product.stock_quantity} in stock
                    </p>
                  </div>
                  <button
                    onClick={() => handleBuyNow(product)}
                    className="btn-primary"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Why Shop With Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">💳</div>
              <h4 className="font-semibold text-gray-900">Mobile Money</h4>
              <p className="text-gray-600 text-sm mt-1">
                Pay securely with M-Pesa, Airtel Money, and more
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
              <p className="text-gray-600 text-sm mt-1">
                Delivery across Kenya and East Africa
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-semibold text-gray-900">Secure Payments</h4>
              <p className="text-gray-600 text-sm mt-1">
                Bank-level security for all transactions
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Naashon Kuteesa Data Warehouse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


