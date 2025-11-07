import React from 'react';
import type { Property } from '../types';
import { StarIcon, LocationIcon, CrownIcon, CheckIcon } from './Icons';

interface PropertyCardProps {
    property: Property;
    isFavorited: boolean;
    onFavoriteToggle: (propertyId: string) => void;
    onViewDetails: (propertyId: string) => void;
    isInCompareList: boolean;
    onCompareToggle: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, isFavorited, onFavoriteToggle, onViewDetails, isInCompareList, onCompareToggle }) => {
    const coverImage = property.images && property.images.length > 0
        ? property.images[0]
        : 'https://via.placeholder.com/400x300.png?text=Ultra+Imobiliária';

    const handleCompareClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when toggling compare
        onCompareToggle(property.id);
    };

    return (
        <div className={`border rounded-lg w-64 bg-white shadow-sm flex flex-col transition-shadow hover:shadow-xl overflow-hidden group relative ${isInCompareList ? 'ring-2 ring-brand-secondary' : ''}`}>
            <div className="absolute top-2 left-2 z-10">
                 <button
                    onClick={handleCompareClick}
                    className={`h-6 w-6 flex items-center justify-center rounded-md border transition-all duration-200 ${
                        isInCompareList
                            ? 'bg-brand-secondary border-brand-secondary text-white'
                            : 'bg-white/70 border-gray-300 text-gray-500 hover:bg-white'
                    }`}
                    title={isInCompareList ? "Remover da Comparação" : "Adicionar para Comparar"}
                >
                   {isInCompareList && <CheckIcon />}
                </button>
            </div>
            {property.isVip && (
                <div className="absolute top-2 right-2 bg-brand-accent p-1 rounded-full z-10 shadow-lg" title="Imóvel VIP">
                    <CrownIcon className="h-4 w-4 text-white" />
                </div>
            )}
            <button onClick={() => onViewDetails(property.id)} className="w-full">
                <div className="h-40 bg-gray-200 overflow-hidden">
                     <img src={coverImage} alt={property.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </div>
            </button>
            <div className="p-3 flex flex-col gap-2 flex-1">
                 <button onClick={() => onViewDetails(property.id)} className="text-left">
                    <h3 className="font-bold text-brand-dark group-hover:text-brand-secondary transition-colors truncate" title={property.name}>{property.name}</h3>
                </button>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                    <LocationIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{property.location}</span>
                </p>
                <div className="flex justify-between items-center mt-auto pt-2">
                    <p className="text-lg font-semibold text-brand-secondary">
                        R$ {property.price.toLocaleString('pt-BR')}
                    </p>
                    <button
                        onClick={() => onFavoriteToggle(property.id)}
                        className={`p-2 rounded-full transition-colors ${isFavorited ? 'text-brand-accent hover:text-brand-accent-dark' : 'text-gray-400 hover:text-brand-accent'}`}
                        aria-label={`Favoritar ${property.name}`}
                    >
                        <StarIcon isFilled={isFavorited} className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};