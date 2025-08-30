'use client';

import { useState, useEffect } from 'react';
import { api, Config } from '@/lib/api';
import { Upload, Save } from 'lucide-react';
import Image from 'next/image';

export default function DesignAdmin() {
  const [config, setConfig] = useState<Config | null>(null);
  const [uploading, setUploading] = useState({
    logo: false,
    background: false,
  });
  const [formData, setFormData] = useState({
    logo_url: '',
    background_url: '',
    shop_name: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const data = await api.getConfig();
    setConfig(data.config);
    setFormData({
      logo_url: data.config.logo_url || '',
      background_url: data.config.background_url || '',
      shop_name: data.config.shop_name || '',
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ ...uploading, logo: true });
    try {
      const result = await api.uploadImage(file);
      setFormData({ ...formData, logo_url: result.url });
    } catch (error) {
      alert('Erreur lors de l\'upload du logo');
    } finally {
      setUploading({ ...uploading, logo: false });
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading({ ...uploading, background: true });
    try {
      const result = await api.uploadImage(file);
      setFormData({ ...formData, background_url: result.url });
    } catch (error) {
      alert('Erreur lors de l\'upload du fond');
    } finally {
      setUploading({ ...uploading, background: false });
    }
  };

  const handleSave = async () => {
    try {
      await api.updateConfig(formData);
      alert('Design mis à jour avec succès !');
      loadConfig();
    } catch (error) {
      alert('Erreur lors de la mise à jour du design');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Personnalisation du design</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Logo */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Logo de la boutique</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo actuel
              </label>
              {formData.logo_url ? (
                <div className="mb-4">
                  <Image
                    src={formData.logo_url}
                    alt="Logo"
                    width={150}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Pas de logo</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Changer le logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading.logo}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Background */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Fond du site</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fond actuel
              </label>
              {formData.background_url ? (
                <div className="mb-4">
                  <Image
                    src={formData.background_url}
                    alt="Background"
                    width={300}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Pas de fond personnalisé</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Changer le fond
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                disabled={uploading.background}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Shop Name */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Nom de la boutique</h2>
          
          <input
            type="text"
            value={formData.shop_name}
            onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
            placeholder="Nom de votre boutique"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={uploading.logo || uploading.background}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Enregistrer les modifications</span>
        </button>
      </div>
    </div>
  );
}