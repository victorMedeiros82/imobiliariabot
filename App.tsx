
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Message, LeadScore, User, Property } from './types';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/Message';
import { ContactForm } from './components/ContactForm';
import { LoginPage } from './components/LoginPage';
import { AdminPage } from './components/AdminPage';
import { ClientLoginPage } from './components/AuthModal';
import { QuickReplies } from './components/QuickReplies';
import { PropertyDetailsModal } from './components/admin/PropertyDetailsModal';
import { FavoritesModal } from './components/FavoritesModal';
import { ProfileModal } from './components/ProfileModal';
import { UpgradeModal } from './components/UpgradeModal';
import { PropertyCompareModal } from './components/PropertyCompareModal';
import { HelpModal } from './components/HelpModal';
import { sendMessageToAI, resetChatSession } from './services/geminiService';
import { addLead, getCurrentUser, setCurrentUser, clearCurrentUser, updateUser, getPropertiesByIds, getProperties } from './services/storageService';
import { BotIcon, AdminIcon, LogoutIcon, StarIcon, ProfileIcon, CrownIcon, HelpIcon } from './components/Icons';

// To avoid creating a new file, the ChatPage component is defined here.
// It encapsulates all the logic and UI for the main chat interface.
const ChatPage: React.FC<{ user: User; onLogout: () => void; onAdminClick: () => void; onProfileUpdate: (updates: Partial<User>) => void; }> = ({ user, onLogout, onAdminClick, onProfileUpdate }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactFormIntent, setContactFormIntent] = useState<'buy' | 'sell'>('buy');
    
    const [favoritedProperties, setFavoritedProperties] = useState<string[]>([]);
    const [comparisonList, setComparisonList] = useState<string[]>([]);
    const [showComparisonModal, setShowComparisonModal] = useState(false);

    const [currentSummary, setCurrentSummary] = useState('');
    const [currentScore, setCurrentScore] = useState<LeadScore | null>(null);
    const [activeQuickReplies, setActiveQuickReplies] = useState<string[]>([]);
    const [viewingPropertyId, setViewingPropertyId] = useState<string | null>(null);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [pendingVipPropertyId, setPendingVipPropertyId] = useState<string | null>(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [attachedImage, setAttachedImage] = useState<{ file: File, previewUrl: string, base64: string } | null>(null);
  
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const viewingProperty = useMemo(() => {
        if (!viewingPropertyId) return null;
        return getProperties().find(p => p.id === viewingPropertyId) || null;
    }, [viewingPropertyId]);

    const favoritedPropertyObjects = useMemo(() => getPropertiesByIds(favoritedProperties), [favoritedProperties]);
    const comparisonPropertyObjects = useMemo(() => getPropertiesByIds(comparisonList), [comparisonList]);
  
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleInitialSendMessage = useCallback(async (initialHistory: Message[]) => {
        setIsLoading(true);
        const aiMessageId = `ai-${Date.now()}`;
        const aiPlaceholderMessage: Message = { id: aiMessageId, text: '', sender: 'ai' };
        setMessages([...initialHistory, aiPlaceholderMessage]);

        try {
            const stream = await sendMessageToAI(initialHistory, "Olá");
             let fullResponseText = '';
            for await (const chunk of stream) {
                fullResponseText += chunk.text;
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponseText.split(/\[QUICK_REPLIES:/)[0] } : m));
            }
            const quickRepliesMatch = fullResponseText.match(/\[QUICK_REPLIES:\s*([^\]]+)\]/);
            if (quickRepliesMatch) {
                setActiveQuickReplies(quickRepliesMatch[1].split('|').map(s => s.trim()));
            }
             setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, text: fullResponseText.replace(/\[QUICK_REPLIES:\s*[^\]]+\]/, '').trim() } : m));

        } catch (error) {
             setMessages(prev => prev.filter(m => m.id !== aiMessageId)); 
        } finally {
            setIsLoading(false);
        }
    }, []);

    const initializeChat = useCallback(() => {
        let initialMessages = user.chatHistory;
        if (initialMessages.length === 0) {
            initialMessages = [{
                id: 'initial-ai-message-welcome-back',
                text: `Olá, ${user.name}! Bem-vindo(a) de volta. Como posso te ajudar a encontrar seu imóvel hoje?`,
                sender: 'ai',
            }];
            handleInitialSendMessage(initialMessages);
        }
        setMessages(initialMessages);
        setFavoritedProperties(user.favoritedProperties || []);
    }, [user.chatHistory, user.favoritedProperties, user.name, handleInitialSendMessage]);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);
    
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    useEffect(() => {
        const userToUpdate = getCurrentUser();
        if (userToUpdate) {
            updateUser(userToUpdate.id, {
                chatHistory: messages,
                favoritedProperties: favoritedProperties
            });
        }
    }, [messages, favoritedProperties]);
  
    const handleFavoriteToggle = (propertyId: string) => {
      setFavoritedProperties(prev => 
          prev.includes(propertyId) 
          ? prev.filter(id => id !== propertyId)
          : [...prev, propertyId]
      );
    };

    const handleComparisonToggle = (propertyId: string) => {
        setComparisonList(prev => {
            if (prev.includes(propertyId)) {
                return prev.filter(id => id !== propertyId);
            }
            if (prev.length < 3) {
                return [...prev, propertyId];
            }
            // Optional: Show a notification that max 3 properties can be compared
            return prev;
        });
    };

    const handleViewDetailsClick = (propertyId: string) => {
        const property = getProperties().find(p => p.id === propertyId);
        if (!property) return;

        if (property.isVip && !user.isVip) {
            setPendingVipPropertyId(propertyId);
            setShowUpgradeModal(true);
        } else {
            setViewingPropertyId(propertyId);
        }
    };

    const handleUpgradeToVip = () => {
        onProfileUpdate({ isVip: true });
        setShowUpgradeModal(false);
        if (pendingVipPropertyId) {
            setViewingPropertyId(pendingVipPropertyId);
            setPendingVipPropertyId(null);
        }
    };
    
    const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAttachedImage({
                    file,
                    previewUrl: URL.createObjectURL(file),
                    base64: base64String
                });
            };
            reader.readAsDataURL(file);
        }
    };
  
    const handleSendMessage = async (userMessageText: string, isFunctionResponse = false) => {
      if (!userMessageText.trim() && !attachedImage && !isFunctionResponse) return;
  
      setActiveQuickReplies([]);
      
      const currentHistory = [...messages];
      let messageToSend: string | any[] = userMessageText;

      if (!isFunctionResponse) {
        const newUserMessage: Message = { id: `user-${Date.now()}`, text: userMessageText, sender: 'user' };
        currentHistory.push(newUserMessage);
        setMessages(currentHistory);

        if(attachedImage) {
            const imagePart = {
                inlineData: {
                    mimeType: attachedImage.file.type,
                    data: attachedImage.base64,
                },
            };
            const textPart = { text: userMessageText || "Analise esta imagem." };
            messageToSend = [textPart, imagePart];
            setAttachedImage(null); // Clear image after sending
        }
      } else {
        messageToSend = userMessageText; // This is actually parts array for function response
      }
      
      const aiMessageId = `ai-${Date.now()}`;
      const aiPlaceholderMessage: Message = { id: aiMessageId, text: '', sender: 'ai' };
  
      setMessages(prev => [...prev, aiPlaceholderMessage]);
      setIsLoading(true);
  
      try {
        const stream = await sendMessageToAI(currentHistory, messageToSend);
        
        let fullResponseText = '';
        let functionCalls: any[] = [];

        for await (const chunk of stream) {
          if(chunk.functionCalls) {
            functionCalls = [...functionCalls, ...chunk.functionCalls];
          }
          if (chunk.text) {
            fullResponseText += chunk.text;
            setMessages(prev => prev.map(m => 
                m.id === aiMessageId ? { ...m, text: fullResponseText.split(/\[(?:PROPERTIES|QUICK_REPLIES|SUMMARY|SCORE|SHOW_CONTACT_FORM|REQUEST_GEOLOCATION):/)[0] } : m
            ));
          }
        }

        if (functionCalls.length > 0) {
            setMessages(prev => prev.filter(m => m.id !== aiMessageId)); // Remove placeholder
            await handleFunctionCall(functionCalls[0]); // Handle first call
            return; // Stop processing this turn
        }
  
        let processedText = fullResponseText;
        let properties: Property[] = [];
  
        const quickRepliesMatch = processedText.match(/\[QUICK_REPLIES:\s*([^\]]+)\]/);
        if (quickRepliesMatch) {
            setActiveQuickReplies(quickRepliesMatch[1].split('|').map(s => s.trim()));
            processedText = processedText.replace(/\[QUICK_REPLIES:\s*[^\]]+\]/, '').trim();
        }
  
        const propertiesMatch = processedText.match(/\[PROPERTIES:\s*([^\]]+)\]/);
        if (propertiesMatch) {
            const ids = propertiesMatch[1].split(',').map(s => s.trim()).filter(id => id);
            if (ids.length > 0) {
                properties = getPropertiesByIds(ids);
            }
            processedText = processedText.replace(/\[PROPERTIES:\s*[^\]]+\]/, '').trim();
        }
  
        const summaryMatch = processedText.match(/\[SUMMARY:\s*([^\]]+)\]/);
        if (summaryMatch) {
            const summaryText = summaryMatch[1];
            setCurrentSummary(summaryText);
            if (summaryText.toLowerCase().includes('vender') || summaryText.toLowerCase().includes('list') || summaryText.toLowerCase().includes('sell')) {
                setContactFormIntent('sell');
            } else {
                setContactFormIntent('buy');
            }
            processedText = processedText.replace(/\[SUMMARY:\s*[^\]]+\]/, '').trim();
        }
        
        const scoreMatch = processedText.match(/\[SCORE:\s*([^\]]+)\]/);
        if (scoreMatch) {
          setCurrentScore(scoreMatch[1] as LeadScore);
          processedText = processedText.replace(/\[SCORE:\s*[^\]]+\]/, '').trim();
        }
        
        if (processedText.includes('[SHOW_CONTACT_FORM]')) {
          processedText = processedText.replace('[SHOW_CONTACT_FORM]', '').trim();
          setShowContactForm(true);
        }

        if (processedText.includes('[REQUEST_GEOLOCATION]')) {
            processedText = processedText.replace('[REQUEST_GEOLOCATION]', '').trim();
            handleGeoSearch();
        }
        
        setMessages(prev => prev.map(m => 
            m.id === aiMessageId ? { ...m, text: processedText, properties } : m
        ));
  
        if (!processedText.trim() && properties.length === 0) {
            setMessages(prev => prev.filter(m => m.id !== aiMessageId));
        }
  
      } catch (error) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          text: 'Desculpe, algo deu errado. Por favor, tente novamente.',
          sender: 'ai',
        };
         setMessages(prev => prev.map(m => m.id === aiMessageId ? errorMessage : m));
      } finally {
        setIsLoading(false);
      }
    };

    const handleFunctionCall = async (fc: any) => {
        if (fc.name === 'calculateMortgage') {
            const { totalAmount, downPayment, years, interestRate = 9.5 } = fc.args;
            const principal = totalAmount - downPayment;
            const monthlyInterestRate = (interestRate / 100) / 12;
            const numberOfPayments = years * 12;
            const monthlyPayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
            
            const result = {
                monthlyPayment: monthlyPayment.toFixed(2),
                totalAmount,
                downPayment,
                years,
                interestRate
            };

            const functionResponseParts = [{
                functionResponse: {
                    name: 'calculateMortgage',
                    response: { result }
                }
            }];
            await handleSendMessage(functionResponseParts as any, true);
        }
    };
    
    const handleGeoSearch = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handleSendMessage(`O usuário permitiu a localização. As coordenadas são latitude ${latitude} e longitude ${longitude}. Encontre imóveis relevantes nas proximidades, focando na cidade mais próxima que você conhece.`);
                },
                (error) => {
                    handleSendMessage("O usuário não permitiu o acesso à localização.");
                }
            );
        } else {
            handleSendMessage("Geolocalização não é suportada por este navegador.");
        }
    };

    const handleContactFormSubmit = (details: { name: string; email: string; phone: string; message: string }) => {
        addLead({
          ...details,
          summary: currentSummary,
          score: currentScore || 'cold',
          favoritedProperties: contactFormIntent === 'buy' ? favoritedProperties : [],
        });
        setShowContactForm(false);
        setCurrentSummary('');
        setCurrentScore(null);
        setContactFormIntent('buy');
        const confirmationMessage: Message = {
            id: `ai-confirmation-${Date.now()}`,
            text: `Obrigado, ${details.name}! Seus dados foram recebidos. Um de nossos especialistas entrará em contato em breve.`,
            sender: 'ai',
        };
        setMessages((prev) => [...prev, confirmationMessage]);
    };

    return (
        <div className="h-full w-full flex flex-col">
            <header className="bg-brand-primary text-white p-4 shadow-md z-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center">
                        <BotIcon />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Ultra Imobiliária AI</h1>
                        <p className="text-sm opacity-80 flex items-center gap-1">
                            {user.isVip && <CrownIcon className="h-4 w-4 text-brand-accent" />}
                            Bem-vindo(a), {user.name}!
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowHelpModal(true)}
                        className="text-white hover:text-brand-accent transition-colors"
                        aria-label="Ajuda"
                    >
                        <HelpIcon />
                    </button>
                    <button 
                        onClick={() => setShowProfileModal(true)}
                        className="text-white hover:text-brand-accent transition-colors"
                        aria-label="Meu Perfil"
                    >
                        <ProfileIcon />
                    </button>
                    <button 
                        onClick={() => setShowFavoritesModal(true)}
                        className="relative text-white hover:text-brand-accent transition-colors"
                        aria-label="Ver Imóveis Favoritos"
                    >
                        <StarIcon className="h-6 w-6" isFilled={favoritedProperties.length > 0} />
                        {favoritedProperties.length > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {favoritedProperties.length}
                            </span>
                        )}
                    </button>
                     <button 
                        onClick={onLogout}
                        className="flex items-center gap-2 text-white hover:text-red-300 transition-colors"
                        aria-label="Sair"
                    >
                        <LogoutIcon />
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                    <button 
                        onClick={onAdminClick}
                        className="text-white hover:text-brand-secondary transition-colors"
                        aria-label="Painel do Administrador"
                    >
                        <AdminIcon />
                    </button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4">
                <div className="container mx-auto">
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        message={msg} 
                        favoritedProperties={favoritedProperties}
                        onFavoriteToggle={handleFavoriteToggle}
                        onViewDetails={handleViewDetailsClick}
                        comparisonList={comparisonList}
                        onCompareToggle={handleComparisonToggle}
                    />
                ))}
                {isLoading && messages[messages.length - 1]?.sender === 'ai' && !messages[messages.length - 1]?.text && (
                    <div className="flex items-start gap-3 my-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-brand-secondary text-white">
                            <BotIcon />
                        </div>
                        <div className="p-4 rounded-xl max-w-lg bg-gray-100 text-brand-dark flex items-center gap-2">
                            <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>
            </main>
            <div className="container mx-auto px-4">
                {activeQuickReplies.length > 0 && !isLoading && (
                    <QuickReplies replies={activeQuickReplies} onSendReply={handleSendMessage} />
                )}
            </div>
             {comparisonList.length >= 2 && (
                <div className="sticky bottom-[88px] flex justify-center p-2">
                    <button 
                        onClick={() => setShowComparisonModal(true)}
                        className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                        Comparar ({comparisonList.length}) Imóveis
                    </button>
                </div>
            )}
            <footer className="sticky bottom-0 left-0 right-0">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                />
                <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading}
                    onImageUploadClick={() => fileInputRef.current?.click()}
                    imagePreviewUrl={attachedImage?.previewUrl || null}
                    onRemoveImage={() => setAttachedImage(null)}
                />
            </footer>
            {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
            {showContactForm && 
                <ContactForm 
                    onClose={() => setShowContactForm(false)} 
                    onSubmit={handleContactFormSubmit} 
                    initialData={{ name: user.name, email: user.email }}
                    summary={currentSummary}
                    favoritedProperties={favoritedProperties}
                    intent={contactFormIntent}
                />
            }
            {viewingProperty && (
                <PropertyDetailsModal
                    property={viewingProperty}
                    onClose={() => setViewingPropertyId(null)}
                    isFavorited={favoritedProperties.includes(viewingProperty.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                />
            )}
            {showFavoritesModal && (
                <FavoritesModal
                    properties={favoritedPropertyObjects}
                    onClose={() => setShowFavoritesModal(false)}
                    onFavoriteToggle={handleFavoriteToggle}
                    onViewDetails={(propertyId) => {
                        setShowFavoritesModal(false);
                        handleViewDetailsClick(propertyId);
                    }}
                />
            )}
            {showProfileModal && (
                <ProfileModal
                    user={user}
                    onClose={() => setShowProfileModal(false)}
                    onSave={(updates) => {
                        onProfileUpdate(updates);
                        setShowProfileModal(false);
                    }}
                    onOpenFavorites={() => {
                        setShowProfileModal(false);
                        setShowFavoritesModal(true);
                    }}
                    onUpgradeClick={() => {
                        setShowProfileModal(false);
                        setShowUpgradeModal(true);
                    }}
                />
            )}
            {showUpgradeModal && (
                <UpgradeModal
                    onClose={() => {
                        setShowUpgradeModal(false);
                        setPendingVipPropertyId(null);
                    }}
                    onConfirm={handleUpgradeToVip}
                />
            )}
            {showComparisonModal && (
                <PropertyCompareModal
                    properties={comparisonPropertyObjects}
                    onClose={() => setShowComparisonModal(false)}
                    userSummary={currentSummary}
                />
            )}
        </div>
    );
};


type View = 'client' | 'admin_login' | 'admin_panel';

const App: React.FC = () => {
    const [currentUser, setCurrentUserState] = useState<User | null>(null);
    const [view, setView] = useState<View>('client');
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUserState(user);
        }
        setIsInitializing(false);
    }, []);

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        setCurrentUserState(user);
        setView('client');
    };
    
    const handleUserLogout = () => {
        clearCurrentUser();
        setCurrentUserState(null);
        resetChatSession();
    };
    
    const handleAdminLogout = () => {
        setView('client');
    };

    const handleProfileUpdate = (updates: Partial<User>) => {
        if (currentUser) {
            const updatedUser = { ...currentUser, ...updates };
            if (updates.searchPreferences) {
              updatedUser.searchPreferences = { ...currentUser.searchPreferences, ...updates.searchPreferences };
            }
            updateUser(currentUser.id, updates); // storageService gets the partial update
            setCurrentUserState(updatedUser); // react state gets the fully merged object
        }
    };
    
    const renderContent = () => {
        if (isInitializing) {
            return <div className="h-full w-full flex items-center justify-center"><div className="w-16 h-16 border-4 border-t-brand-primary border-gray-200 rounded-full animate-spin"></div></div>;
        }

        switch(view) {
            case 'admin_login':
                return <LoginPage onLoginSuccess={() => setView('admin_panel')} onClientClick={() => setView('client')} />;
            case 'admin_panel':
                return <AdminPage onLogout={handleAdminLogout} onDataChange={resetChatSession} />;
            case 'client':
            default:
                if (currentUser) {
                    return <ChatPage user={currentUser} onLogout={handleUserLogout} onAdminClick={() => setView('admin_login')} onProfileUpdate={handleProfileUpdate} />;
                } else {
                    return <ClientLoginPage onLoginSuccess={handleLoginSuccess} onAdminClick={() => setView('admin_login')} />;
                }
        }
    }

    return (
        <div className="h-screen w-screen bg-brand-light flex flex-col font-sans">
            {renderContent()}
        </div>
    );
};

export default App;
