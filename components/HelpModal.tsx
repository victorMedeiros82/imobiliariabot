import React, { useState } from 'react';
import { CloseIcon, HelpIcon } from './Icons';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, isOpen, onClick }) => (
  <div className="border-b">
    <button
      onClick={onClick}
      className="flex justify-between items-center w-full py-4 text-left font-semibold text-brand-dark hover:bg-gray-50 px-2 rounded-md"
    >
      <span>{title}</span>
      <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    </button>
    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      <div className="p-4 pt-0 text-gray-600">
        {children}
      </div>
    </div>
  </div>
);

const faqData = [
    {
        title: "Como busco um imóvel?",
        content: "É fácil! Use os botões de resposta rápida como 'Buscar Imóveis' ou simplesmente digite o que você procura (ex: 'casa com piscina em Goiânia'). O nosso assistente virtual fará perguntas sobre o tipo de imóvel, se é para comprar ou alugar, e a localização para refinar sua busca."
    },
    {
        title: "Como funciona a busca 'Perto de Mim'?",
        content: "Ao clicar em 'Perto de Mim', o chatbot solicitará permissão para acessar sua localização. Com sua permissão, ele buscará os imóveis cadastrados mais próximos de onde você está, facilitando a descoberta de oportunidades na sua vizinhança."
    },
    {
        title: "Posso comparar imóveis?",
        content: "Sim! Ao receber uma lista de imóveis, clique na caixinha de seleção no canto superior esquerdo de cada imóvel que te interessar (até 3). Um botão 'Comparar' aparecerá na parte inferior da tela. Clicando nele, você verá uma tabela lado a lado com as características, e poderá até pedir para a nossa IA analisar e comparar os imóveis para você."
    },
    {
        title: "Como favoritar um imóvel?",
        content: "Gostou de um imóvel e quer salvá-lo para ver depois? Basta clicar no ícone de estrela (☆) no card do imóvel. Ele ficará amarelo (★) e será salvo na sua lista de favoritos, que você pode acessar clicando no ícone de estrela no topo da página."
    },
    {
        title: "O que é um 'Imóvel VIP'?",
        content: "Imóveis VIP, marcados com uma coroa (👑), são listagens exclusivas e de alto padrão. Para visualizar os detalhes completos desses imóveis, é necessário ter uma conta VIP. Você pode fazer o upgrade do seu perfil a qualquer momento para ter acesso a essas oportunidades únicas."
    },
    {
        title: "Como falo com um corretor?",
        content: "Após o chatbot entender o que você procura, ele irá te apresentar um resumo da sua busca. Em seguida, ele oferecerá a opção de conectar você com um de nossos especialistas. Basta confirmar o interesse e preencher seus dados de contato para que um corretor entre em contato em breve."
    }
]

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <CloseIcon />
        </button>
        
        <div className="flex-shrink-0 border-b pb-4 mb-4 flex items-center gap-3">
            <HelpIcon />
            <h2 className="text-2xl font-bold text-brand-dark">Perguntas Frequentes</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            {faqData.map((faq, index) => (
                <AccordionItem 
                    key={index} 
                    title={faq.title}
                    isOpen={openIndex === index}
                    onClick={() => handleToggle(index)}
                >
                    <p>{faq.content}</p>
                </AccordionItem>
            ))}
        </div>

      </div>
    </div>
  );
};
