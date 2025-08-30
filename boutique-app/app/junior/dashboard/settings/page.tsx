'use client';

import { useState, useEffect } from 'react';
import { api, Config } from '@/lib/api';
import { Save } from 'lucide-react';

export default function SettingsAdmin() {
  const [config, setConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState({
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    info_text: '',
    instagram_url: '',
    telegram_url: '',
    facebook_url: '',
    twitter_url: '',
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const data = await api.getConfig();
    setConfig(data.config);
    setFormData({
      contact_email: data.config.contact_email || '',
      contact_phone: data.config.contact_phone || '',
      contact_address: data.config.contact_address || '',
      info_text: data.config.info_text || '',
      instagram_url: data.config.instagram_url || '',
      telegram_url: data.config.telegram_url || '',
      facebook_url: data.config.facebook_url || '',
      twitter_url: data.config.twitter_url || '',
    });
  };

  const handleSave = async () => {
    try {
      await api.updateConfig(formData);
      alert('Paramètres mis à jour avec succès !');
      loadConfig();
    } catch (error) {
      alert('Erreur lors de la mise à jour des paramètres');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Paramètres de la boutique</h1>

      <div className="space-y-8">
        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informations de contact</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.contact_address}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Page Info</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte de présentation
            </label>
            <textarea
              rows={8}
              value={formData.info_text}
              onChange={(e) => setFormData({ ...formData, info_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Décrivez votre boutique, vos horaires, vos services..."
            />
          </div>
        </div>

        {/* Social Networks */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Réseaux sociaux</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram
              </label>
              <input
                type="url"
                value={formData.telegram_url}
                onChange={(e) => setFormData({ ...formData, telegram_url: e.target.value })}
                placeholder="https://t.me/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter
              </label>
              <input
                type="url"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
        >
          <Save size={20} />
          <span>Enregistrer tous les paramètres</span>
        </button>
      </div>
    </div>
  );
}