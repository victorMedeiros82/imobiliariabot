import React from 'react';
import type { Property } from '../types';
import { CloseIcon, StarIcon } from './Icons';
import { PropertyCard } from './PropertyCard';

interface FavoritesModalProps {
  properties: Property[];
  onClose: () => void;
  onFavoriteToggle: (propertyId: string) => void;
  onViewDetails: (propertyId: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ properties, onClose, onFavoriteToggle, onViewDetails }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-4xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <CloseIcon />
        </button>
        
        <div className="flex-shrink-0 border-b pb-4 mb-6 flex items-center gap-3">
            <StarIcon isFilled className="h-6 w-6 text-brand-accent"/>
            <h2 className="text-2xl font-bold text-brand-dark">Meus Imóveis Favoritos</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <StarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <p className="font-semibold">Nenhum favorito ainda</p>
              <p className="text-sm">Clique na estrela de um imóvel para adicioná-lo aqui.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {properties.map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isFavorited={true} // Always true in this view
                  onFavoriteToggle={onFavoriteToggle}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};