
import React, { useState } from 'react';
import { Trophy, Target, Plane, Shield, Smartphone, Car, Home, Star, Plus, CheckCircle2, Award, Zap, ArrowRight } from 'lucide-react';
import { Goal, Challenge } from '../types';

interface GamificationViewProps {
  goals: Goal[];
  challenges: Challenge[];
  onUpdateGoal: (goal: Goal) => void;
  onUpdateChallenge: (challenge: Challenge) => void;
}

const GamificationView: React.FC<GamificationViewProps> = ({ goals, challenges, onUpdateGoal, onUpdateChallenge }) => {
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // State to manage input values for each goal individually
  const [depositValues, setDepositValues] = useState<{ [key: string]: string }>({});

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'phone': return <Smartphone size={24} />;
      case 'plane': return <Plane size={24} />;
      case 'shield': return <Shield size={24} />;
      case 'car': return <Car size={24} />;
      case 'home': return <Home size={24} />;
      default: return <Star size={24} />;
    }
  };

  const showNotification = (message: string) => {
    setNotification({ message, type: 'success' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeposit = (id: string) => {
    const amountStr = depositValues[id];
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    const updatedGoal = { ...goal, currentAmount: newAmount };
    
    // Call parent updater (Backend)
    onUpdateGoal(updatedGoal);

    // Reset input
    setDepositValues(prev => ({ ...prev, [id]: '' }));

    if (newAmount === goal.targetAmount && goal.currentAmount !== goal.targetAmount) {
      showNotification(`Você atingiu a meta ${goal.title} 🎉`);
    } else {
        showNotification(`R$ ${amount} adicionados para ${goal.title} 🚀`);
    }
  };

  const handleInputChange = (id: string, value: string) => {
      setDepositValues(prev => ({ ...prev, [id]: value }));
  };

  const calculatePercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* Motivational Toast Notification */}
      {notification && (
        <div className="fixed top-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-bounce-in border border-slate-700">
            <div className="bg-emerald-500 rounded-full p-1">
                <Award size={16} className="text-white" />
            </div>
            <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <header>
        <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-800">Metas & Conquistas</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                <Trophy size={12} /> Nível 3
            </span>
        </div>
        <p className="text-slate-500">Transforme suas economias em um jogo e conquiste seus objetivos</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Metas Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Target size={20} className="text-emerald-600" />
                Minhas Metas
             </h3>
             <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={16} /> Nova Meta
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const percent = calculatePercentage(goal.currentAmount, goal.targetAmount);
              const isComplete = percent === 100;
              const inputValue = depositValues[goal.id] || '';
              
              return (
                <div key={goal.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  {isComplete && (
                      <div className="absolute top-0 right-0 p-2">
                          <CheckCircle2 className="text-emerald-500" size={24} />
                      </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${goal.color} text-white shadow-sm`}>
                      {getIcon(goal.icon)}
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-bold text-slate-700">R$ {(goal.targetAmount - goal.currentAmount).toFixed(0)}</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 mb-4">{goal.title}</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-600">{percent}%</span>
                        <span className="text-slate-400">R$ {goal.targetAmount}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${percent}%` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-white/30 animate-pulse"></div>
                        </div>
                    </div>
                  </div>

                  {/* Custom Amount Input Section */}
                  <div className="mt-5 pt-4 border-t border-slate-50 flex gap-2">
                     <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold">R$</span>
                        <input 
                            type="number"
                            value={inputValue}
                            onChange={(e) => handleInputChange(goal.id, e.target.value)}
                            placeholder="Valor"
                            disabled={isComplete}
                            onKeyDown={(e) => e.key === 'Enter' && handleDeposit(goal.id)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                        />
                     </div>
                     <button 
                        onClick={() => handleDeposit(goal.id)}
                        disabled={isComplete || !inputValue}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
                        title="Adicionar valor"
                     >
                        <Plus size={18} />
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desafios Semanais Section */}
        <div className="space-y-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" />
                Desafios da Semana
             </h3>

             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                    <h4 className="font-bold text-lg mb-4">Status Atual</h4>
                    <div className="flex items-end gap-2 mb-1">
                        <span className="text-4xl font-bold text-emerald-400">{challenges.filter(c => c.isCompleted).length}/{challenges.length}</span>
                        <span className="text-slate-400 mb-1">completos</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-6">Complete todos para ganhar o selo "Poupador Elite"</p>
                    
                    <div className="space-y-4">
                        {challenges.map((challenge) => (
                            <div key={challenge.id} className="bg-white/10 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center border ${challenge.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                                        {challenge.isCompleted && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className={`text-sm font-medium ${challenge.isCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                                            {challenge.title}
                                        </h5>
                                        <p className="text-xs text-slate-400 mt-1">{challenge.description}</p>
                                        
                                        {!challenge.isCompleted && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                                    <span>Progresso</span>
                                                    <span>{challenge.progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${challenge.progress}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {challenge.isCompleted && (
                                            <span className="inline-block mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
                                                {challenge.reward}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
             
             <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-sm text-emerald-800 font-medium text-center">
                    "Pequenos progressos diários somam grandes resultados"
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationView;
