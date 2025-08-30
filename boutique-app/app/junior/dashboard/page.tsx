'use client';

import { useState, useEffect } from 'react';
import { api, Product, Category, Farm } from '@/lib/api';
import { Package, Tag, Tractor, Image } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    farms: 0,
    carousel: 0,
  });

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getFarms(),
      api.getCarousel(),
    ]).then(([products, categories, farms, carousel]) => {
      setStats({
        products: products.products.length,
        categories: categories.categories.length,
        farms: farms.farms.length,
        carousel: carousel.images.length,
      });
    });
  }, []);

  const cards = [
    {
      title: 'Produits',
      value: stats.products,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Catégories',
      value: stats.categories,
      icon: Tag,
      color: 'bg-green-500',
    },
    {
      title: 'Farms',
      value: stats.farms,
      icon: Tractor,
      color: 'bg-purple-500',
    },
    {
      title: 'Images Carrousel',
      value: stats.carousel,
      icon: Image,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-3xl font-bold text-gray-800">{card.value}</span>
              </div>
              <h3 className="text-gray-600">{card.title}</h3>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/junior/dashboard/products"
            className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800 mb-2">Ajouter un produit</h3>
            <p className="text-gray-600 text-sm">Créez un nouveau produit dans votre catalogue</p>
          </a>
          <a
            href="/junior/dashboard/carousel"
            className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800 mb-2">Gérer le carrousel</h3>
            <p className="text-gray-600 text-sm">Ajoutez ou modifiez les images du carrousel</p>
          </a>
          <a
            href="/junior/dashboard/design"
            className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800 mb-2">Personnaliser le design</h3>
            <p className="text-gray-600 text-sm">Changez le logo et l&apos;arrière-plan du site</p>
          </a>
          <a
            href="/junior/dashboard/settings"
            className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <h3 className="font-semibold text-gray-800 mb-2">Paramètres</h3>
            <p className="text-gray-600 text-sm">Modifiez les informations de la boutique</p>
          </a>
        </div>
      </div>
    </div>
  );
}