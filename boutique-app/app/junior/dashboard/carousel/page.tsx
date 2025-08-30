'use client';

import { useState, useEffect } from 'react';
import { api, CarouselImage } from '@/lib/api';
import { Plus, Trash, Upload } from 'lucide-react';
import Image from 'next/image';

export default function CarouselAdmin() {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newImage, setNewImage] = useState({
    image_url: '',
    title: '',
    order_index: 0,
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const data = await api.getCarousel();
    setImages(data.images);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setNewImage({ ...newImage, image_url: result.url });
    } catch (error) {
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!newImage.image_url) {
      alert('Veuillez sélectionner une image');
      return;
    }

    try {
      await api.addCarouselImage(newImage);
      setNewImage({ image_url: '', title: '', order_index: 0 });
      loadImages();
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'image');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      try {
        await api.deleteCarouselImage(id);
        loadImages();
      } catch (error) {
        alert('Erreur lors de la suppression de l\'image');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion du carrousel</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter une image</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {newImage.image_url && (
              <div className="mt-2">
                <Image
                  src={newImage.image_url}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={newImage.title}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              placeholder="Titre de l'image"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordre d&apos;affichage
            </label>
            <input
              type="number"
              value={newImage.order_index}
              onChange={(e) => setNewImage({ ...newImage, order_index: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={uploading || !newImage.image_url}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Ajouter au carrousel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aperçu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {images.map((image) => (
              <tr key={image.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Image
                    src={image.image_url}
                    alt={image.title || 'Carousel image'}
                    width={100}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {image.title || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {image.order_index}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}