'use client'

import { Grid, Package } from 'lucide-react'

interface Category {
  id: number
  name: string
  description?: string
  image_url?: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold text-lg mb-4 flex items-center">
        <Grid className="mr-2" size={20} />
        Catégories
      </h3>
      
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 flex items-center ${
            selectedCategory === 'all'
              ? 'bg-primary-500 text-white'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Package className="mr-2" size={18} />
          Tous les produits
        </button>
        
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
              selectedCategory === category.name
                ? 'bg-primary-500 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Filters additionnels */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold mb-3">Filtres</h4>
        
        {/* Prix */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Prix</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* En stock uniquement */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="in-stock"
            className="mr-2 rounded text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="in-stock" className="text-sm text-gray-700">
            En stock uniquement
          </label>
        </div>

        {/* Produits en vedette */}
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="featured"
            className="mr-2 rounded text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="featured" className="text-sm text-gray-700">
            Produits en vedette
          </label>
        </div>

        <button className="w-full mt-4 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors duration-200">
          Appliquer les filtres
        </button>
      </div>
    </div>
  )
}