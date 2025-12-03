import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Save, Loader2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

export const ProfileSettingsForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (user) {
        setLoading(true);
        // 1. Fetch name from profiles table
        supabase.from('profiles').select('name').eq('id', user.id).single()
        .then(({ data }) => {
            if (data) setProfileName(data.name || '');
            setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;
    setLoading(true);
    
    const toastId = showLoading('Salvando perfil...');

    try {
        // 1. Update the profiles table
        const { error: profileError } = await supabase.from('profiles').update({
            name: profileName,
            updated_at: new Date().toISOString()
        }).eq('id', user.id);

        if (profileError) throw profileError;

        // 2. Update user metadata (used by AuthContext)
        const { error: authError } = await supabase.auth.updateUser({
            data: { name: profileName }
        });

        if (authError) throw authError;

        showSuccess('Nome profissional atualizado com sucesso!');
    } catch (error) {
        showError('Falha ao salvar o nome.');
        console.error(error);
    } finally {
        setLoading(false);
        dismissToast(toastId);
    }
  };

  if (loading && !user) {
    return <div className="p-4 text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Informações do Perfil</h3>
        <form onSubmit={handleSave} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome Profissional</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        required
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">Este é o nome que aparecerá para seus clientes no link de agendamento.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Salvar Nome
                </button>
            </div>
        </form>
    </div>
  );
};