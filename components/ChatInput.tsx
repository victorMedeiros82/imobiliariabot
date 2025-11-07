

import React, { useState } from 'react';
import { SendIcon, ImageIcon, CloseIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onImageUploadClick: () => void;
  imagePreviewUrl: string | null;
  onRemoveImage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onImageUploadClick, imagePreviewUrl, onRemoveImage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || imagePreviewUrl) && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      {imagePreviewUrl && (
        <div className="relative inline-block mb-2 ml-12">
            <img src={imagePreviewUrl} alt="Preview" className="h-16 w-16 rounded-md object-cover" />
            <button
                type="button"
                onClick={onRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                aria-label="Remover imagem"
            >
                <CloseIcon />
            </button>
        </div>
      )}
      <div className="relative">
         <button
            type="button"
            onClick={onImageUploadClick}
            disabled={isLoading}
            className="absolute inset-y-0 left-0 flex items-center justify-center w-12 h-full text-gray-500 hover:text-brand-primary disabled:text-gray-300 transition-colors"
            aria-label="Anexar imagem"
        >
            <ImageIcon />
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isLoading ? "Aguarde a resposta..." : "Digite sua mensagem..."}
          disabled={isLoading}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-white bg-brand-primary rounded-r-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <SendIcon />
          )}
        </button>
      </div>
    </form>
  );
};
