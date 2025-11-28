
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Transaction, CategoryData, MonthlyData, AiForecast } from '../types';
import { TrendingUp, ArrowUp, ArrowDown, Sparkles, AlertTriangle, Lightbulb, AlertCircle, Wallet } from 'lucide-react';
import { generateFinancialForecast } from '../services/geminiService';

interface ChartsViewProps {
  expenses: Transaction[]; // Named expenses for prop compatibility, but acts as transactions list
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

const ChartsView: React.FC<ChartsViewProps> = ({ expenses: transactions }) => {
  const [forecast, setForecast] = useState<AiForecast | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  
  // Filter for calculations
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const incomeTransactions = transactions.filter(t => t.type === 'income');

  // Aggregate data for Pie Chart (Expenses only)
  const categoryData: CategoryData[] = expenseTransactions.reduce((acc: CategoryData[], curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount, color: '' });
    }
    return acc;
  }, []).map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }));

  // Aggregate data for Bar Chart (Mock data logic simplified for demo)
  const monthlyData: MonthlyData[] = [
    { name: 'Jan', income: 4500, expense: 3200 },
    { name: 'Fev', income: 4600, expense: 3900 },
    { name: 'Mar', income: 4500, expense: 3400 },
    { name: 'Abr', income: 5200, expense: 4100 },
    { name: 'Mai', income: 4500, expense: 3800 },
    { name: 'Jun', income: 4800, expense: 3400 },
  ];

  const totalSpent = expenseTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalSpent;

  const handleGenerateForecast = async () => {
    setIsLoadingForecast(true);
    const data = await generateFinancialForecast(transactions);
    setForecast(data);
    setIsLoadingForecast(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Análise Financeira</h2>
          <p className="text-slate-500">Visualização de receitas, despesas e previsões.</p>
        </div>
        <button 
            onClick={handleGenerateForecast}
            disabled={isLoadingForecast}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all disabled:opacity-70"
        >
            {isLoadingForecast ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <Sparkles size={18} className="text-indigo-100" />
            )}
            {isLoadingForecast ? 'Analisando...' : 'Gerar Previsão IA'}
        </button>
      </header>
      
      {/* AI Forecast Section */}
      {forecast && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
             {/* Prediction Card */}
             <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-indigo-100">
                        <TrendingUp size={20} />
                        <h3 className="font-semibold">Previsão Gastos Próx. Mês</h3>
                    </div>
                    <p className="text-4xl font-bold mb-2">R$ {forecast.predictedTotalNextMonth.toFixed(2)}</p>
                    <div className="flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                        <span>Risco: {forecast.riskLevel}</span>
                    </div>
                </div>
             </div>

             {/* Alerts Card */}
             <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-500" />
                    Alertas Inteligentes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {forecast.alerts.map((alert, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 ${
                            alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 
                            alert.severity === 'warning' ? 'bg-amber-50 border-amber-100' : 
                            'bg-blue-50 border-blue-100'
                        }`}>
                            <AlertCircle size={18} className={`mt-0.5 ${
                                alert.severity === 'critical' ? 'text-red-500' : 
                                alert.severity === 'warning' ? 'text-amber-500' : 
                                'text-blue-500'
                            }`} />
                            <div>
                                <h4 className={`font-semibold text-sm ${
                                    alert.severity === 'critical' ? 'text-red-700' : 
                                    alert.severity === 'warning' ? 'text-amber-700' : 
                                    'text-blue-700'
                                }`}>{alert.title}</h4>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Suggestions Card */}
             <div className="md:col-span-3 bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
                 <h3 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-emerald-600" />
                    Sugestões de Economia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {forecast.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {idx + 1}
                            </div>
                            <p className="text-sm text-emerald-900 leading-relaxed">{suggestion}</p>
                        </div>
                    ))}
                </div>
             </div>
          </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                    <ArrowUp size={20} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Receitas</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">R$ {totalIncome.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <ArrowDown size={20} />
                </div>
                <span className="text-sm font-medium text-slate-500">Total Despesas</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">R$ {totalSpent.toFixed(2)}</p>
        </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Wallet size={20} />
                </div>
                <span className="text-sm font-medium text-slate-500">Saldo Atual</span>
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                R$ {balance.toFixed(2)}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Fluxo de Caixa (Semestral)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Despesas por Categoria</h3>
          <div className="flex flex-col items-center">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        formatter={(value) => <span className="text-slate-600 text-sm ml-1 mr-3">{value}</span>}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400">
                    Sem despesas registradas
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;
