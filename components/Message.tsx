import React from 'react';
import type { Message } from '../types';
import { BotIcon, UserIcon } from './Icons';
import { PropertyCard } from './PropertyCard';

interface MessageProps {
  message: Message;
  favoritedProperties?: string[];
  onFavoriteToggle?: (propertyId: string) => void;
  onViewDetails?: (propertyId: string) => void;
  comparisonList?: string[];
  onCompareToggle?: (propertyId: string) => void;
}

const renderText = (text: string) => {
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const listFormatted = boldFormatted.replace(/^\s*\*\s(.*)/gm, '<li class="ml-4">$1</li>');
  return <span dangerouslySetInnerHTML={{ __html: listFormatted.replace(/\n/g, '<br />') }} />;
};

export const ChatMessage: React.FC<MessageProps> = ({ 
    message, 
    favoritedProperties = [], 
    onFavoriteToggle = () => {}, 
    onViewDetails = () => {},
    comparisonList = [],
    onCompareToggle = () => {}
}) => {
  const isAI = message.sender === 'ai';

  const messageClasses = `flex items-start gap-3 my-4 ${isAI ? '' : 'flex-row-reverse'}`;
  const bubbleClasses = `p-4 rounded-xl max-w-lg ${isAI ? 'bg-gray-100 text-brand-dark' : 'bg-brand-primary text-white'}`;
  const iconContainerClasses = `flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-brand-secondary text-white' : 'bg-gray-300 text-brand-dark'}`;

  // If the message is from the user, just render a simple bubble
  if (!isAI) {
    return (
        <div className={messageClasses}>
            <div className={iconContainerClasses}>
                <UserIcon />
            </div>
            <div className={bubbleClasses}>
                <div className="text-sm">{message.text}</div>
            </div>
        </div>
    );
  }

  // If the message is from the AI, render text bubble and/or property cards
  return (
    <div className={messageClasses}>
      <div className={iconContainerClasses}>
        <BotIcon />
      </div>
      <div className="flex flex-col items-start gap-3">
        {message.text && (
            <div className={bubbleClasses}>
                <div className="text-sm">{renderText(message.text)}</div>
            </div>
        )}
        {message.properties && message.properties.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {message.properties.map(prop => (
              <PropertyCard
                key={prop.id}
                property={prop}
                isFavorited={favoritedProperties.includes(prop.id)}
                onFavoriteToggle={onFavoriteToggle}
                onViewDetails={onViewDetails}
                isInCompareList={comparisonList.includes(prop.id)}
                onCompareToggle={onCompareToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};