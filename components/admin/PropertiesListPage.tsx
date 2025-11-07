
import React, { useState, useEffect, useMemo } from 'react';
import type { Property } from '../../types';
import { getProperties, deleteProperty } from '../../services/storageService';
import { EditIcon, TrashIcon, PropertyIcon, CashIcon, ViewGridIcon, ViewListIcon, CrownIcon } from '../Icons';
import { PropertyEditModal } from './PropertyEditModal';
import { PropertyDetailsModal } from './PropertyDetailsModal';

interface PropertiesListPageProps {
  onDataChange: () => void;
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

const ITEMS_PER_PAGE = 10;

export const PropertiesListPage: React.FC<PropertiesListPageProps> = ({ onDataChange }) => {
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'Venda' | 'Aluguel' | 'Temporada'>('all');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);

  const refreshProperties = () => {
    setAllProperties(getProperties());
  };
  
  useEffect(() => {
    refreshProperties();
  }, []);

  const handleDelete = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
      deleteProperty(propertyId);
      refreshProperties();
      onDataChange();
    }
  };
  
  const handleOpenEditModal = (property: Property | null = null) => {
      setEditingProperty(property);
      setIsModalOpen(true);
  }

  const handleEditClick = (e: React.MouseEvent, property: Property) => {
      e.stopPropagation();
      handleOpenEditModal(property);
  }

  const handleCloseEditModal = () => {
      setIsModalOpen(false);
      setEditingProperty(null);
  }

  const handleSave = () => {
      refreshProperties();
      onDataChange();
      handleCloseEditModal();
  }

  const filteredProperties = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    return allProperties.filter(prop => {
        const matchesSearch =
            prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prop.type.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTransaction =
            transactionFilter === 'all' || prop.transactionType === transactionFilter;

        return matchesSearch && matchesTransaction;
    });
  }, [allProperties, searchTerm, transactionFilter]);

  const paginatedProperties = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);

  const stats = useMemo(() => {
      const totalCount = filteredProperties.length;
      const totalValueForSale = filteredProperties
          .filter(p => p.transactionType === 'Venda')
          .reduce((sum, p) => sum + p.price, 0);
      const forRentCount = filteredProperties
          .filter(p => p.transactionType === 'Aluguel' || p.transactionType === 'Temporada')
          .length;
      return { totalCount, totalValueForSale, forRentCount };
  }, [filteredProperties]);

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3">Nome do Imóvel</th>
                <th scope="col" className="px-6 py-3">Tipo</th>
                <th scope="col" className="px-6 py-3">Localidade</th>
                <th scope="col" className="px-6 py-3">Transação</th>
                <th scope="col" className="px-6 py-3">Preço</th>
                <th scope="col" className="px-6 py-3">Ações</th>
                </tr>
            </thead>
            <tbody>
                {paginatedProperties.map((prop) => (
                <tr key={prop.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setViewingProperty(prop)}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                            {/* FIX: Wrapped CrownIcon in a span with a title to fix prop type error, as the component does not accept a 'title' prop. */}
                            {prop.isVip && <span title="Imóvel VIP"><CrownIcon className="h-4 w-4 text-brand-accent" /></span>}
                            <span>{prop.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">{prop.type}</td>
                    <td className="px-6 py-4">{prop.location}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            prop.transactionType === 'Venda' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                             {prop.transactionType}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-semibold">R$ {prop.price.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                        <button onClick={(e) => handleEditClick(e, prop)} className="text-blue-600 hover:text-blue-800" title="Editar">
                            <EditIcon />
                        </button>
                        <button onClick={(e) => handleDelete(e, prop.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                            <TrashIcon />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginatedProperties.map(prop => (
            <button
                key={prop.id}
                onClick={() => setViewingProperty(prop)}
                className="bg-white rounded-lg shadow-md p-4 space-y-3 text-left w-full hover:shadow-xl hover:ring-2 hover:ring-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-all duration-200 group"
            >
                <div className="flex justify-between items-start">
                    <p className="font-bold text-brand-dark flex-1 pr-2 group-hover:text-brand-secondary">{prop.name}</p>
                    <div className="flex items-center gap-2">
                        {/* FIX: Wrapped CrownIcon in a span with a title to fix prop type error, as the component does not accept a 'title' prop. */}
                        {prop.isVip && <span title="Imóvel VIP"><CrownIcon className="h-5 w-5 text-brand-accent" /></span>}
                        <span className="text-xs font-semibold bg-brand-primary text-white px-2 py-1 rounded-full whitespace-nowrap">{prop.transactionType}</span>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{prop.type} em {prop.location}</p>
                    <p className="text-lg font-bold text-brand-secondary mt-1">R$ {prop.price.toLocaleString('pt-BR')}</p>
                </div>
                 <div className="flex items-center justify-end gap-2 border-t pt-3 mt-3">
                    <button onClick={(e) => handleEditClick(e, prop)} className="text-blue-600 hover:text-blue-800" title="Editar">
                        <EditIcon />
                    </button>
                    <button onClick={(e) => handleDelete(e, prop.id)} className="text-red-600 hover:text-red-800" title="Excluir">
                        <TrashIcon />
                    </button>
                </div>
            </button>
        ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-brand-dark">Gerenciamento de Imóveis</h1>
        <button
            onClick={() => handleOpenEditModal()}
            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-opacity whitespace-nowrap"
        >
            + Adicionar Imóvel
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total de Imóveis" value={stats.totalCount.toString()} icon={<PropertyIcon />} />
          <StatCard title="Valor Total (Venda)" value={`R$ ${stats.totalValueForSale.toLocaleString('pt-BR')}`} icon={<CashIcon />} />
          <StatCard title="Imóveis para Aluguel" value={stats.forRentCount.toString()} icon={<PropertyIcon />} />
      </div>


      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
                 <input
                    type="text"
                    placeholder="Buscar por nome, tipo ou localidade..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                 <select
                    value={transactionFilter}
                    onChange={e => setTransactionFilter(e.target.value as 'all' | 'Venda' | 'Aluguel' | 'Temporada')}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                 >
                    <option value="all">Todas as Transações</option>
                    <option value="Venda">Venda</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Temporada">Temporada</option>
                </select>
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
        </div>
      </div>
      
      {/* List */}
      {paginatedProperties.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm">
            <p>Nenhum imóvel encontrado com os filtros atuais.</p>
          </div>
      ) : (
      <>
        {viewMode === 'list' ? renderListView() : renderCardView()}
       
        {/* Pagination */}
        {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mt-4">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                    Anterior
                </button>
                <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                >
                    Próxima
                </button>
            </div>
        )}
      </>
      )}


      {isModalOpen && (
        <PropertyEditModal 
            property={editingProperty} 
            onClose={handleCloseEditModal}
            onSave={handleSave}
        />
      )}

      {viewingProperty && (
        <PropertyDetailsModal 
            property={viewingProperty}
            onClose={() => setViewingProperty(null)}
        />
      )}
    </div>
  );
};