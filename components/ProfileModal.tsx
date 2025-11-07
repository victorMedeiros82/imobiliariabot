import React, { useState, useEffect } from 'react';
import type { User, PropertyType } from '../types';
import { CloseIcon, StarIcon, CrownIcon } from './Icons';
import { getLocations } from '../services/storageService';
import { PROPERTY_TYPES } from '../constants';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
  onOpenFavorites: () => void;
  onUpgradeClick: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave, onOpenFavorites, onUpgradeClick }) => {
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    
    const [propertyType, setPropertyType] = useState<PropertyType | ''>(user.searchPreferences?.propertyType || '');
    const [transactionType, setTransactionType] = useState<'Venda' | 'Aluguel' | 'Temporada' | ''>(user.searchPreferences?.transactionType || '');
    const [selectedLocations, setSelectedLocations] = useState<string[]>(user.searchPreferences?.locations || []);

    const [availableLocations, setAvailableLocations] = useState<string[]>([]);

    useEffect(() => {
        setAvailableLocations(getLocations());
    }, []);

    const handleLocationToggle = (location: string) => {
        setSelectedLocations(prev =>
            prev.includes(location)
                ? prev.filter(l => l !== location)
                : [...prev, location]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // FIX: Safely construct searchPreferences to avoid assigning empty strings to properties that don't allow them.
        const newSearchPrefs: User['searchPreferences'] = {
            ...user.searchPreferences,
            locations: selectedLocations,
        };

        if (propertyType) {
            newSearchPrefs.propertyType = propertyType;
        } else {
            delete newSearchPrefs.propertyType;
        }

        if (transactionType) {
            newSearchPrefs.transactionType = transactionType;
        } else {
            delete newSearchPrefs.transactionType;
        }

        const updates: Partial<User> = {
            name,
            phone,
            searchPreferences: newSearchPrefs
        };
        onSave(updates);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
            <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
              <CloseIcon />
            </button>
            
            <div className="flex-shrink-0 border-b pb-4 mb-6 flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-brand-dark">Meu Perfil</h2>
                    <p className="text-sm text-gray-500">Gerencie seus dados e preferências.</p>
                </div>
                {user.isVip && (
                    <div className="flex items-center gap-2 bg-brand-accent-light text-brand-accent-dark font-bold px-3 py-1 rounded-full text-sm">
                        <CrownIcon className="h-5 w-5"/>
                        <span>Membro VIP</span>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                {/* Personal Info */}
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-3">Informações Pessoais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(DDD) 99999-9999" className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"/>
                        </div>
                    </div>
                </div>

                 {/* Search Preferences */}
                <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-3">Preferências de Busca</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700">Tipo de Imóvel</label>
                            <select id="propertyType" value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                <option value="">Todos</option>
                                {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">Tipo de Transação</label>
                            {/* FIX: Replaced unsafe 'as any' cast with a specific type assertion for type safety. */}
                            <select id="transactionType" value={transactionType} onChange={(e) => setTransactionType(e.target.value as 'Venda' | 'Aluguel' | 'Temporada' | '')} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                <option value="">Todas</option>
                                <option value="Venda">Venda</option>
                                <option value="Aluguel">Aluguel</option>
                                <option value="Temporada">Temporada</option>
                            </select>
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Cidades de Interesse</label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md">
                            {availableLocations.map(loc => (
                                <label key={loc} className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedLocations.includes(loc)}
                                        onChange={() => handleLocationToggle(loc)}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span className="text-sm text-gray-800">{loc}</span>
                                </label>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
    
            <div className="flex-shrink-0 pt-6 mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                 <button 
                    type="button"
                    onClick={onOpenFavorites}
                    className="flex items-center gap-2 font-semibold py-2 px-4 rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 order-2 sm:order-1"
                >
                    <StarIcon isFilled className="h-5 w-5 text-brand-accent" />
                    <span>Meus Favoritos</span>
                </button>

                {!user.isVip && (
                     <button
                        type="button"
                        onClick={onUpgradeClick}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold py-2 px-6 rounded-md transition-colors bg-brand-accent text-white hover:bg-opacity-90 order-1 sm:order-1"
                    >
                        <CrownIcon className="h-5 w-5" />
                        <span>Tornar-se VIP</span>
                    </button>
                )}

                <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2 ml-auto">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
                        Cancelar
                    </button>
                     <button type="submit" className="w-full sm:w-auto bg-brand-secondary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity">
                        Salvar
                    </button>
                </div>
            </div>
          </form>
        </div>
      );
};