export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  properties?: Property[];
}

export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'closed' | 'archived';
export type LeadScore = 'hot' | 'warm' | 'cold';

export interface Note {
    id: string;
    text: string;
    timestamp: string;
}

export interface Lead {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  notes: Note[];
  score: LeadScore;
  summary: string;
  favoritedProperties: string[];
}

export type PropertyType = 'Alto Padrão' | 'Apartamento' | 'Casa' | 'Chácara' | 'Duplex' | 'Escritório' | 'Fazenda' | 'Galpão' | 'Kitnet' | 'Lançamento' | 'Lote' | 'Sala Comercial' | 'Shop' | 'Sítio' | 'Sobrado' | 'Triplex' | 'Vila';

export interface Property {
    id: string;
    name: string;
    type: PropertyType;
    location: string;
    price: number;
    transactionType: 'Venda' | 'Aluguel' | 'Temporada';
    description: string;
    features: string[];
    images?: string[];
    isVip?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Store a hash, not the plain password
  chatHistory: Message[];
  favoritedProperties: string[];
  phone?: string;
  searchPreferences?: {
      propertyType?: PropertyType;
      transactionType?: 'Venda' | 'Aluguel' | 'Temporada';
      locations?: string[];
  };
  isVip?: boolean;
}