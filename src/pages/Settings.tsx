import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { User, Save, Loader2 } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({ name: '', business_name: '' });

  useEffect(() => {
    if (user) {
        supabase.from('profiles').select('name').eq('id', user.id).single()
        .then(({ data }) => {
            if (data) setProfile({ name: data.name, business_name: '' }); // business_name seria um campo novo se quiséssemos adicionar
        });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const { error } = await supabase.from('profiles').update({
        name: profile.name,
        updated_at: new Date().toISOString()
    }).eq('id', user.id);

    setLoading(false);
    if (!error) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-500">Gerencie seus dados pessoais e da conta.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome Profissional</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        value={profile.name}
                        onChange={e => setProfile({...profile, name: e.target.value})}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">Este é o nome que aparecerá para seus clientes no link de agendamento.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                {success && <span className="text-green-600 font-bold text-sm animate-pulse">Alterações salvas com sucesso!</span>}
                {!success && <span></span>}
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Salvar Alterações
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
