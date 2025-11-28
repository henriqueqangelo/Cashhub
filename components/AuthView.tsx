
import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { User } from '../types';
import { ChevronRight, Lock, Mail, User as UserIcon, Calendar, CreditCard, AlertCircle, ArrowLeft, Send } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'recovery';

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Recovery State
  const [recoveryInput, setRecoveryInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (authMode === 'register') {
      if (!name || !email || !password || !cpf || !birthDate) {
        setError("Por favor, preencha todos os campos.");
        return;
      }

      const result = storageService.registerUser({
        name,
        email,
        password,
        cpf,
        birthDate
      });

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }

    } else if (authMode === 'login') {
      if (!email || !password) {
        setError("Por favor, informe e-mail e senha.");
        return;
      }

      const result = storageService.loginUser(email, password);
      
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    } else if (authMode === 'recovery') {
        if (!recoveryInput) {
            setError("Por favor, informe seu e-mail ou telefone.");
            return;
        }

        const result = storageService.recoverPassword(recoveryInput);
        if (result.success) {
            setSuccessMsg(result.message);
            // Opcional: Voltar para login após alguns segundos ou limpar input
            setRecoveryInput('');
        } else {
            setError(result.message);
        }
    }
  };

  const handleModeChange = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col animate-fade-in">
        
        {/* Header / Logo Area */}
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 opacity-90"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg text-emerald-600">
                    {/* CashHub Logo (New Model: Dollar Icon) */}
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                        {/* Outer Circle (Coin) */}
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
                        
                        {/* Styled Dollar Sign */}
                        <path d="M12 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
                 <h1 className="text-3xl font-bold text-white tracking-tight">CashHub</h1>
                 <p className="text-emerald-100 mt-2 text-sm">Controle financeiro inteligente</p>
            </div>
        </div>

        {/* Form Area */}
        <div className="p-8">
            {authMode !== 'recovery' && (
                <div className="mb-6 flex justify-center">
                    <div className="bg-slate-100 p-1 rounded-xl inline-flex w-full">
                        <button 
                            onClick={() => handleModeChange('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                        >
                            Entrar
                        </button>
                        <button 
                            onClick={() => handleModeChange('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                        >
                            Cadastrar
                        </button>
                    </div>
                </div>
            )}

            {authMode === 'recovery' && (
                 <div className="mb-6">
                    <button 
                        onClick={() => handleModeChange('login')}
                        className="flex items-center gap-1 text-slate-400 hover:text-emerald-600 transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft size={16} /> Voltar ao Login
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">Recuperar Senha</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Informe seu e-mail ou telefone para receber o link de redefinição.
                    </p>
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs text-red-600 animate-pulse">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-xs text-emerald-700 animate-fade-in">
                    <Send size={14} />
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {authMode === 'register' && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Nome Completo</label>
                        <div className="relative">
                            <UserIcon size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                placeholder="João Silva"
                            />
                        </div>
                    </div>
                )}

                {(authMode === 'login' || authMode === 'register') && (
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">E-mail</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>
                )}

                {authMode === 'register' && (
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">CPF</label>
                            <div className="relative">
                                <CreditCard size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Nascimento</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
                                <input 
                                    type="date" 
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {(authMode === 'login' || authMode === 'register') && (
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">Senha</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        {authMode === 'login' && (
                            <div className="mt-2 text-right">
                                <button
                                    type="button" 
                                    onClick={() => handleModeChange('recovery')}
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {authMode === 'recovery' && (
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">E-mail ou Telefone</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                            <input 
                                type="text" 
                                value={recoveryInput}
                                onChange={(e) => setRecoveryInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                placeholder="ex: seu@email.com ou (11) 99999-9999"
                            />
                        </div>
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                    {authMode === 'register' ? 'Criar Conta' : authMode === 'login' ? 'Acessar Conta' : 'Enviar Link'}
                    {authMode !== 'recovery' && <ChevronRight size={18} />}
                </button>
            </form>
        </div>
        
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
                Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
        </div>

      </div>
    </div>
  );
};

export default AuthView;
