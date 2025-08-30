'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface Product {
  id: number
  name: string
  description?: string
  price: number
  image_url?: string
  category?: string
  stock: number
  featured?: boolean
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const { addToCart, toggleFavorite, favorites } = useStore()
  
  const isFavorite = favorites.includes(product.id)

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product)
      toast.success(`${product.name} ajouté au panier`)
    } else {
      toast.error('Produit en rupture de stock')
    }
  }

  const handleToggleFavorite = () => {
    toggleFavorite(product.id)
    if (!isFavorite) {
      toast.success('Ajouté aux favoris')
    }
  }

  return (
    <div className="card group overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.featured && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded">
            En vedette
          </span>
        )}
        
        {product.image_url && !imageError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <ShoppingCart className="text-gray-400" size={48} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
            } mx-1 transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:scale-110`}
          >
            <Heart size={20} fill={isFavorite ? 'white' : 'none'} />
          </button>
          <button className="p-2 bg-white text-gray-700 rounded-full mx-1 transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75 hover:scale-110">
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {product.category}
          </span>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and Stock */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              {product.price.toFixed(2)}€
            </span>
            {product.stock > 0 && product.stock < 10 && (
              <p className="text-xs text-orange-600 mt-1">
                Plus que {product.stock} en stock!
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            product.stock > 0
              ? 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={18} />
          <span>{product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}</span>
        </button>
      </div>
    </div>
  )
}