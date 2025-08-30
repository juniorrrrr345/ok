'use client';

import { useState, useEffect } from 'react';
import { api, Config } from '@/lib/api';
import { Clock, Shield, Truck, Award } from 'lucide-react';

export default function Info() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    api.getConfig().then(data => setConfig(data.config));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">À propos de nous</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {config?.info_text || `Bienvenue dans notre boutique en ligne !

Nous sommes passionnés par la qualité et l'excellence. Notre mission est de vous offrir les meilleurs produits, sélectionnés avec soin auprès de producteurs de confiance.

Depuis notre création, nous nous engageons à :
• Proposer uniquement des produits de haute qualité
• Garantir un service client exceptionnel
• Assurer des livraisons rapides et sécurisées
• Maintenir des prix justes et transparents

N'hésitez pas à nous contacter pour toute question !`}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-green-600" size={32} />
            <h2 className="text-xl font-semibold">Horaires d&apos;ouverture</h2>
          </div>
          <p className="text-gray-600">
            Lundi - Vendredi : 9h00 - 19h00<br />
            Samedi : 10h00 - 18h00<br />
            Dimanche : Fermé
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Truck className="text-green-600" size={32} />
            <h2 className="text-xl font-semibold">Livraison</h2>
          </div>
          <p className="text-gray-600">
            Livraison rapide en 24-48h<br />
            Frais de port offerts dès 50€<br />
            Emballage discret et sécurisé
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="text-green-600" size={32} />
            <h2 className="text-xl font-semibold">Sécurité</h2>
          </div>
          <p className="text-gray-600">
            Paiement 100% sécurisé<br />
            Protection de vos données<br />
            Satisfaction garantie
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="text-green-600" size={32} />
            <h2 className="text-xl font-semibold">Qualité</h2>
          </div>
          <p className="text-gray-600">
            Produits certifiés<br />
            Contrôle qualité rigoureux<br />
            Traçabilité complète
          </p>
        </div>
      </div>
    </div>
  );
}