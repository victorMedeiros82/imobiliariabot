import React from 'react';
import { CloseIcon, CrownIcon } from './Icons';

interface UpgradeModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-md relative flex flex-col text-center items-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <CloseIcon />
        </button>
        
        <div className="w-16 h-16 bg-brand-accent text-white rounded-full flex items-center justify-center mb-4">
            <CrownIcon className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-brand-dark mb-2">Acesso VIP Exclusivo</h2>
        <p className="text-gray-600 mb-6">Este imóvel é exclusivo para membros VIP. Faça o upgrade para ter acesso a este e outros imóveis premium!</p>

        <ul className="text-left space-y-2 text-gray-700 mb-8">
            <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">✓</span>
                <span>Veja imóveis de alto padrão antes de todos.</span>
            </li>
            <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">✓</span>
                <span>Receba atendimento prioritário de nossos especialistas.</span>
            </li>
             <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">✓</span>
                <span>Acesso a conteúdos e análises de mercado exclusivas.</span>
            </li>
        </ul>
        
        <div className="w-full flex flex-col gap-2">
             <button
                onClick={onConfirm}
                className="w-full bg-brand-accent text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
            >
                <CrownIcon />
                Tornar-se VIP Agora
            </button>
            <button
                onClick={onClose}
                className="w-full text-gray-500 font-medium py-2 px-6 rounded-md hover:bg-gray-100 transition-colors"
            >
                Agora não
            </button>
        </div>

      </div>
    </div>
  );
};