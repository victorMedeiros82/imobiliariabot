
import React, { useState } from 'react';
import { BotIcon } from './Icons';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onClientClick: () => void;
}

// For demo purposes, the password is hardcoded.
const ADMIN_PASSWORD = 'admin123';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onClientClick }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Senha incorreta. Por favor, tente novamente.');
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-brand-light p-4">
      <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mb-4">
            <BotIcon />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">Acesso Administrativo</h1>
          <p className="text-gray-500">Ultra Imobiliária AI</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-opacity"
          >
            Entrar
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <button type="button" onClick={onClientClick} className="font-medium text-brand-primary hover:underline">
            Voltar ao login do cliente
          </button>
        </p>
      </div>
    </div>
  );
};
