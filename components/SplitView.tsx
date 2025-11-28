
import React from 'react';
import { Users, User, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { SplitGroup } from '../types';

interface SplitViewProps {
  groups: SplitGroup[];
}

const SplitView: React.FC<SplitViewProps> = ({ groups }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gastos Divididos</h2>
          <p className="text-slate-500">Acompanhe quem deve quem em seus grupos.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-emerald-100 transition-colors">
            <Plus size={18} />
            Novo Grupo
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Decorative Header Background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <Users size={24} />
              </div>
              <div className="flex -space-x-2">
                {group.members.slice(0, 3).map((member, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500" title={member}>
                        {member[0]}
                    </div>
                ))}
                {group.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs text-slate-500">
                        +{group.members.length - 3}
                    </div>
                )}
              </div>
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-4">{group.name}</h3>

            <div className="space-y-3">
              {group.totalOwedToYou > 0 && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ArrowUpRight size={18} />
                    <span className="text-sm font-medium">Receber</span>
                  </div>
                  <span className="font-bold text-emerald-700">R$ {group.totalOwedToYou.toFixed(2)}</span>
                </div>
              )}
              
              {group.totalYouOwe > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-700">
                    <ArrowDownLeft size={18} />
                    <span className="text-sm font-medium">Pagar</span>
                  </div>
                  <span className="font-bold text-red-700">R$ {group.totalYouOwe.toFixed(2)}</span>
                </div>
              )}

              {group.totalOwedToYou === 0 && group.totalYouOwe === 0 && (
                  <div className="flex items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                      Tudo quitado!
                  </div>
              )}
            </div>
            
            <button className="w-full mt-6 py-2 text-sm font-medium text-slate-500 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-lg transition-all">
                Ver Detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SplitView;
