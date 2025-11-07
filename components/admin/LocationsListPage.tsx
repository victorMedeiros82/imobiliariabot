import React, { useState, useEffect, useMemo } from 'react';
import { getLocations, addLocation, deleteLocation, getProperties } from '../../services/storageService';
import { TrashIcon, LocationIcon, BuildingOfficeIcon, ViewListIcon, ViewGridIcon } from '../Icons';

interface LocationsListPageProps {
  onDataChange: () => void;
  onSelectLocation: (locationName: string) => void;
}

export const LocationsListPage: React.FC<LocationsListPageProps> = ({ onDataChange, onSelectLocation }) => {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');

  const refreshData = () => {
    const allLocations = getLocations();
    const allProperties = getProperties();
    
    const counts: Record<string, number> = {};
    allLocations.forEach(loc => counts[loc] = 0);
    allProperties.forEach(prop => {
        if (prop.location in counts) {
            counts[prop.location]++;
        }
    });

    setLocations(allLocations);
    setPropertyCounts(counts);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      addLocation(newLocation.trim());
      setNewLocation('');
      refreshData();
      onDataChange();
    }
  };

  const handleDeleteLocation = (location: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a localidade "${location}"?`)) {
      deleteLocation(location);
      refreshData();
      onDataChange();
    }
  };
  
  const sortedLocations = useMemo(() => {
    return [...locations].sort((a, b) => a.localeCompare(b));
  }, [locations]);

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Localidade</th>
                    <th scope="col" className="px-6 py-3">Nº de Imóveis</th>
                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                </tr>
            </thead>
            <tbody>
                {sortedLocations.map(loc => {
                    const count = propertyCounts[loc] || 0;
                    const canDelete = count === 0;
                    return (
                        <tr
                            key={loc}
                            onClick={() => onSelectLocation(loc)}
                            className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                        >
                            <td className="px-6 py-4 font-medium text-gray-900">{loc}</td>
                            <td className="px-6 py-4">{count}</td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteLocation(loc);
                                    }}
                                    disabled={!canDelete}
                                    className={`p-2 rounded-full transition-colors ${
                                        canDelete
                                        ? 'text-red-500 hover:bg-red-100 hover:text-red-700'
                                        : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={canDelete ? `Excluir ${loc}` : 'Não é possível excluir, pois existem imóveis nesta localidade.'}
                                >
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedLocations.map(loc => {
        const count = propertyCounts[loc] || 0;
        const canDelete = count === 0;

        return (
            <button 
              key={loc}
              onClick={() => onSelectLocation(loc)}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between text-left hover:shadow-xl hover:ring-2 hover:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200 cursor-pointer w-full group"
          >
              <div className="flex-1">
                  <p className="font-bold text-lg text-brand-dark group-hover:text-brand-secondary">{loc}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <BuildingOfficeIcon />
                      <span>{count} Imóve{count === 1 ? 'l' : 'is'}</span>
                  </div>
              </div>
              <div className="text-right mt-4">
                  <div className="relative inline-block">
                        <button 
                          onClick={(e) => {
                              e.stopPropagation(); // Prevent card click when deleting
                              handleDeleteLocation(loc);
                          }} 
                          disabled={!canDelete}
                          className={`p-2 rounded-full transition-colors ${
                              canDelete 
                              ? 'text-red-500 hover:bg-red-100 hover:text-red-700' 
                              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          }`}
                          title={canDelete ? `Excluir ${loc}` : 'Não é possível excluir, pois existem imóveis nesta localidade.'}
                      >
                          <TrashIcon />
                      </button>
                      {!canDelete && (
                          <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2 left-1/2">
                              Não é possível excluir, pois existem imóveis nesta localidade.
                          </div>
                      )}
                  </div>
              </div>
            </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-dark">Gerenciamento de Localidades</h1>
      
      {/* Add new location form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center gap-2">
            <LocationIcon />
            Adicionar Nova Localidade
          </h2>
          <form onSubmit={handleAddLocation} className="flex flex-col sm:flex-row gap-2">
              <input
              type="text"
              placeholder="Ex: Curitiba, PR"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              <button
              type="submit"
              className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-opacity whitespace-nowrap"
              >
              + Adicionar
              </button>
          </form>
      </div>

      {/* List of current locations */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-brand-dark">Localidades Atuais</h2>
            <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-md">
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-600 hover:bg-white/50'}`}
                    title="Visualizar em Lista"
                >
                    <ViewListIcon />
                </button>
                <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md ${viewMode === 'card' ? 'bg-white shadow-sm text-brand-primary' : 'text-gray-600 hover:bg-white/50'}`}
                    title="Visualizar em Cartões"
                >
                    <ViewGridIcon />
                </button>
            </div>
        </div>

        {sortedLocations.length > 0 ? (
          viewMode === 'list' ? renderListView() : renderCardView()
        ) : (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-md">
             <p>Nenhuma localidade cadastrada.</p>
          </div>
        )}
      </div>
    </div>
  );
};