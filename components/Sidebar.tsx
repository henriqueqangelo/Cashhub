
import React from 'react';
import { Wallet, Users, PieChart, LogOut, Trophy, MessageSquareText } from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, user, onLogout }) => {
  
  const navItems = [
    { id: ViewState.TRANSACTIONS, label: 'Transações', icon: Wallet },
    { id: ViewState.SPLIT, label: 'Gastos Divididos', icon: Users },
    { id: ViewState.CHARTS, label: 'Gráficos', icon: PieChart },
    { id: ViewState.GAMIFICATION, label: 'Metas & Desafios', icon: Trophy },
    { id: ViewState.CHAT, label: 'Assistente IA', icon: MessageSquareText },
  ];

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-100 flex flex-col shadow-sm z-20 transition-all duration-300">
      <div className="p-6 flex items-center gap-4">
        {/* CashHub Logo (New Model: Dollar Icon) */}
        <div className="relative w-12 h-12 flex-shrink-0 text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Outer Circle (Coin) */}
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
            
            {/* Styled Dollar Sign */}
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="flex flex-col justify-center -space-y-1">
          <span className="text-2xl font-extrabold text-emerald-600 tracking-tight leading-none">CASH</span>
          <span className="text-2xl font-extrabold text-emerald-600 tracking-tight leading-none">HUB</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-500'}`} 
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-700 font-bold text-sm">
                {user ? getInitials(user.name) : '??'}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Visitante'}</p>
                <p className="text-xs text-slate-500 truncate" title={user?.email}>{user?.email || 'Login necessário'}</p>
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
        >
            <LogOut size={18} />
            Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
