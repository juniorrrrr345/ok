'use client';

import { useState, useEffect } from 'react';
import { api, Config } from '@/lib/api';
import Image from 'next/image';

export default function Reseaux() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    api.getConfig().then(data => setConfig(data.config));
  }, []);

  const socialNetworks = [
    {
      name: 'Instagram',
      url: config?.instagram_url,
      icon: '📷',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    },
    {
      name: 'Telegram',
      url: config?.telegram_url,
      icon: '✈️',
      color: 'bg-blue-500',
    },
    {
      name: 'Facebook',
      url: config?.facebook_url,
      icon: '👍',
      color: 'bg-blue-600',
    },
    {
      name: 'Twitter',
      url: config?.twitter_url,
      icon: '🐦',
      color: 'bg-sky-500',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Suivez-nous</h1>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-center text-gray-600 mb-8">
          Restez connecté avec nous sur les réseaux sociaux pour découvrir nos dernières nouveautés et promotions !
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {socialNetworks.map((network) => (
            <div key={network.name}>
              {network.url ? (
                <a
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center space-x-3 p-6 rounded-lg text-white hover:opacity-90 transition ${network.color}`}
                >
                  <span className="text-3xl">{network.icon}</span>
                  <span className="text-xl font-semibold">{network.name}</span>
                </a>
              ) : (
                <div className="flex items-center justify-center space-x-3 p-6 rounded-lg bg-gray-200 text-gray-500">
                  <span className="text-3xl">{network.icon}</span>
                  <span className="text-xl font-semibold">{network.name}</span>
                  <span className="text-sm">(Non configuré)</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Newsletter</h2>
          <p className="text-gray-600 mb-6">
            Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}