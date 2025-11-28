
import { Transaction, Goal, Challenge, SplitGroup, User } from '../types';

const KEYS = {
  TRANSACTIONS: 'cashhub_transactions',
  GOALS: 'cashhub_goals',
  CHALLENGES: 'cashhub_challenges_v3',
  SPLIT_GROUPS: 'cashhub_split_groups',
  USERS: 'cashhub_users_db', // Simula tabela de usuários
  CURRENT_USER: 'cashhub_current_session' // Sessão ativa
};

// Seed Data (Dados Iniciais do App para novos usuários)
const SEED_DATA = {
  transactions: [
    { id: '1', description: 'Salário Mensal', amount: 4500.00, category: 'Salário', date: '2023-10-05', type: 'income', isAiGenerated: false },
    { id: '2', description: 'Supermercado Mensal', amount: 850.50, category: 'Alimentação', date: '2023-10-15', type: 'expense', isAiGenerated: false },
    { id: '3', description: 'Uber para Aeroporto', amount: 45.90, category: 'Transporte', date: '2023-10-18', type: 'expense', isAiGenerated: false },
    { id: '4', description: 'Freelance Design', amount: 800.00, category: 'Freelance', date: '2023-10-19', type: 'income', isAiGenerated: false },
    { id: '5', description: 'Cinema com amigos', amount: 120.00, category: 'Lazer', date: '2023-10-20', type: 'expense', isAiGenerated: false },
  ] as Transaction[],
  goals: [
    {
        id: '1',
        title: 'iPhone 15',
        targetAmount: 5000,
        currentAmount: 3250,
        deadline: '25/12/2024',
        icon: 'phone',
        color: 'bg-indigo-500'
    },
    {
        id: '2',
        title: 'Viagem Europa',
        targetAmount: 15000,
        currentAmount: 2100,
        deadline: '10/07/2025',
        icon: 'plane',
        color: 'bg-sky-500'
    },
    {
        id: '3',
        title: 'Reserva de Emergência',
        targetAmount: 10000,
        currentAmount: 8500,
        deadline: 'Indefinido',
        icon: 'shield',
        color: 'bg-emerald-500'
    }
  ] as Goal[],
  challenges: [
      {
          id: '1',
          title: 'Delivery Detox',
          description: 'Gaste R$100 a menos em delivery esta semana',
          progress: 80,
          target: 'R$ 100 economizados',
          isCompleted: false,
          reward: '+50 pts'
      },
      {
          id: '2',
          title: 'Mestre da Poupança',
          description: 'Economize 5% a mais que a semana passada',
          progress: 100,
          target: '5%',
          isCompleted: true,
          reward: '+100 pts'
      },
      {
          id: '3',
          title: 'Sem Café na Rua',
          description: 'Evite pequenas compras de café por 3 dias',
          progress: 100,
          target: '3 dias',
          isCompleted: true,
          reward: '+30 pts'
      }
  ] as Challenge[],
  splitGroups: [
    {
      id: '1',
      name: 'Viagem Florianópolis',
      totalOwedToYou: 450.00,
      totalYouOwe: 0,
      members: ['Alice', 'Bob', 'Você']
    },
    {
      id: '2',
      name: 'Churrasco Domingo',
      totalOwedToYou: 0,
      totalYouOwe: 120.50,
      members: ['Carlos', 'Diana', 'Edu', 'Você']
    },
    {
        id: '3',
        name: 'Apartamento 302',
        totalOwedToYou: 1200.00,
        totalYouOwe: 50.00,
        members: ['Felipe', 'Você']
      }
  ] as SplitGroup[]
};

// Helper genérico para buscar dados
const getFromStorage = <T>(key: string, seed: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
};

export const storageService = {
  // --- USER AUTHENTICATION & DATABASE ---
  
  // Retorna todos os usuários cadastrados
  getUsers: (): User[] => getFromStorage(KEYS.USERS, []),
  
  // Registra novo usuário
  registerUser: (userData: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
    const users = getFromStorage<User[]>(KEYS.USERS, []);
    
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    
    // Check if CPF already exists
    if (users.find(u => u.cpf === userData.cpf)) {
        return { success: false, message: 'Este CPF já está cadastrado.' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...userData
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(KEYS.USERS, JSON.stringify(updatedUsers));
    
    // Auto-login after register
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    return { success: true, message: 'Conta criada com sucesso!', user: newUser };
  },

  // Login de usuário
  loginUser: (email: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = getFromStorage<User[]>(KEYS.USERS, []);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      return { success: true, message: 'Login realizado com sucesso!', user };
    }
    
    return { success: false, message: 'E-mail ou senha incorretos.' };
  },

  // Recuperar senha (Simulação)
  recoverPassword: (identifier: string): { success: boolean; message: string } => {
    const users = getFromStorage<User[]>(KEYS.USERS, []);
    // Verifica se existe algum usuário com esse email ou se o identificador parece um telefone (mock)
    const user = users.find(u => u.email === identifier);

    if (user) {
        return { success: true, message: `Um link de recuperação foi enviado para ${identifier}.` };
    } else {
        // Por segurança, muitas vezes não se avisa se o email não existe, mas para o app demo, avisaremos
        // Se o input for numérico (simulando telefone), aceitamos como mock
        const isPhone = /^\d+$/.test(identifier.replace(/\D/g, ''));
        if (isPhone && identifier.length > 8) {
             return { success: true, message: `Um SMS de recuperação foi enviado para ${identifier}.` };
        }
        
        return { success: false, message: 'Usuário não encontrado.' };
    }
  },

  logoutUser: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  // --- APP DATA (Per User Data could be implemented by suffixing keys with user ID) ---

  // Transactions
  getTransactions: (): Transaction[] => getFromStorage(KEYS.TRANSACTIONS, SEED_DATA.transactions),
  addTransaction: (transaction: Transaction): Transaction[] => {
    const list = getFromStorage(KEYS.TRANSACTIONS, SEED_DATA.transactions);
    const newList = [...list, transaction];
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(newList));
    return newList;
  },

  // Goals
  getGoals: (): Goal[] => getFromStorage(KEYS.GOALS, SEED_DATA.goals),
  updateGoal: (updatedGoal: Goal): Goal[] => {
    const goals = getFromStorage(KEYS.GOALS, SEED_DATA.goals);
    const newGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    localStorage.setItem(KEYS.GOALS, JSON.stringify(newGoals));
    return newGoals;
  },
  addGoal: (goal: Goal): Goal[] => {
    const goals = getFromStorage(KEYS.GOALS, SEED_DATA.goals);
    const newGoals = [...goals, goal];
    localStorage.setItem(KEYS.GOALS, JSON.stringify(newGoals));
    return newGoals;
  },

  // Challenges
  getChallenges: (): Challenge[] => getFromStorage(KEYS.CHALLENGES, SEED_DATA.challenges),
  updateChallenge: (updatedChallenge: Challenge): Challenge[] => {
    const challenges = getFromStorage(KEYS.CHALLENGES, SEED_DATA.challenges);
    const newChallenges = challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c);
    localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(newChallenges));
    return newChallenges;
  },

  // Split Groups
  getSplitGroups: (): SplitGroup[] => getFromStorage(KEYS.SPLIT_GROUPS, SEED_DATA.splitGroups),
  
  // Reset
  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  }
};
