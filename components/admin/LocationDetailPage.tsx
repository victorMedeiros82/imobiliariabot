import React, { useState, useEffect, useMemo } from 'react';
import type { Property } from '../../types';
import { getProperties } from '../../services/storageService';
import { ChevronLeftIcon, PropertyIcon, CashIcon, ViewListIcon, ViewGridIcon } from '../Icons';
import { PropertyDetailsModal } from './PropertyDetailsModal';

interface LocationDetailPageProps {
    locationName: string;
    onBack: () => void;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-primary text-white">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

export const LocationDetailPage: React.FC<LocationDetailPageProps> = ({ locationName, onBack }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    
    useEffect(() => {
        setProperties(getProperties().filter(p => p.location === locationName));
    }, [locationName]);

    const stats = useMemo(() => {
        const totalCount = properties.length;
        const totalValueForSale = properties
            .filter(p => p.transactionType === 'Venda')
            .reduce((sum, p) => sum + p.price, 0);
        return { totalCount, totalValueForSale };
    }, [properties]);

    const renderListView = () => (
        <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Nome do Imóvel</th>
                    <th scope="col" className="px-6 py-3">Tipo</th>
                    <th scope="col" className="px-6 py-3">Transação</th>
                    <th scope="col" className="px-6 py-3">Preço</th>
                </tr>
            </thead>
            <tbody>
                {properties.map(prop => (
                    <tr 
                        key={prop.id} 
                        className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedProperty(prop)}
                    >
                        <td className="px-6 py-4 font-medium text-gray-900">{prop.name}</td>
                        <td className="px-6 py-4">{prop.type}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                prop.transactionType === 'Venda' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {prop.transactionType}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">R$ {prop.price.toLocaleString('pt-BR')}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderCardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map(prop => (
                <button
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className="bg-white rounded-lg shadow-md p-4 space-y-3 text-left w-full hover:shadow-xl hover:ring-2 hover:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200"
                >
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-brand-dark flex-1 pr-2">{prop.name}</p>
                        <span className="text-xs font-semibold bg-brand-primary text-white px-2 py-1 rounded-full whitespace-nowrap">{prop.transactionType}</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{prop.type}</p>
                        <p className="text-lg font-bold text-brand-secondary mt-1">R$ {prop.price.toLocaleString('pt-BR')}</p>
                    </div>
                </button>
            ))}
        </div>
    );
    
    return (
        <div className="animate-fade-in">
            <button 
                onClick={onBack} 
                className="flex items-center gap-1 text-brand-primary font-semibold mb-4 hover:underline"
            >
                <ChevronLeftIcon />
                Voltar para Todas as Localidades
            </button>
            <h1 className="text-3xl font-bold text-brand-dark">
                <span className="text-gray-400 font-medium">Localidade /</span> {locationName}
            </h1>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <StatCard title="Total de Imóveis" value={stats.totalCount.toString()} icon={<PropertyIcon />} />
                <StatCard title="Valor Total (Venda)" value={`R$ ${stats.totalValueForSale.toLocaleString('pt-BR')}`} icon={<CashIcon />} />
            </div>

            {/* Properties List */}
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-brand-dark">Imóveis em {locationName}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            title="Visualizar em Lista"
                        >
                            <ViewListIcon />
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            title="Visualizar em Cartões"
                        >
                            <ViewGridIcon />
                        </button>
                    </div>
                 </div>
                {properties.length > 0 ? (
                    <div className={viewMode === 'list' ? '' : 'p-4'}>
                        {viewMode === 'list' ? renderListView() : renderCardView()}
                    </div>
                ) : (
                    <p className="p-6 text-center text-gray-500">Nenhum imóvel cadastrado para esta localidade.</p>
                )}
            </div>

            {selectedProperty && (
                <PropertyDetailsModal
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                />
            )}
        </div>
    );
};