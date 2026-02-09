'use client';

import Link from 'next/link';

// Fallback UI when database is unavailable
export function DatabaseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-6xl mb-4">🗄️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Database Unavailable
        </h1>
        <p className="text-gray-600 mb-6">
          We are having trouble connecting to our database. This is likely a temporary issue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Refresh Page
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
    </div>
  );
}

// Fallback metrics when API fails
export function MetricsFallback() {
  return (
    <div className="dashboard-grid mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      ))}
    </div>
  );
}

// Fallback chart when data is loading
export function ChartFallback() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
      <div className="chart-container">
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-500">Loading chart data...</p>
          </div>
      </div>
  );
}

// Fallback table when data is loading
export function TableFallback() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
      <div className="table-container">
        <table className="table-base">
          <thead className="table-header">
            <tr>
              {[1, 2, 3, 4, 5].map((i) => (
                <th key={i} className="table-header-cell">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="hover:bg-gray-50">
                {[1, 2, 3, 4, 5].map((col) => (
                  <td key={col} className="table-cell">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}

// Empty state component
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: () => void;
  actionLabel?: string;
}

export function EmptyState({ title, description, icon = "📦", action, actionLabel }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
