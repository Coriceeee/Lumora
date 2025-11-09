import React from 'react';
import { useAyuraCore } from '../AyuraCoreProvider';

export const EmotionalMaterialsComponent: React.FC = () => {
  const { materials, meditate, expressGratitude } = useAyuraCore();

  return (
    <div className="p-4 bg-green-50 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Emotional Materials</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💧</span>
          <span>Water (journaling): {materials.water}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌿</span>
          <span>Leaf (meditation): {materials.leaf}</span>
          <button
            className="ml-4 bg-green-500 text-white px-2 py-1 rounded"
            onClick={meditate}
          >
            Meditate
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">☀️</span>
          <span>Sun (gratitude): {materials.sun}</span>
          <button
            className="ml-4 bg-yellow-500 text-white px-2 py-1 rounded"
            onClick={expressGratitude}
          >
            Gratitude
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌸</span>
          <span>Flower: {materials.flower}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Use these materials (water, leaves, sun, flowers) to care for your tree.
      </p>
    </div>
  );
};
