import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

export const Financial = () => {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' as number | string, date: format(new Date(), 'yyyy-MM-dd') });

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);

    try {
        // 1. Calcular Receita (Agendamentos Confirmados)
        const { data: appts, error: apptsError } = await supabase
            .from('appointments')
            .select('*, services(price)')
            .eq('user_id', user.id)
            .eq('status', 'confirmed');
        
        if (apptsError) throw apptsError;
        
        const totalRev = appts?.reduce((acc, curr: any) => acc + (curr.services?.price || 0), 0) || 0;
        setRevenue(totalRev);

        // 2. Buscar Despesas
        const { data: exp, error: expError } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
        
        if (expError) throw expError;
        
        setExpenses(exp || []);
        const totalExp = exp?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
        setTotalExpenses(totalExp);

    } catch (error) {
        console.error("Erro ao buscar dados financeiros:", error);
        showError("Não foi possível carregar os dados financeiros.");
    } finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amountValue = Number(newExpense.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
        showError("O valor da despesa deve ser um número positivo.");
        return;
    }

    const toastId = showLoading('Adicionando despesa...');

    try {
        const { error } = await supabase.from('expenses').insert({ user_id: user.id, ...newExpense, amount: amountValue });
        if (error) throw error;

        showSuccess('Despesa adicionada com sucesso!');
        setNewExpense({ description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd') });
        setIsAddingExpense(false);
        fetchData();
    } catch (error) {
        showError('Falha ao adicionar despesa.');
        console.error(error);
    } finally {
        dismissToast(toastId);
    }
  };

  const handleDeleteExpense = async (id: string) => {
      if(!confirm('Tem certeza que deseja excluir esta despesa?')) return;
      
      const toastId = showLoading('Excluindo despesa...');
      try {
          const { error } = await supabase.from('expenses').delete().eq('id', id);
          if (error) throw error;
          
          showSuccess('Despesa excluída.');
          fetchData();
      } catch (error) {
          showError('Falha ao excluir despesa.');
          console.error(error);
      } finally {
          dismissToast(toastId);
      }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Controle Financeiro</h2>
        <p className="text-gray-500">Visão geral do lucro, receitas e despesas do seu negócio.</p>
      </div>

      {loadingData ? (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-pink-600" size={32} />
        </div>
      ) : (
        <>
          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                    <span className="text-gray-500 font-medium">Receita Total</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
                <p className="text-xs text-gray-400 mt-1">Baseado em agendamentos confirmados</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown size={20} /></div>
                    <span className="text-gray-500 font-medium">Despesas</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-gray-400 mt-1">Gastos registrados manualmente</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 rounded-lg"><DollarSign size={20} /></div>
                    <span className="text-gray-300 font-medium">Lucro Líquido</span>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(revenue - totalExpenses)}</p>
                <p className="text-xs text-gray-400 mt-1">Receita - Despesas</p>
            </div>
          </div>

          {/* Seção de Despesas */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Registro de Despesas</h3>
                <button 
                    onClick={() => setIsAddingExpense(!isAddingExpense)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Nova Despesa
                </button>
            </div>

            {isAddingExpense && (
                <div className="p-6 bg-gray-50 border-b border-gray-100 animate-in fade-in">
                    <form onSubmit={handleAddExpense} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                            <input required type="text" className="w-full p-2 border rounded-lg" placeholder="Ex: Conta de Luz" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                        </div>
                        <div className="w-full md:w-32">
                            <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                            <input 
                              required 
                              type="number" 
                              step="0.01" 
                              className="w-full p-2 border rounded-lg" 
                              value={newExpense.amount} 
                              onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                            />
                        </div>
                        <div className="w-full md:w-40">
                            <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                            <input required type="date" className="w-full p-2 border rounded-lg" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
                        </div>
                        <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 w-full md:w-auto">Adicionar</button>
                    </form>
                </div>
            )}

            <div className="divide-y divide-gray-100">
                {expenses.map(exp => (
                    <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                        <div>
                            <p className="font-bold text-gray-900">{exp.description}</p>
                            <p className="text-xs text-gray-500">{format(parseISO(exp.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-red-600">- {formatCurrency(exp.amount)}</span>
                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
                {expenses.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Nenhuma despesa registrada.</div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};