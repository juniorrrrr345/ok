'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Package, 
  Tag, 
  Tractor, 
  Palette, 
  Settings, 
  LogOut,
  Home,
  Image
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = api.getToken();
    if (!token) {
      router.push('/junior');
    }
  }, [router]);

  const handleLogout = () => {
    api.clearToken();
    router.push('/junior');
  };

  const menuItems = [
    { href: '/junior/dashboard', label: 'Tableau de bord', icon: Home },
    { href: '/junior/dashboard/products', label: 'Produits', icon: Package },
    { href: '/junior/dashboard/categories', label: 'Catégories', icon: Tag },
    { href: '/junior/dashboard/farms', label: 'Farms', icon: Tractor },
    { href: '/junior/dashboard/carousel', label: 'Carrousel', icon: Image },
    { href: '/junior/dashboard/design', label: 'Design', icon: Palette },
    { href: '/junior/dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 min-h-screen">
          <div className="p-4">
            <h2 className="text-white text-xl font-bold mb-8">Admin Panel</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition"
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 text-red-400 hover:text-red-300 hover:bg-gray-800 px-4 py-2 rounded-lg transition"
              >
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}