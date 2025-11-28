
import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Calendar, Tag, Search, Wallet, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transaction } from '../types';
import { parseTransactionNaturalLanguage, getFinancialAdvice } from '../services/geminiService';

interface TransactionsViewProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
}

const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onAddTransaction }) => {
  // Toggle State
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  
  // Form States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  
  // AI States
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [advice, setAdvice] = useState<string>('');

  const incomeCategories = ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Outros'];
  const expenseCategories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'];

  // Set default category when type changes
  useEffect(() => {
    setCategory(transactionType === 'expense' ? 'Alimentação' : 'Salário');
  }, [transactionType]);

  useEffect(() => {
    // Get initial advice
    getFinancialAdvice("Usuário está na tela de transações.").then(setAdvice);
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString().split('T')[0],
      type: transactionType,
      isAiGenerated: false,
    };

    onAddTransaction(newTransaction);
    setDescription('');
    setAmount('');
  };

  const handleAiSubmit = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    
    const result = await parseTransactionNaturalLanguage(aiInput);
    
    if (result) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        description: result.description,
        amount: result.amount,
        category: result.category,
        date: result.date,
        type: result.type,
        isAiGenerated: true,
      };
      onAddTransaction(newTransaction);
      setAiInput('');
      getFinancialAdvice(`${result.type === 'expense' ? 'Gastei' : 'Recebi'} ${result.amount} em ${result.category}`).then(setAdvice);
    }
    setIsAiLoading(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Transações</h2>
        <p className="text-slate-500">Registre suas receitas e controle suas despesas.</p>
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
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-400" size={20} />
              <h3 className="font-semibold text-lg">Entrada Inteligente</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Digite naturalmente. <br/>Ex: "Recebi 500 de frila" ou "Gastei 20 no almoço"
            </p>
            <div className="relative">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Descreva a transação..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 placeholder-slate-400 text-white focus:outline-none focus:bg-white/20 transition-all backdrop-blur-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
              />
              <button 
                onClick={handleAiSubmit}
                disabled={isAiLoading}
                className="absolute right-2 top-2 bg-emerald-500 text-white p-1.5 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {isAiLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Plus size={20} />}
              </button>
            </div>
          </div>

          {/* Manual Input Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            
            {/* Type Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button 
                    onClick={() => setTransactionType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${transactionType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ArrowDownCircle size={16} />
                    Despesa
                </button>
                <button 
                    onClick={() => setTransactionType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${transactionType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ArrowUpCircle size={16} />
                    Receita
                </button>
            </div>

            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Tag size={18} className="text-slate-400"/>
                Nova {transactionType === 'income' ? 'Receita' : 'Despesa'}
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
                  placeholder={transactionType === 'income' ? "Ex: Salário, Venda..." : "Ex: Supermercado, Aluguel..."}
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
                     {(transactionType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                     ))}
                   </select>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full text-white font-medium py-3 rounded-xl transition-colors shadow-lg mt-2 ${
                    transactionType === 'income' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                    : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                }`}
              >
                {transactionType === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Histórico de Transações</h3>
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
            {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Wallet size={48} className="mb-4 opacity-20" />
                    <p>Nenhuma transação registrada ainda.</p>
                </div>
            ) : (
                transactions.slice().reverse().map((t) => (
                <div key={t.id} className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            t.type === 'income' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : 'bg-red-100 text-red-600'
                        }`}>
                            {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">{t.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className={`font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {t.category}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    {t.date}
                                </span>
                                {t.isAiGenerated && (
                                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">IA</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
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

export default TransactionsView;
