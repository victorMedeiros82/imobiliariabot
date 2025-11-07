
import { GoogleGenAI, Content, FunctionDeclaration, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { getProperties } from './storageService';
import type { Property, Message } from '../types';

let ai: GoogleGenAI | null = null;
let dynamicSystemInstruction: string | null = null;

const calculateMortgageFunctionDeclaration: FunctionDeclaration = {
    name: 'calculateMortgage',
    description: 'Calcula o valor da parcela mensal de um financiamento imobiliário com base no valor total, entrada, e prazo.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            totalAmount: {
                type: Type.NUMBER,
                description: 'O valor total do imóvel. Ex: 1800000',
            },
            downPayment: {
                type: Type.NUMBER,
                description: 'O valor da entrada que o cliente vai dar. Ex: 360000',
            },
            years: {
                type: Type.INTEGER,
                description: 'O prazo do financiamento em anos. Ex: 30',
            },
            interestRate: {
                type: Type.NUMBER,
                description: 'A taxa de juros anual. O valor padrão é 9.5. Ex: 9.5',
            },
        },
        required: ['totalAmount', 'downPayment', 'years'],
    },
};

function formatPropertiesForAI(properties: Property[]): string {
    if (properties.length === 0) {
        return "Nenhum imóvel disponível no momento.";
    }
    return properties.map(p => 
        `- **[PROPERTY_ID: ${p.id}] ${p.name}:** ${p.type} em ${p.location} para ${p.transactionType}. Preço: R$ ${p.price.toLocaleString('pt-BR')}. Descrição: ${p.description}. Características: ${p.features.join(', ')}.`
    ).join('\n');
}

function initializeAI() {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  
  const properties = getProperties();
  const propertyListText = formatPropertiesForAI(properties);
  // FIX: Changed import from namespace to named import to resolve module loading issue where the template string was undefined.
  dynamicSystemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.replace('{{PROPERTY_LIST}}', propertyListText);

  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

function getAI(): GoogleGenAI {
    if (!ai) {
        initializeAI();
    }
    return ai!;
}

export function resetChatSession(): void {
    console.log("AI knowledge base is being updated...");
    ai = null;
    dynamicSystemInstruction = null;
}

function buildGeminiHistory(history: Message[]): Content[] {
    // Filter out initial user-facing messages and empty placeholders
    const cleanHistory = history.filter(m => 
        m.id !== 'initial-ai-message' && 
        m.id !== 'initial-ai-message-welcome-back' && 
        m.text.trim() !== ''
    );

    return cleanHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
}

export async function sendMessageToAI(history: Message[], newMessageOrParts: string | any[]) {
  try {
    const aiInstance = getAI();
    
    const contents = buildGeminiHistory(history);
    
    if (typeof newMessageOrParts === 'string') {
        contents.push({ role: 'user', parts: [{ text: newMessageOrParts }]});
    } else {
        contents.push({ role: 'user', parts: newMessageOrParts });
    }

    const result = await aiInstance.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: dynamicSystemInstruction!,
      },
      tools: [{ functionDeclarations: [calculateMortgageFunctionDeclaration] }],
    });
    return result;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    // Let the caller handle the error to display a message in the UI
    throw error;
  }
}


export async function generateFollowUpNote(summary: string) {
    try {
        const aiInstance = getAI();
        const prompt = `Baseado no seguinte resumo do pedido de um cliente, escreva uma nota de acompanhamento concisa para um corretor de imóveis. A nota deve ser um lembrete rápido dos pontos-chave para a ação. Resumo: "${summary}"`;
        const result = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error generating follow-up note:", error);
        return "Não foi possível gerar a nota. Tente novamente.";
    }
}

export async function getAIComparison(properties: Property[], userSummary?: string) {
    try {
        const aiInstance = getAI();
        const propertyDetails = properties.map(p => 
            `- **${p.name} (ID: ${p.id})** em ${p.location} por R$ ${p.price.toLocaleString('pt-BR')}. Tipo: ${p.type}. Características: ${p.features.join(', ')}.`
        ).join('\n');

        const prompt = `
            Um cliente está comparando os seguintes imóveis:
            ${propertyDetails}

            ${userSummary ? `O cliente descreveu seu interesse da seguinte forma: "${userSummary}"` : ''}

            Por favor, forneça uma análise comparativa concisa. Destaque os principais prós e contras de cada opção, considerando o que um comprador típico valorizaria. Formate sua resposta usando markdown (negrito para títulos e listas para pontos). Conclua com uma recomendação ou uma pergunta para ajudar o cliente a decidir.
        `;
        const result = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error generating AI comparison:", error);
        return "Desculpe, não foi possível gerar a comparação neste momento. Por favor, tente novamente.";
    }
}

export async function generatePropertyDescription(details: Partial<Property>) {
    try {
        const aiInstance = getAI();
        const detailsText = `
- Título: ${details.name}
- Tipo: ${details.type}
- Localização: ${details.location}
- Preço: R$ ${details.price?.toLocaleString('pt-BR')}
- Transação: ${details.transactionType}
- Características principais: ${details.features?.join(', ')}
        `;
        
        const prompt = `
            Você é um corretor de imóveis especialista em marketing. Sua tarefa é escrever uma descrição de imóvel atraente, completa e persuasiva para um anúncio online. A descrição deve ser otimizada para SEO, usando parágrafos curtos e listas para facilitar a leitura. Use uma linguagem sofisticada, mas convidativa.

            Com base nos seguintes dados, crie a descrição:
            ${detailsText}

            **Estrutura da resposta:**
            1.  Um parágrafo de introdução que chame a atenção.
            2.  Um parágrafo detalhando os principais cômodos e características.
            3.  Se aplicável, um parágrafo sobre a área de lazer do condomínio ou o quintal.
            4.  Um parágrafo sobre a localização e suas conveniências.
            5.  Uma chamada para ação (CTA) convidando para agendar uma visita.

            **Importante:** A resposta deve conter APENAS o texto da descrição, sem nenhum título ou formatação extra como "Resposta:" ou "Descrição:".
        `;

        const result = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Error generating property description:", error);
        return "Não foi possível gerar a descrição. Verifique os dados e tente novamente.";
    }
}
