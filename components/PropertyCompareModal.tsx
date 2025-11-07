import React, { useState } from 'react';
import type { Property } from '../types';
import { CloseIcon, BotIcon } from './Icons';
import { getAIComparison } from '../services/geminiService';

interface PropertyCompareModalProps {
  properties: Property[];
  onClose: () => void;
  userSummary?: string;
}

const renderText = (text: string) => {
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const listFormatted = boldFormatted.replace(/^\s*\*\s(.*)/gm, '<li class="ml-4 list-disc">$1</li>');
  const listFormatted2 = listFormatted.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
  return <div dangerouslySetInnerHTML={{ __html: listFormatted2.replace(/\n/g, '<br />') }} />;
};

export const PropertyCompareModal: React.FC<PropertyCompareModalProps> = ({ properties, onClose, userSummary }) => {
    const [aiComparison, setAiComparison] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGetAIComparison = async () => {
        setIsLoading(true);
        setAiComparison('');
        try {
            const result = await getAIComparison(properties, userSummary);
            setAiComparison(result);
        } catch (error) {
            setAiComparison('Desculpe, ocorreu um erro ao gerar a comparação.');
        } finally {
            setIsLoading(false);
        }
    };

    const allFeatures = Array.from(new Set(properties.flatMap(p => p.features)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-6xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <CloseIcon />
        </button>
        
        <div className="flex-shrink-0 border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-brand-dark">Comparar Imóveis</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="text-left p-2 font-bold text-brand-dark w-1/4">Característica</th>
                        {properties.map(p => (
                            <th key={p.id} className="text-left p-2 font-semibold text-brand-dark">
                                {p.name}
                                <p className="text-xs text-gray-500 font-normal">{p.location}</p>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b">
                        <td className="p-2 font-semibold">Preço</td>
                        {properties.map(p => (
                            <td key={p.id} className="p-2 font-bold text-brand-secondary text-lg">
                                R$ {p.price.toLocaleString('pt-BR')}
                            </td>
                        ))}
                    </tr>
                    <tr className="border-b">
                        <td className="p-2 font-semibold">Tipo</td>
                        {properties.map(p => <td key={p.id} className="p-2">{p.type}</td>)}
                    </tr>
                    {allFeatures.map(feature => (
                        <tr key={feature} className="border-b">
                            <td className="p-2 font-semibold">{feature}</td>
                            {properties.map(p => (
                                <td key={p.id} className="p-2 text-center">
                                    {p.features.includes(feature) ? 
                                        <span className="text-green-500 font-bold">✓</span> : 
                                        <span className="text-red-400 font-bold">✗</span>}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="mt-6">
                <button 
                    onClick={handleGetAIComparison}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-opacity disabled:opacity-50"
                >
                    <BotIcon />
                    {isLoading ? 'Analisando...' : 'Análise da IA ✨'}
                </button>

                {aiComparison && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md animate-fade-in">
                        <h4 className="font-bold text-brand-dark mb-2">Análise Inteligente</h4>
                        <div className="text-sm text-gray-800 space-y-2">{renderText(aiComparison)}</div>
                    </div>
                )}
                 {isLoading && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md flex items-center gap-3">
                       <div className="w-5 h-5 border-2 border-t-transparent border-brand-primary rounded-full animate-spin"></div>
                       <p className="text-sm text-gray-600">Nossa IA está analisando os imóveis para você...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
