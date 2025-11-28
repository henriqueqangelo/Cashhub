
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, TrendingUp, AlertCircle, PiggyBank } from 'lucide-react';
import { Transaction, ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface ChatViewProps {
  expenses: Transaction[]; // Generic name kept for props, but treats as transactions
}

const ChatView: React.FC<ChatViewProps> = ({ expenses: transactions }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Olá, João! Sou seu assistente financeiro. Como posso te ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendChatMessage(text, transactions);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: response.text,
      widget: response.widget,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const suggestions = [
    "Quanto gastei em Alimentação este mês?",
    "Quanto recebi este mês?",
    "Por que meu gasto aumentou?",
    "Qual meu saldo atual?"
  ];

  const renderWidget = (widget: NonNullable<ChatMessage['widget']>) => {
    const bgColor = 
      widget.color === 'red' ? 'bg-red-50 border-red-100 text-red-700' :
      widget.color === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-700' :
      widget.color === 'amber' ? 'bg-amber-50 border-amber-100 text-amber-700' :
      'bg-emerald-50 border-emerald-100 text-emerald-700';

    const Icon = 
      widget.type === 'alert' ? AlertCircle :
      widget.type === 'saving_tip' ? PiggyBank :
      TrendingUp;

    return (
      <div className={`mt-3 p-4 rounded-xl border ${bgColor} flex flex-col gap-1 max-w-sm`}>
        <div className="flex items-center gap-2 font-semibold">
          <Icon size={18} />
          <span>{widget.title}</span>
        </div>
        {widget.value && <span className="text-2xl font-bold my-1">{widget.value}</span>}
        <span className="text-sm opacity-90">{widget.description}</span>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto h-screen flex flex-col animate-fade-in">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bot className="text-emerald-500" />
          Assistente Financeiro
        </h2>
        <p className="text-slate-500">Tire dúvidas sobre suas receitas e despesas.</p>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden mb-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'
              }`}>
                {msg.sender === 'user' ? <User size={20} className="text-slate-500" /> : <Sparkles size={20} />}
              </div>
              
              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                
                {msg.widget && renderWidget(msg.widget)}
                
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                 <Sparkles size={20} className="text-emerald-600" />
               </div>
               <div className="bg-slate-100 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
           {messages.length === 1 && (
             <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
               {suggestions.map((s, i) => (
                 <button 
                   key={i}
                   onClick={() => handleSend(s)}
                   className="whitespace-nowrap px-4 py-2 bg-white border border-emerald-100 text-emerald-700 text-xs font-medium rounded-full hover:bg-emerald-50 transition-colors shadow-sm"
                 >
                   {s}
                 </button>
               ))}
             </div>
           )}
           
           <div className="relative flex items-center">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="Pergunte sobre suas finanças..."
               className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
             />
             <button 
               onClick={() => handleSend()}
               disabled={!input.trim() || isLoading}
               className="absolute right-2 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <Send size={18} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
