'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { api, Config } from '@/lib/api';

export default function Contact() {
  const [config, setConfig] = useState<Config | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    api.getConfig().then(data => setConfig(data.config));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to an email service
    alert('Message envoyé ! Nous vous répondrons bientôt.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Contactez-nous</h1>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Nos coordonnées</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="text-green-600" size={24} />
              <div>
                <p className="font-medium">Email</p>
                <a href={`mailto:${config?.contact_email}`} className="text-blue-600 hover:underline">
                  {config?.contact_email || 'contact@maboutique.com'}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="text-green-600" size={24} />
              <div>
                <p className="font-medium">Téléphone</p>
                <a href={`tel:${config?.contact_phone}`} className="text-blue-600 hover:underline">
                  {config?.contact_phone || '+33 6 00 00 00 00'}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="text-green-600" size={24} />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-gray-600">
                  {config?.contact_address || '123 Rue de la Boutique, 75000 Paris'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Envoyez-nous un message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}