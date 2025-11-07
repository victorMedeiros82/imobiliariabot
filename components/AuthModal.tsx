import React, { useState } from 'react';
import { BotIcon, AdminIcon } from './Icons';
import { addUser, getUserByEmail } from '../services/storageService';
import type { User } from '../types';

type AuthMode = 'login' | 'signup';

interface ClientLoginPageProps {
  onLoginSuccess: (user: User) => void;
  onAdminClick: () => void;
}

// Simple insecure hashing for demo purposes. In a real app, use a proper library like bcrypt.
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};


export const ClientLoginPage: React.FC<ClientLoginPageProps> = ({ onLoginSuccess, onAdminClick }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSwitchMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name || !email || !password) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      if (getUserByEmail(email)) {
        setError('Este e-mail já está cadastrado.');
        return;
      }
      const newUser = addUser({ name, email, passwordHash: simpleHash(password) });
      onLoginSuccess(newUser);

    } else { // Login mode
      if (!email || !password) {
        setError('Por favor, preencha e-mail e senha.');
        return;
      }
      const user = getUserByEmail(email);
      if (!user || user.passwordHash !== simpleHash(password)) {
        setError('E-mail ou senha inválidos.');
        return;
      }
      onLoginSuccess(user);
    }
  };
  
  const title = mode === 'signup' ? 'Crie sua Conta' : 'Bem-vindo(a) de volta!';
  const subtitle = mode === 'signup' 
    ? 'Comece a buscar seu imóvel dos sonhos hoje.' 
    : 'Acesse sua conta para continuar sua busca.';

  return (
    <div className="h-full w-full flex items-center justify-center bg-brand-light p-4 relative">
      <div className="w-full max-w-sm mx-auto bg-white p-8 rounded-2xl shadow-lg animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-brand-primary text-white rounded-full flex items-center justify-center mb-4">
            <BotIcon />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">{title}</h1>
          <p className="text-gray-500 text-center">{subtitle}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            )}
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-secondary text-white font-bold py-3 px-4 rounded-md mt-6 hover:opacity-90 transition-opacity"
          >
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <button type="button" onClick={handleSwitchMode} className="font-bold text-brand-primary hover:underline ml-1">
            {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>

        {mode === 'login' && (
            <div className="mt-6 border-t pt-4 text-center">
                <p className="text-sm text-gray-500">Para demonstração, use:</p>
                <p className="text-sm text-gray-700 font-mono"><strong>Email:</strong> cliente@teste.com</p>
                <p className="text-sm text-gray-700 font-mono"><strong>Senha:</strong> 123</p>
            </div>
        )}

      </div>
       <button 
        onClick={onAdminClick}
        className="absolute top-4 right-4 flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors p-2 rounded-md bg-white/50 hover:bg-white"
        aria-label="Painel do Administrador"
      >
        <AdminIcon />
        <span className="text-sm font-medium hidden sm:inline">Admin</span>
      </button>
    </div>
  );
};