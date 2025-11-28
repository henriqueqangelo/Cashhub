
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TransactionsView from './components/TransactionsView';
import SplitView from './components/SplitView';
import ChartsView from './components/ChartsView';
import GamificationView from './components/GamificationView';
import ChatView from './components/ChatView';
import AuthView from './components/AuthView';
import { ViewState, Transaction, Goal, Challenge, SplitGroup, User } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);

  // View State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.TRANSACTIONS);
  
  // Global Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);

  // Initialize Logic
  useEffect(() => {
    // Check for existing session
    const currentUser = storageService.getCurrentUser();
    setUser(currentUser);

    // Load data
    setTransactions(storageService.getTransactions());
    setGoals(storageService.getGoals());
    setChallenges(storageService.getChallenges());
    setSplitGroups(storageService.getSplitGroups());
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    storageService.logoutUser();
    setUser(null);
  };

  const handleAddTransaction = (transaction: Transaction) => {
    const updatedTransactions = storageService.addTransaction(transaction);
    setTransactions(updatedTransactions);
  };

  const handleUpdateGoal = (goal: Goal) => {
    const updatedGoals = storageService.updateGoal(goal);
    setGoals(updatedGoals);
  };

  const handleUpdateChallenge = (challenge: Challenge) => {
    const updatedChallenges = storageService.updateChallenge(challenge);
    setChallenges(updatedChallenges);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.TRANSACTIONS:
        return <TransactionsView transactions={transactions} onAddTransaction={handleAddTransaction} />;
      case ViewState.SPLIT:
        return <SplitView groups={splitGroups} />;
      case ViewState.CHARTS:
        return <ChartsView expenses={transactions} />;
      case ViewState.GAMIFICATION:
        return (
          <GamificationView 
            goals={goals} 
            challenges={challenges}
            onUpdateGoal={handleUpdateGoal}
            onUpdateChallenge={handleUpdateChallenge}
          />
        );
      case ViewState.CHAT:
        return <ChatView expenses={transactions} />;
      default:
        return <TransactionsView transactions={transactions} onAddTransaction={handleAddTransaction} />;
    }
  };

  // If no user is logged in, show AuthView
  if (!user) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 ml-64 min-h-screen">
        <div className="py-8 px-4">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
