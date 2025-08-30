'use client';

import { useState, useEffect } from 'react';
import Carousel from '@/components/Carousel';
import ProductCard from '@/components/ProductCard';
import { api, Product, Category, Farm, Config } from '@/lib/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getCategories(),
      api.getFarms(),
      api.getConfig(),
    ]).then(([productsData, categoriesData, farmsData, configData]) => {
      setProducts(productsData.products);
      setCategories(categoriesData.categories);
      setFarms(farmsData.farms);
      setConfig(configData.config);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedCategory !== 'all' || selectedFarm !== 'all') {
      api.getProducts(selectedCategory, selectedFarm).then(data => {
        setProducts(data.products);
      });
    } else {
      api.getProducts().then(data => {
        setProducts(data.products);
      });
    }
  }, [selectedCategory, selectedFarm]);

  // Apply custom background
  useEffect(() => {
    if (config?.background_url) {
      document.body.style.backgroundImage = `url(${config.background_url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }
    return () => {
      document.body.style.backgroundImage = '';
    };
  }, [config]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Carousel */}
      <div className="mb-8">
        <Carousel />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={selectedFarm}
          onChange={(e) => setSelectedFarm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Toutes les farms</option>
          {farms.map((farm) => (
            <option key={farm.id} value={farm.id.toString()}>
              {farm.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}