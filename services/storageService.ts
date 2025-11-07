import type { Lead, Property, User } from '../types';

const LEADS_KEY = 'ultra-imobiliaria-leads';
const PROPERTIES_KEY = 'ultra-imobiliaria-properties';
const LOCATIONS_KEY = 'ultra-imobiliaria-locations';
const USERS_KEY = 'ultra-imobiliaria-users';
const CURRENT_USER_KEY = 'ultra-imobiliaria-current-user'; // Using sessionStorage for session management

// --- INITIAL DATA ---
const initialLocations: string[] = [
    "Goiânia, GO",
    "Aparecida de Goiânia, GO",
    "Trindade, GO",
    "Rio Verde, GO",
    "Senador Canedo, GO",
    "Guapó, GO",
    "Anápolis, GO",
    "Caldas Novas, GO"
];

const initialProperties: Property[] = [
    { id: 'APTO-GYN-MARISTA-01', name: 'Apartamento de Luxo no Setor Marista', type: 'Alto Padrão', location: 'Goiânia, GO', price: 1800000, transactionType: 'Venda', description: '3 suítes plenas, varanda gourmet com churrasqueira, lazer completo no condomínio.', features: ['Piscina', 'Segurança 24h', 'Garagem', 'Varanda Gourmet'], images: ['https://picsum.photos/seed/APTO-GYN-MARISTA-01/800/600', 'https://picsum.photos/seed/APTO-GYN-MARISTA-01-2/800/600', 'https://picsum.photos/seed/APTO-GYN-MARISTA-01-3/800/600'], isVip: true },
    { id: 'CASA-GYN-ALPHA-02', name: 'Casa Térrea no Alphaville Goiás', type: 'Alto Padrão', location: 'Goiânia, GO', price: 4500000, transactionType: 'Venda', description: '4 suítes, piscina aquecida, projeto de iluminação e paisagismo impecável.', features: ['Piscina', 'Segurança 24h', 'Jacuzzi'], images: ['https://picsum.photos/seed/CASA-GYN-ALPHA-02/800/600', 'https://picsum.photos/seed/CASA-GYN-ALPHA-02-2/800/600'], isVip: true },
    { id: 'SALA-GYN-BUENO-03', name: 'Sala Comercial no Orion Business', type: 'Sala Comercial', location: 'Goiânia, GO', price: 6500, transactionType: 'Aluguel', description: 'Sala com 45m², vista panorâmica, no complexo de saúde e negócios mais moderno da cidade.', features: ['Garagem', 'Segurança 24h'], images: ['https://picsum.photos/seed/SALA-GYN-BUENO-03/800/600'] },
    { id: 'APTO-APG-CENTRO-04', name: 'Apartamento 2 Quartos no Garavelo', type: 'Apartamento', location: 'Aparecida de Goiânia, GO', price: 250000, transactionType: 'Venda', description: 'Ótima localização, próximo a comércios e terminal de ônibus. Condomínio com área de lazer.', features: ['Garagem', 'Playground'], images: ['https://picsum.photos/seed/APTO-APG-CENTRO-04/800/600', 'https://picsum.photos/seed/APTO-APG-CENTRO-04-2/800/600'] },
    { id: 'CASA-TRINDADE-SANTUARIO-05', name: 'Casa 3 Quartos em Trindade', type: 'Casa', location: 'Trindade, GO', price: 350000, transactionType: 'Venda', description: 'Casa espaçosa, próxima ao Santuário do Divino Pai Eterno, com quintal amplo.', features: ['Quintal'], images: ['https://picsum.photos/seed/CASA-TRINDADE-SANTUARIO-05/800/600'] },
    { id: 'LOTE-SC-CONDOMINIO-06', name: 'Lote no Condomínio Viena', type: 'Lote', location: 'Senador Canedo, GO', price: 180000, transactionType: 'Venda', description: 'Lote de 360m² em condomínio fechado com infraestrutura completa e segurança.', features: ['Segurança 24h'], images: ['https://picsum.photos/seed/LOTE-SC-CONDOMINIO-06/800/600'] },
    { id: 'CHACARA-GUAPO-LAZER-07', name: 'Chácara de Lazer em Guapó', type: 'Chácara', location: 'Guapó, GO', price: 600000, transactionType: 'Venda', description: 'Chácara com casa principal, piscina, pomar e acesso a córrego. Ideal para fins de semana.', features: ['Piscina', 'Área Verde'], images: ['https://picsum.photos/seed/CHACARA-GUAPO-LAZER-07/800/600', 'https://picsum.photos/seed/CHACARA-GUAPO-LAZER-07-2/800/600'] },
    { id: 'FAZENDA-RIO-VERDE-08', name: 'Fazenda de 50 Alqueires', type: 'Fazenda', location: 'Rio Verde, GO', price: 10000000, transactionType: 'Venda', description: 'Terra de cultura, dupla aptidão, com casa sede e curral. Próxima à rodovia.', features: ['Casa Sede', 'Curral'], images: ['https://picsum.photos/seed/FAZENDA-RIO-VERDE-08/800/600'] },
    { id: 'APTO-CALDAS-TURISMO-09', name: 'Apartamento de 1 Quarto no DiRoma', type: 'Apartamento', location: 'Caldas Novas, GO', price: 1500, transactionType: 'Temporada', description: 'Totalmente mobiliado, com acesso ao parque aquático do condomínio. Perfeito para férias.', features: ['Piscina', 'Mobiliado', 'Parque Aquático'], images: ['https://picsum.photos/seed/APTO-CALDAS-TURISMO-09/800/600'] },
    { id: 'SOBRADO-RIO-VERDE-CENTRO-10', name: 'Sobrado Comercial/Residencial', type: 'Sobrado', location: 'Rio Verde, GO', price: 950000, transactionType: 'Venda', description: 'Excelente ponto no centro da cidade, com 4 quartos na parte superior e salão comercial no térreo.', features: ['Localização Central'], images: ['https://picsum.photos/seed/SOBRADO-RIO-VERDE-CENTRO-10/800/600'] }
];

const initialUsers: User[] = [
    {
        id: 'user-demo-01',
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        passwordHash: '48690', // "123"
        chatHistory: [],
        favoritedProperties: [],
        phone: '62999998888',
        searchPreferences: {
            propertyType: 'Apartamento',
            transactionType: 'Venda',
            locations: ['Goiânia, GO']
        },
        isVip: false,
    }
];

// --- INITIALIZATION ---
function initializeStorage() {
    if (!localStorage.getItem(PROPERTIES_KEY)) {
        localStorage.setItem(PROPERTIES_KEY, JSON.stringify(initialProperties));
    }
    if (!localStorage.getItem(LOCATIONS_KEY)) {
        localStorage.setItem(LOCATIONS_KEY, JSON.stringify(initialLocations));
    }
     if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }
}
initializeStorage();

// --- USER MANAGEMENT ---
export const getUsers = (): User[] => {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
};

export const addUser = (user: Omit<User, 'id' | 'chatHistory' | 'favoritedProperties'>): User => {
    const users = getUsers();
    const newUser: User = {
        ...user,
        id: `user-${Date.now()}`,
        chatHistory: [],
        favoritedProperties: [],
        phone: '',
        searchPreferences: {},
        isVip: false,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([newUser, ...users]));
    return newUser;
};

export const getUserByEmail = (email: string): User | undefined => {
    return getUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
};

export const updateUser = (userId: string, updates: Partial<User>): void => {
    let users = getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Also update the current session user if they are the one being updated
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            setCurrentUser({ ...currentUser, ...updates });
        }
    }
};

export const setCurrentUser = (user: User): void => {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
    try {
        const userJson = sessionStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error("Failed to parse current user from sessionStorage", error);
        return null;
    }
};

export const clearCurrentUser = (): void => {
    sessionStorage.removeItem(CURRENT_USER_KEY);
};


// --- LEADS ---
export const getLeads = (): Lead[] => {
    try {
        const leadsJson = localStorage.getItem(LEADS_KEY);
        const leads = leadsJson ? (JSON.parse(leadsJson) as Lead[]) : [];
        return leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        console.error("Failed to parse leads from localStorage", error);
        return [];
    }
};

export const addLead = (leadDetails: Omit<Lead, 'id' | 'timestamp' | 'status' | 'notes'>): void => {
    const leads = getLeads();
    const newLead: Lead = {
        ...leadDetails,
        id: `lead-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'new',
        notes: [],
    };
    const updatedLeads = [newLead, ...leads.filter(l => l.id !== newLead.id)];
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
};

export const updateLead = (leadId: string, updates: Partial<Lead>): void => {
    let leads = getLeads();
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    if (leadIndex > -1) {
        leads[leadIndex] = { ...leads[leadIndex], ...updates };
        localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    }
};

export const deleteLead = (leadId: string): void => {
    let leads = getLeads();
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
};


// --- PROPERTIES ---
export const getProperties = (): Property[] => {
    try {
        const propertiesJson = localStorage.getItem(PROPERTIES_KEY);
        return propertiesJson ? JSON.parse(propertiesJson) : [];
    } catch (error) {
        console.error("Failed to parse properties from localStorage", error);
        return [];
    }
};

export const getPropertiesByIds = (ids: string[]): Property[] => {
    const allProperties = getProperties();
    const propertyMap = new Map(allProperties.map(p => [p.id, p]));
    return ids.map(id => propertyMap.get(id)).filter((p): p is Property => !!p);
};

export const addProperty = (property: Omit<Property, 'id'>): void => {
    const properties = getProperties();
    const newProperty: Property = {
        ...property,
        id: `PROP-${Date.now()}`
    };
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify([newProperty, ...properties]));
};

export const updateProperty = (propertyId: string, updates: Partial<Property>): void => {
    let properties = getProperties();
    const propIndex = properties.findIndex(p => p.id === propertyId);
    if (propIndex > -1) {
        properties[propIndex] = { ...properties[propIndex], ...updates };
        localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
    }
};

export const deleteProperty = (propertyId: string): void => {
    const updatedProperties = getProperties().filter(p => p.id !== propertyId);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(updatedProperties));
};


// --- LOCATIONS ---
export const getLocations = (): string[] => {
    try {
        const locationsJson = localStorage.getItem(LOCATIONS_KEY);
        return locationsJson ? JSON.parse(locationsJson) : [];
    } catch (error) {
        console.error("Failed to parse locations from localStorage", error);
        return [];
    }
};

export const addLocation = (location: string): void => {
    const locations = getLocations();
    if (location && !locations.includes(location)) {
        localStorage.setItem(LOCATIONS_KEY, JSON.stringify([location, ...locations]));
    }
};

export const deleteLocation = (locationToDelete: string): void => {
    const updatedLocations = getLocations().filter(l => l !== locationToDelete);
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(updatedLocations));
};