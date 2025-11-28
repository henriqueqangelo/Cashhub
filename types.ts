
export enum ViewState {
  TRANSACTIONS = 'transactions',
  SPLIT = 'split',
  CHARTS = 'charts',
  GAMIFICATION = 'gamification',
  CHAT = 'chat'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Em um app real, isso seria um hash
  cpf: string;
  birthDate: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  isAiGenerated?: boolean;
}

// Alias para manter compatibilidade em refatorações parciais
export type Expense = Transaction; 

export interface SplitGroup {
  id: string;
  name: string;
  totalOwedToYou: number;
  totalYouOwe: number;
  members: string[];
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: 'phone' | 'plane' | 'shield' | 'car' | 'home' | 'star';
  color: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 to 100
  target: string;
  isCompleted: boolean;
  reward: string;
}

export interface AiForecast {
  predictedTotalNextMonth: number;
  riskLevel: 'Baixo' | 'Médio' | 'Alto';
  alerts: {
    title: string;
    message: string;
    severity: 'warning' | 'critical' | 'info';
  }[];
  suggestions: string[];
}

export interface ChatWidgetData {
  type: 'stat' | 'alert' | 'saving_tip';
  title: string;
  value?: string;
  description: string;
  color?: 'emerald' | 'red' | 'blue' | 'amber';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  widget?: ChatWidgetData;
}
