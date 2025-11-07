
import React, { useState, useEffect } from 'react';
import { CloseIcon, StarIcon } from './Icons';

interface ContactFormProps {
  onClose: () => void;
  onSubmit: (details: { name: string; email: string; phone: string; message: string }) => void;
  initialData?: {
      name: string;
      email: string;
  };
  summary: string;
  favoritedProperties: string[];
  intent: 'buy' | 'sell';
}

export const ContactForm: React.FC<ContactFormProps> = ({ onClose, onSubmit, initialData, summary, favoritedProperties, intent }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialData) {
        setName(initialData.name);
        setEmail(initialData.email);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone, message });
  };
  
  const isSelling = intent === 'sell';

  const title = isSelling ? "Anuncie seu Imóvel Conosco" : "Ótima escolha!";
  const description = isSelling 
    ? "Preencha seus dados e um de nossos especialistas em captação entrará em contato para uma avaliação e para cuidar de todo o processo de venda."
    : "Revisamos os detalhes da sua busca para garantir o melhor atendimento. Por favor, confirme seus dados.";
  const buttonText = isSelling ? "Enviar para Avaliação" : "Receber Contato do Especialista";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg relative flex flex-col max-h-[90vh] animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <CloseIcon />
        </button>
        <div className="flex-shrink-0 mb-4">
            <h2 className="text-2xl font-bold text-brand-dark mb-1">{title}</h2>
            <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
            {!isSelling && (
                <>
                    {summary && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700">Resumo da sua Busca</h4>
                            <p className="text-gray-600 bg-blue-50 p-3 rounded-md italic text-sm">"{summary}"</p>
                        </div>
                    )}
                    {(favoritedProperties && favoritedProperties.length > 0) && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-700">Imóveis Favoritados</h4>
                            <div className="bg-gray-50 p-3 rounded-md">
                                <ul className="space-y-1">
                                    {favoritedProperties.map(prop => (
                                        <li key={prop} className="flex items-center gap-2 text-sm text-gray-800">
                                            <StarIcon isFilled className="w-4 h-4 text-brand-accent" />
                                            <span>{prop}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

        <form onSubmit={handleSubmit} className="flex-shrink-0">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <input
              type="tel"
              placeholder="Telefone com DDD"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-secondary text-white font-bold py-3 px-4 rounded-md mt-6 hover:opacity-90 transition-opacity"
          >
            {buttonText}
          </button>
           <p className="text-xs text-gray-500 text-center mt-2">Seus dados estão seguros conosco.</p>
        </form>
      </div>
    </div>
  );
};