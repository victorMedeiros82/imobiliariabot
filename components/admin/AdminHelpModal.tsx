import React, { useState } from 'react';
import { CloseIcon, HelpIcon } from '../Icons';

type HelpTab = 'dashboard' | 'leads' | 'properties' | 'locations' | 'ai';

const helpContent: Record<HelpTab, React.ReactNode> = {
    dashboard: (
        <div className="space-y-4">
            <p>O <strong>Dashboard</strong> oferece uma visão geral e rápida da performance do seu chatbot.</p>
            <ul className="list-disc ml-5 space-y-2">
                <li><strong>Cards de Estatísticas:</strong> Mostram o total de leads, quantos são "quentes" (alta intenção), quantos são novos e a taxa de conversão (leads fechados / total de leads).</li>
                <li><strong>Filtro de Período:</strong> Você pode filtrar os dados para ver apenas os leads dos últimos 7 dias, 30 dias ou de todo o período.</li>
                <li><strong>Leads Recentes:</strong> Uma lista dos últimos 5 leads que interagiram com o chatbot.</li>
                <li><strong>Leads por Status:</strong> Um gráfico que mostra a distribuição dos leads entre os status 'Novo', 'Contatado', 'Em Progresso', etc.</li>
            </ul>
        </div>
    ),
    leads: (
        <div className="space-y-4">
            <p>A seção de <strong>Leads</strong> é onde você gerencia todos os contatos gerados pelo chatbot.</p>
             <ul className="list-disc ml-5 space-y-2">
                <li><strong>Busca e Filtro:</strong> Use a barra de busca para encontrar um lead por nome, e-mail ou telefone. Filtre a lista por status para organizar seu trabalho.</li>
                <li><strong>Detalhes do Lead:</strong> Clique no ícone de edição (lápis) para ver todos os detalhes, incluindo o resumo gerado pela IA, imóveis favoritados, e o histórico de notas.</li>
                <li><strong>Sugerir Nota com IA:</strong> Dentro dos detalhes do lead, clique em "Sugerir Nota com IA ✨" para que o Gemini crie uma nota de acompanhamento concisa baseada no pedido do cliente, economizando seu tempo.</li>
                <li><strong>Contato Rápido:</strong> Use os links de e-mail e telefone para entrar em contato. O ícone do WhatsApp gera uma mensagem de introdução automática para iniciar a conversa.</li>
                <li><strong>Atualizar Status:</strong> Mantenha o status do lead sempre atualizado para ter um dashboard preciso.</li>
            </ul>
        </div>
    ),
    properties: (
        <div className="space-y-4">
            <p>Aqui você gerencia todo o seu <strong>catálogo de imóveis</strong>, que é a base de conhecimento do chatbot.</p>
             <ul className="list-disc ml-5 space-y-2">
                <li><strong>Adicionar/Editar Imóveis:</strong> Use o botão "+ Adicionar Imóvel" ou o ícone de edição para abrir o formulário. Preencha todos os detalhes, incluindo nome, tipo, preço, características e URLs de imagens.</li>
                <li><strong>Visualização:</strong> Alterne entre a visualização em lista (densa) ou em cartões (visual) para melhor se adaptar ao seu fluxo de trabalho.</li>
                <li><strong>Imóvel VIP:</strong> Marcar um imóvel como VIP (👑) significa que apenas clientes com perfil VIP poderão ver seus detalhes completos no chat. É uma ótima forma de oferecer um benefício exclusivo.</li>
                <li><strong>Excluir Imóveis:</strong> Clicar no ícone de lixeira (🗑️) removerá o imóvel permanentemente do sistema.</li>
                <li><strong>Importância da Atualização:</strong> Manter esta lista atualizada é crucial, pois o chatbot usa essas informações para responder aos clientes.</li>
            </ul>
        </div>
    ),
    locations: (
        <div className="space-y-4">
            <p>As <strong>Localidades</strong> definem as cidades e regiões onde sua imobiliária atua.</p>
             <ul className="list-disc ml-5 space-y-2">
                <li><strong>Adicionar Localidades:</strong> Adicione novas cidades para que elas apareçam como opções no formulário de edição de imóveis e nas preferências de busca dos clientes.</li>
                <li><strong>Ver Imóveis por Localidade:</strong> Clique em uma localidade na lista ou nos cartões para ir a uma página de detalhes que lista todos os imóveis cadastrados naquela cidade.</li>
                <li><strong>Excluir Localidades:</strong> Você só pode excluir uma localidade se não houver nenhum imóvel associado a ela. Isso previne que imóveis fiquem sem uma localização definida.</li>
            </ul>
        </div>
    ),
    ai: (
        <div className="space-y-4">
            <p>O assistente virtual é alimentado pela <strong>API Gemini do Google</strong>, uma inteligência artificial avançada.</p>
             <ul className="list-disc ml-5 space-y-2">
                <li><strong>Base de Conhecimento:</strong> A IA utiliza a lista de imóveis que você cadastra como sua principal fonte de informação. Respostas precisas dependem de dados bem cadastrados.</li>
                <li><strong>Instruções do Sistema:</strong> O comportamento do chatbot (como ele cumprimenta, as perguntas que faz, etc.) é definido por um conjunto de regras internas. As funcionalidades como cálculo de financiamento e busca por geolocalização são ativadas por essas regras.</li>
                <li><strong>Atualização Dinâmica:</strong> Sempre que você adiciona, edita ou remove um imóvel ou localidade, o sistema de ajuda é atualizado. Clicar em "Salvar" nos formulários de imóveis/localidades aciona uma atualização na "memória" da IA.</li>
            </ul>
        </div>
    ),
}

interface AdminHelpModalProps {
  onClose: () => void;
}

export const AdminHelpModal: React.FC<AdminHelpModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<HelpTab>('dashboard');

  const TabButton: React.FC<{ tab: HelpTab; children: React.ReactNode }> = ({ tab, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
        activeTab === tab 
          ? 'text-brand-primary border-brand-primary' 
          : 'text-gray-500 border-transparent hover:text-brand-dark hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-3xl relative flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <CloseIcon />
        </button>
        
        <div className="flex-shrink-0 mb-4 flex items-center gap-3">
            <HelpIcon />
            <h2 className="text-2xl font-bold text-brand-dark">Central de Ajuda do Administrador</h2>
        </div>
        
        <div className="flex-shrink-0 border-b -mx-8 px-8">
            <div className="flex items-center space-x-2 overflow-x-auto">
                <TabButton tab="dashboard">Dashboard</TabButton>
                <TabButton tab="leads">Leads</TabButton>
                <TabButton tab="properties">Imóveis</TabButton>
                <TabButton tab="locations">Localidades</TabButton>
                <TabButton tab="ai">Sobre a IA</TabButton>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 text-gray-700">
            {helpContent[activeTab]}
        </div>

      </div>
    </div>
  );
};