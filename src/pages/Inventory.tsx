import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  min_threshold: number;
};

export const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' as number | string, unit: 'un', min_threshold: 5 });

  const fetchInventory = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').eq('user_id', user.id).order('name');
    if (error) {
        showError('Falha ao carregar estoque.');
        console.error(error);
    }
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.name) return;
    
    const quantityValue = Number(newItem.quantity);
    if (isNaN(quantityValue) || quantityValue < 0) {
        showError("A quantidade deve ser um número válido e não negativo.");
        return;
    }

    const toastId = showLoading('Adicionando item...');

    try {
        const { error } = await supabase.from('inventory').insert({ user_id: user.id, ...newItem, quantity: quantityValue });
        if (error) throw error;
        
        showSuccess('Item adicionado ao estoque!');
        fetchInventory();
        setIsAdding(false);
        setNewItem({ name: '', quantity: '', unit: 'un', min_threshold: 5 });
    } catch (error) {
        showError('Falha ao adicionar item.');
        console.error(error);
    } finally {
        dismissToast(toastId);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Tem certeza que deseja excluir este item?')) return;
    
    const toastId = showLoading('Excluindo item...');
    try {
        await supabase.from('inventory').delete().eq('id', id);
        showSuccess('Item excluído do estoque.');
        fetchInventory();
    } catch (error) {
        showError('Falha ao excluir item.');
        console.error(error);
    } finally {
        dismissToast(toastId);
    }
  };

  const updateQuantity = async (id: string, current: number, change: number) => {
    const newQty = Math.max(0, current + change);
    
    // Se a quantidade não mudou, não faz nada
    if (newQty === current) return;

    try {
        await supabase.from('inventory').update({ quantity: newQty }).eq('id', id);
        // Atualiza o estado localmente para feedback rápido, mas refetch para garantir consistência
        setItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    } catch (error) {
        showError('Falha ao atualizar quantidade.');
        console.error(error);
        fetchInventory(); // Refetch em caso de erro
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Controle de Estoque</h2>
          <p className="text-gray-500">Gerencie seus materiais e receba alertas de reposição.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} /> Novo Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
              <input required type="text" className="w-full p-2 border rounded-lg" placeholder="Ex: Esmalte Vermelho" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Inicial</label>
              <input 
                required 
                type="number" 
                min="0"
                className="w-full p-2 border rounded-lg" 
                value={newItem.quantity} 
                onChange={e => setNewItem({...newItem, quantity: e.target.value})} 
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select className="w-full p-2 border rounded-lg" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
                <option value="un">Unidade (un)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="cx">Caixa (cx)</option>
                <option value="par">Par</option>
              </select>
            </div>
            <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo de Alerta</label>
                <input 
                    required 
                    type="number" 
                    min="0"
                    className="w-full p-2 border rounded-lg" 
                    value={newItem.min_threshold} 
                    onChange={e => setNewItem({...newItem, min_threshold: Number(e.target.value)})} 
                />
            </div>
            <div className="md:col-span-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-lg">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-pink-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.quantity <= item.min_threshold ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Mínimo ideal: {item.min_threshold} {item.unit}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                  {item.quantity <= item.min_threshold && (
                      <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                          <AlertTriangle size={12} /> Repor
                      </div>
                  )}
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity, -1)} disabled={item.quantity <= 0} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-100 font-bold disabled:opacity-50">-</button>
                      <span className="font-bold w-12 text-center">{item.quantity} <span className="text-xs font-normal text-gray-500">{item.unit}</span></span>
                      <button onClick={() => updateQuantity(item.id, item.quantity, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-100 font-bold">+</button>
                  </div>

                  <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Package className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500">Seu estoque está vazio.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};