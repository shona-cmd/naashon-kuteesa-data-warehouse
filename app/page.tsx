
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Types
interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  pending_payments: number;
}

interface Sale {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
}

interface CustomerSales {
  customer_id: number;
  customer_name: string;
  email: string;
  phone: string;
  order_count: number;
  total_sales: number;
}

interface DailyTrend {
  date: string;
  order_count: number;
  total_sales: number;
}

interface PaymentStatus {
  status: string;
  count: number;
  total_amount: number;
}

// Colors for charts
const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerSales[]>([]);
  const [salesTrend, setSalesTrend] = useState<DailyTrend[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'products'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, salesRes, customersRes, trendRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/sales'),
        fetch('/api/sales/by-customer'),
        fetch('/api/sales/trend?days=30'),
      ]);

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setMetrics(data.data.metrics);
        setPaymentStatus(data.data.payment_status || []);
      }

      if (salesRes.ok) {
        const data = await salesRes.json();
        setRecentSales(data.data.slice(0, 5));
      }

      if (customersRes.ok) {
        const data = await customersRes.json();
        setTopCustomers(data.data.slice(0, 5));
      }

      if (trendRes.ok) {
        const data = await trendRes.json();
        setSalesTrend(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: 'badge-success',
      pending: 'badge-warning',
      processing: 'badge-info',
      cancelled: 'badge-error',
      failed: 'badge-error',
    };
    return statusColors[status] || 'badge-info';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                🏪 Naashon Kuteesa Data Warehouse
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/products" className="btn-secondary">
                Products
              </Link>
              <Link href="/checkout" className="btn-primary">
                New Sale
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-8">
          {['overview', 'sales', 'customers', 'products'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Metrics Cards */}
            <div className="dashboard-grid mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(metrics?.total_revenue || 0)}
                </p>
                <p className="text-sm text-green-600 mt-1">+12.5% from last month</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
                <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_orders || 0}
                </p>
                <p className="text-sm text-green-600 mt-1">+8.2% from last month</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
                <h3 className="text-sm font-medium text-gray-500">Customers</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.total_customers || 0}
                </p>
                <p className="text-sm text-blue-600 mt-1">Active customers</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
                <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics?.pending_payments || 0}
                </p>
                <p className="text-sm text-yellow-600 mt-1">Awaiting confirmation</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales Trend Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        stroke="#9ca3af"
                        fontSize={12}
                      />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => formatDate(label)}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_sales"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ fill: '#22c55e', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Status Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ status, percent }) =>
                          `${status} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {paymentStatus.map((entry, index) => (
                          <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
              <div className="table-container">
                <table className="table-base">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Order ID</th>
                      <th className="table-header-cell">Customer</th>
                      <th className="table-header-cell">Amount</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">#{sale.id}</td>
                        <td className="table-cell">{sale.customer_name || 'Guest'}</td>
                        <td className="table-cell font-medium">
                          {formatCurrency(sale.total_amount)}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusBadge(sale.status)}`}>
                            {sale.status}
                          </span>
                        </td>
                        <td className="table-cell text-gray-500">
                          {formatDate(sale.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Sales</h3>
            <div className="table-container">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Order ID</th>
                    <th className="table-header-cell">Customer</th>
                    <th className="table-header-cell">Phone</th>
                    <th className="table-header-cell">Amount</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">#{sale.id}</td>
                      <td className="table-cell">{sale.customer_name || 'Guest'}</td>
                      <td className="table-cell text-gray-500">{sale.customer_phone}</td>
                      <td className="table-cell font-medium">
                        {formatCurrency(sale.total_amount)}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getStatusBadge(sale.status)}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="table-cell text-gray-500">
                        {formatDate(sale.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            <div className="table-container">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Customer</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Phone</th>
                    <th className="table-header-cell">Orders</th>
                    <th className="table-header-cell">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {topCustomers.map((customer) => (
                    <tr key={customer.customer_id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{customer.customer_name}</td>
                      <td className="table-cell text-gray-500">{customer.email}</td>
                      <td className="table-cell text-gray-500">{customer.phone}</td>
                      <td className="table-cell">{customer.order_count}</td>
                      <td className="table-cell font-medium text-primary-600">
                        {formatCurrency(customer.total_sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Products</h3>
              <Link href="/products" className="btn-primary">
                View All Products
              </Link>
            </div>
            <p className="text-gray-600">
              Browse our product catalog with competitive prices and mobile money payment support.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Naashon Kuteesa Data Warehouse. Built with Next.js & Neon PostgreSQL.
          </p>
          <p className="text-center text-gray-400 text-xs mt-2">
            💰 Mobile Money Payments • 📊 Sales Analytics • 🚀 Vercel Serverless
          </p>
        </div>
      </footer>
    </div>
  );
}


