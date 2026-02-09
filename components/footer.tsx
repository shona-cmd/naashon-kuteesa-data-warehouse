'use client';

import { useIsMobile } from '../hooks/use-mobile';

export default function Footer() {
  const isMobile = useIsMobile();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isMobile ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                © 2024 Naashon Kuteesa Data Warehouse.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Built with Next.js & Neon PostgreSQL.
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">
                💰 Mobile Money Payments • 📊 Sales Analytics • 🚀 Vercel Serverless
              </p>
              <p className="text-gray-500 text-xs mt-2">
                💬 Need suggestions? WhatsApp: +256 761 485 613
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                © 2024 Naashon Kuteesa Data Warehouse.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Built with Next.js & Neon PostgreSQL.
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs">
                💰 Mobile Money Payments • 📊 Sales Analytics • 🚀 Vercel Serverless
              </p>
              <p className="text-gray-500 text-xs mt-2">
                💬 Need suggestions? WhatsApp: +256 761 485 613
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-xs">
                All rights reserved.
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
