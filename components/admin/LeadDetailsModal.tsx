import React, { useState } from 'react';
import type { Lead, LeadStatus, Note } from '../../types';
import { CloseIcon, NoteIcon, StarIcon, WhatsAppIcon } from '../Icons';
import { generateFollowUpNote } from '../../services/geminiService';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (leadId: string, updates: Partial<Lead>) => void;
}

const statusMap: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  'in-progress': 'Em Progresso',
  closed: 'Fechado',
  archived: 'Arquivado',
};

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose, onSave }) => {
  const [currentStatus, setCurrentStatus] = useState<LeadStatus>(lead.status);
  const [newNote, setNewNote] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  const handleSave = () => {
    const updates: Partial<Lead> = { status: currentStatus };
    if (newNote.trim()) {
      const note: Note = {
        id: `note-${Date.now()}`,
        text: newNote.trim(),
        timestamp: new Date().toISOString(),
      };
      updates.notes = [...(lead.notes || []), note];
    }
    onSave(lead.id, updates);
  };

  const handleGenerateNote = async () => {
    if (!lead.summary || isGeneratingNote) return;
    setIsGeneratingNote(true);
    setNewNote('Gerando sugestão...');
    try {
        const suggestedNote = await generateFollowUpNote(lead.summary);
        setNewNote(suggestedNote);
    } catch (error) {
        setNewNote('Erro ao gerar nota. Tente novamente.');
    } finally {
        setIsGeneratingNote(false);
    }
  };

  const cleanPhone = lead.phone.replace(/\D/g, '');
  const introMessage = `Olá ${lead.name}, sou da Ultra Imobiliária. Vi seu interesse em nosso portal e gostaria de conversar sobre sua busca: "${lead.summary || 'seu interesse em um imóvel'}". Podemos falar?`;
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(introMessage)}`;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <CloseIcon />
        </button>
        
        <div className="flex-shrink-0 border-b pb-4 mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-brand-dark">{lead.name}</h2>
            <p className="text-sm text-gray-500">Lead recebido em {new Date(lead.timestamp).toLocaleString('pt-BR')}</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* AI Summary */}
            <div>
                <h4 className="font-bold text-gray-700">Resumo da IA</h4>
                <p className="text-gray-600 bg-blue-50 p-3 rounded-md italic">"{lead.summary || 'Nenhum resumo gerado.'}"</p>
            </div>
            
            {/* Favorited Properties */}
            <div>
                <h4 className="font-bold text-gray-700">Imóveis Favoritados</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                    {(lead.favoritedProperties && lead.favoritedProperties.length > 0) ? (
                        <ul className="space-y-1">
                            {lead.favoritedProperties.map(prop => (
                                <li key={prop} className="flex items-center gap-2 text-sm text-gray-800">
                                    <StarIcon isFilled className="w-4 h-4 text-brand-accent" />
                                    <span>{prop}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">Nenhum imóvel favoritado.</p>
                    )}
                </div>
            </div>

            {/* Lead Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <h4 className="font-bold text-gray-700">Email</h4>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline break-words">{lead.email}</a>
                </div>
                <div>
                    <h4 className="font-bold text-gray-700">Telefone</h4>
                    <div className="flex items-center gap-2">
                         <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
                         <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-600"
                            title="Iniciar conversa no WhatsApp"
                        >
                            <WhatsAppIcon />
                        </a>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-700">Mensagem Original</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md italic">"{lead.message || 'Nenhuma mensagem fornecida.'}"</p>
                </div>
            </div>

            {/* Notes Section */}
            <div>
                 <h3 className="text-lg font-bold text-brand-dark mb-2 flex items-center gap-2"><NoteIcon/> Histórico e Notas</h3>
                 <div className="space-y-3 mb-4 max-h-48 overflow-y-auto bg-gray-50 p-3 rounded-md">
                    {(lead.notes && lead.notes.length > 0) ? (
                        [...lead.notes].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(note => (
                            <div key={note.id} className="text-sm border-b pb-2">
                                <p className="text-gray-800">{note.text}</p>
                                <p className="text-xs text-gray-400 text-right">{new Date(note.timestamp).toLocaleString('pt-BR')}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Nenhuma nota adicionada ainda.</p>
                    )}
                 </div>
                 <div className="relative">
                    <textarea
                        placeholder="Adicionar nova nota..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isGeneratingNote}
                    />
                    <button
                        type="button"
                        onClick={handleGenerateNote}
                        disabled={isGeneratingNote || !lead.summary}
                        className="absolute bottom-2 right-2 text-xs bg-brand-accent-light text-brand-accent-dark font-semibold py-1 px-2 rounded-md hover:bg-brand-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Usar IA para sugerir uma nota com base no resumo"
                    >
                        {isGeneratingNote ? 'Gerando...' : 'Sugerir Nota com IA ✨'}
                    </button>
                 </div>
            </div>
        </div>

        {/* Actions Footer */}
        <div className="flex-shrink-0 pt-6 mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-auto">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status do Lead</label>
                <select 
                    id="status"
                    value={currentStatus}
                    onChange={e => setCurrentStatus(e.target.value as LeadStatus)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    {Object.keys(statusMap).map(status => (
                        <option key={status} value={status}>{statusMap[status as LeadStatus]}</option>
                    ))}
                </select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button
                    onClick={onClose}
                    className="w-full sm:w-auto bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Cancelar
                </button>
                 <button
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-brand-secondary text-white font-bold py-2 px-6 rounded-md hover:opacity-90 transition-opacity"
                >
                    Salvar
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};