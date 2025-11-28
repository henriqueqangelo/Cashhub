
import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Calendar, Tag, DollarSign, Search, Wallet } from 'lucide-react';
import { Expense } from '../types';
import { parseTransactionNaturalLanguage, getFinancialAdvice } from '../services/geminiService';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, onAddExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [advice, setAdvice] = useState<string>('');

  useEffect(() => {
    // Get initial advice on mount
    getFinancialAdvice("Usuário está na tela de despesas.").then(setAdvice);
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      isAiGenerated: false,
    };

    onAddExpense(newExpense);
    setDescription('');
    setAmount('');
  };

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    
    const result = await parseTransactionNaturalLanguage(aiInput);
    
    if (result) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        description: result.description,
        amount: result.amount,
        category: result.category,
        date: result.date,
        type: result.type,
        isAiGenerated: true,
      };
      onAddExpense(newExpense);
      setAiInput('');
      getFinancialAdvice(`Gastei ${result.amount} em ${result.category}`).then(setAdvice);
    }
    setIsAiLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Anotar Despesas</h2>
        <p className="text-slate-500">Gerencie seus gastos diários de forma simples.</p>
        {advice && (
             <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2 text-sm text-emerald-800">
                <Sparkles size={16} className="mt-0.5 text-emerald-500" />
                <span>{advice}</span>
             </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Forms */}
        <div className="space-y-6 lg:col-span-1">
            
          {/* AI Input Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-100" size={20} />
              <h3 className="font-semibold text-lg">Entrada Inteligente</h3>
            </div>
            <p className="text-emerald-50 text-sm mb-4">
              Digite como se estivesse conversando. <br/>Ex: "Almoço de R$ 45 hoje"
            </p>
            <div className="relative">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Descreva seu gasto..."
                className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 placeholder-emerald-100 text-white focus:outline-none focus:bg-white/30 transition-all backdrop-blur-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
              />
              <button 
                onClick={handleAiSubmit}
                disabled={isAiLoading}
                className="absolute right-2 top-2 bg-white text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div> : <Plus size={20} />}
              </button>
            </div>
          </div>

          {/* Manual Input Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-slate-400"/>
                Entrada Manual
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Descrição</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Ex: Supermercado"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Categoria</label>
                   <select 
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                   >
                     <option>Alimentação</option>
                     <option>Transporte</option>
                     <option>Moradia</option>
                     <option>Lazer</option>
                     <option>Saúde</option>
                     <option>Outros</option>
                   </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 mt-2"
              >
                Adicionar Despesa
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Transações Recentes</h3>
            <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-600"
                />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {expenses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Wallet size={48} className="mb-4 opacity-20" />
                    <p>Nenhuma despesa registrada ainda.</p>
                </div>
            ) : (
                expenses.slice().reverse().map((expense) => (
                <div key={expense.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        expense.category === 'Alimentação' ? 'bg-orange-100 text-orange-600' :
                        expense.category === 'Transporte' ? 'bg-blue-100 text-blue-600' :
                        expense.category === 'Moradia' ? 'bg-purple-100 text-purple-600' :
                        'bg-emerald-100 text-emerald-600'
                    }`}>
                        <Tag size={18} />
                    </div>
                    <div>
                        <p className="font-medium text-slate-800">{expense.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{expense.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {expense.date}
                            </span>
                            {expense.isAiGenerated && (
                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">IA</span>
                            )}
                        </div>
                    </div>
                    </div>
                    <span className="font-semibold text-slate-800">
                    - R$ {expense.amount.toFixed(2)}
                    </span>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesView;
