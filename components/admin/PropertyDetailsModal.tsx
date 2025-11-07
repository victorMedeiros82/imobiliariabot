
import React, { useState } from 'react';
import type { Property } from '../../types';
import { CloseIcon, StarIcon, CrownIcon } from '../Icons';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  isFavorited?: boolean;
  onFavoriteToggle?: (propertyId: string) => void;
}

const FeatureTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full inline-block">
        {children}
    </span>
);

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ property, onClose, isFavorited, onFavoriteToggle }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasImages = property.images && property.images.length > 0;
  const activeImage = hasImages ? property.images![activeImageIndex] : 'https://via.placeholder.com/800x600.png?text=Sem+Imagem';
    
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-3xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <CloseIcon />
        </button>
        
        <div className="flex-shrink-0 border-b pb-4 mb-4">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-brand-dark flex items-center gap-2">
                        {property.name}
                        {property.isVip && (
                            <span className="bg-brand-accent-light text-brand-accent-dark text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1" title="Imóvel VIP">
                                <CrownIcon className="h-4 w-4" />
                                VIP
                            </span>
                        )}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{property.type} em {property.location}</p>
                </div>
                <span className={`flex-shrink-0 px-3 py-1 text-sm font-semibold rounded-full ${
                    property.transactionType === 'Venda' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {property.transactionType}
                </span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-3">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200">
                    <img src={activeImage} alt={`${property.name} - imagem ${activeImageIndex + 1}`} className="w-full h-full object-cover" />
                </div>
                {hasImages && property.images!.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {property.images!.map((img, index) => (
                            <button 
                                key={index}
                                onClick={() => setActiveImageIndex(index)}
                                className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ring-2 ring-offset-2 transition-all ${index === activeImageIndex ? 'ring-brand-primary' : 'ring-transparent hover:ring-brand-primary/50'}`}
                            >
                                <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="space-y-4">
                 <div>
                    <h4 className="font-bold text-gray-700">Preço</h4>
                    <p className="text-3xl font-bold text-brand-secondary">R$ {property.price.toLocaleString('pt-BR')}</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-gray-700">Descrição</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{property.description || 'Nenhuma descrição fornecida.'}</p>
                </div>

                <div>
                    <h4 className="font-bold text-gray-700 mb-2">Características</h4>
                    <div className="flex flex-wrap items-center">
                        {(property.features && property.features.length > 0) ? (
                            property.features.map((feature, index) => (
                               <FeatureTag key={index}>{feature}</FeatureTag>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Nenhuma característica especial listada.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-shrink-0 pt-6 mt-auto flex justify-between items-center">
             {onFavoriteToggle && (
                <button
                    onClick={() => onFavoriteToggle(property.id)}
                    className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-md transition-colors ${
                        isFavorited ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    <StarIcon isFilled={isFavorited} className="h-5 w-5" />
                    <span>{isFavorited ? 'Favoritado' : 'Favoritar'}</span>
                </button>
            )}

            <button
                onClick={onClose}
                className="w-full sm:w-auto bg-brand-primary text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition-opacity ml-auto"
            >
                Fechar
            </button>
        </div>

      </div>
    </div>
  );
};
