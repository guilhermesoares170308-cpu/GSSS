import React, { useState } from 'react';
import { useNailify } from '../context/NailifyContext';
import { formatCurrency } from '../lib/utils';
import { Plus, Trash2, Clock, Loader2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

export const Services = () => {
  const { services, addService, removeService, isLoading: isNailifyLoading } = useNailify();
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '' as number | string
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = Number(newService.price);
    if (isNaN(priceValue) || priceValue < 0) {
        showError("O preço deve ser um valor numérico positivo.");
        return;
    }
    if (newService.duration <= 0) {
        showError("A duração deve ser maior que zero.");
        return;
    }

    setIsSubmitting(true);
    const toastId = showLoading('Adicionando serviço...');

    try {
        await addService({
            ...newService,
            price: priceValue // Garante que o preço seja um número ao salvar
        } as any);
        
        showSuccess('Serviço adicionado com sucesso!');
        setIsAdding(false);
        setNewService({ name: '', description: '', duration: 30, price: '' });
    } catch (error) {
        console.error(error);
        
        let errorMessage = 'Falha ao adicionar serviço. Verifique se você está logado e tente novamente.';
        
        // Tentativa de extrair a mensagem de erro do Supabase
        if (error && typeof error === 'object' && 'message' in error) {
            errorMessage = error.message;
        }
            
        showError(errorMessage);
    } finally {
        setIsSubmitting(false);
        dismissToast(toastId);
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('Tem certeza que deseja excluir este serviço? Todos os agendamentos relacionados serão afetados.')) return;
      
      const toastId = showLoading('Excluindo serviço...');
      try {
          await removeService(id);
          showSuccess('Serviço excluído.');
      } catch (error) {
          showError('Falha ao excluir serviço.');
          console.error(error);
      } finally {
          dismissToast(toastId);
      }
  };

  const availableDurations = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 240];

  if (isNailifyLoading) {
    return (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-pink-600" size={32} />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Serviços</h2>
          <p className="text-gray-500">Configure os serviços que seus clientes podem agendar.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-full sm:w-auto bg-pink-600 text-white px-4 py-3 rounded-xl hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-pink-200"
        >
          <Plus size={20} /> Novo Serviço
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pink-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                  placeholder="Ex: Manicure Completa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                <input 
                  required
                  type="number" 
                  step="0.01" // Permite valores decimais
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  value={newService.price}
                  onChange={e => setNewService({...newService, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  value={newService.duration}
                  onChange={e => setNewService({...newService, duration: Number(e.target.value)})}
                >
                  {availableDurations.map(m => (
                    <option key={m} value={m}>{m} minutos</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Usado para cálculo automático de slots.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  value={newService.description}
                  onChange={e => setNewService({...newService, description: e.target.value})}
                  placeholder="Breve descrição do procedimento"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button 
                type="submit" 
                disabled={isSubmitting || isNailifyLoading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Salvar Serviço'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between hover:border-pink-300 transition-colors">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
              <p className="text-gray-500 text-sm">{service.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm font-medium">
                <span className="text-pink-600 flex items-center gap-1"><Clock size={16}/> {service.duration} min</span>
                <span className="text-green-600">{formatCurrency(service.price)}</span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(service.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover serviço"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhum serviço cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};