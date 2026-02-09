'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIsMobile } from '../hooks/use-mobile';

interface NavbarProps {
  title?: string;
  links?: Array<{ href: string; label: string; icon?: string }>;
  showBack?: boolean;
  backHref?: string;
}

export default function Navbar({
  title = '🏪 Naashon Kuteesa Data Warehouse',
  links = [
    { href: '/products', label: 'Products' },
    { href: '/checkout', label: 'New Sale' },
  ],
  showBack = false,
  backHref = '/',
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBack && (
              <Link href={backHref} className="text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
            )}
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>

          {isMobile ? (
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-gray-900 p-2"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn-secondary"
                >
                  {link.icon && <span className="mr-2">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && <span className="mr-2">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
