'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { api, Config } from '@/lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    api.getConfig().then(data => setConfig(data.config));
  }, []);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              {config?.logo_url ? (
                <Image
                  src={config.logo_url}
                  alt={config.shop_name || 'Logo'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full" />
              )}
              <span className="font-bold text-xl text-gray-800">
                {config?.shop_name || 'Ma Boutique'}
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition">
              Menu
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-600 transition">
              Contact
            </Link>
            <Link href="/reseaux" className="text-gray-700 hover:text-green-600 transition">
              Réseaux
            </Link>
            <Link href="/info" className="text-gray-700 hover:text-green-600 transition">
              Info
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Menu
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/reseaux"
              className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Réseaux
            </Link>
            <Link
              href="/info"
              className="block px-3 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Info
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}