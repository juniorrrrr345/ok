'use client';

import { useState, useEffect } from 'react';
import { api, Farm } from '@/lib/api';
import { Plus, Trash } from 'lucide-react';

export default function FarmsAdmin() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [newFarm, setNewFarm] = useState('');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    const data = await api.getFarms();
    setFarms(data.farms);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarm.trim()) return;

    try {
      await api.createFarm(newFarm);
      setNewFarm('');
      loadFarms();
    } catch (error) {
      alert('Erreur lors de l\'ajout de la farm');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette farm ?')) {
      try {
        await api.deleteFarm(id);
        loadFarms();
      } catch (error) {
        alert('Erreur lors de la suppression de la farm');
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gestion des farms</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleAdd} className="flex space-x-4">
          <input
            type="text"
            value={newFarm}
            onChange={(e) => setNewFarm(e.target.value)}
            placeholder="Nom de la nouvelle farm"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Ajouter</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {farms.map((farm) => (
              <tr key={farm.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {farm.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {farm.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(farm.id)}
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