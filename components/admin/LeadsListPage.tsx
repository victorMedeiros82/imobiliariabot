import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, LeadStatus } from '../../types';
import { getLeads, deleteLead, updateLead } from '../../services/storageService';
import { EditIcon, TrashIcon, FireIcon } from '../Icons';
import { LeadDetailsModal } from './LeadDetailsModal';

const statusMap: Record<LeadStatus, { text: string; className: string }> = {
  new: { text: 'Novo', className: 'bg-blue-100 text-blue-800' },
  contacted: { text: 'Contatado', className: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { text: 'Em Progresso', className: 'bg-purple-100 text-purple-800' },
  closed: { text: 'Fechado', className: 'bg-green-100 text-green-800' },
  archived: { text: 'Arquivado', className: 'bg-gray-100 text-gray-800' },
};

const LeadCard: React.FC<{lead: Lead; onEdit: (lead: Lead) => void; onDelete: (leadId: string) => void;}> = ({lead, onEdit, onDelete}) => (
    <div className="bg-white rounded-lg shadow-md mb-4 p-4">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
                {lead.score === 'hot' && <FireIcon />}
                <p className="font-bold text-lg text-brand-dark">{lead.name}</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[lead.status].className}`}>
                    {statusMap[lead.status].text}
                </span>
            </div>
             <div className="flex items-center gap-2">
                <button onClick={() => onEdit(lead)} className="text-blue-600 hover:text-blue-800" title="Editar / Ver Detalhes">
                    <EditIcon />
                </button>
                <button onClick={() => onDelete(lead.id)} className="text-red-600 hover:text-red-800" title="Excluir Lead">
                    <TrashIcon />
                </button>
            </div>
        </div>
        <div className="mt-4 border-t pt-4">
            <p className="text-sm text-gray-600"><strong className="text-gray-800">Email:</strong> <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a></p>
            <p className="text-sm text-gray-600"><strong className="text-gray-800">Telefone:</strong> <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a></p>
            <p className="text-sm text-gray-600"><strong className="text-gray-800">Data:</strong> {new Date(lead.timestamp).toLocaleDateString('pt-BR')}</p>
        </div>
    </div>
);


export const LeadsListPage: React.FC = () => {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const refreshLeads = () => {
    setAllLeads(getLeads());
  };
  
  useEffect(() => {
    refreshLeads();
  }, []);

  const handleDelete = (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      deleteLead(leadId);
      refreshLeads();
    }
  };
  
  const handleSaveLead = (leadId: string, updates: Partial<Lead>) => {
      updateLead(leadId, updates);
      refreshLeads();
      setSelectedLead(null);
  }

  const filteredLeads = useMemo(() => {
    return allLeads.filter(lead => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allLeads, searchTerm, statusFilter]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-dark mb-6 hidden md:block">Gerenciamento de Leads</h1>
      
      {/* Filters */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as LeadStatus | 'all')}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
        >
          <option value="all">Todos os Status</option>
          {Object.keys(statusMap).map(status => (
            <option key={status} value={status}>{statusMap[status as LeadStatus].text}</option>
          ))}
        </select>
      </div>
      
      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Nenhum lead encontrado com os filtros atuais.</p>
      ) : (
        <>
        {/* Mobile View - Cards */}
        <div className="md:hidden">
            {filteredLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onEdit={setSelectedLead} onDelete={handleDelete} />
            ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Contato</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {lead.score === 'hot' && <span title="Lead Quente"><FireIcon /></span>}
                      <span>{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
                    </div>
                  </td>
                  <td className="px-6 py-4">{new Date(lead.timestamp).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[lead.status].className}`}>
                      {statusMap[lead.status].text}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => setSelectedLead(lead)} className="text-blue-600 hover:text-blue-800" title="Editar / Ver Detalhes">
                        <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(lead.id)} className="text-red-600 hover:text-red-800" title="Excluir Lead">
                        <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {selectedLead && (
        <LeadDetailsModal 
            lead={selectedLead} 
            onClose={() => setSelectedLead(null)}
            onSave={handleSaveLead}
        />
      )}
    </div>
  );
};
