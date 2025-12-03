import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Save, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

export const EmailSettingsForm: React.FC = () => {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading || newEmail === user.email) return;
    
    setLoading(true);
    setMessage('');
    const toastId = showLoading('Enviando link de confirmação...');

    try {
        // Supabase sends a confirmation link to the new email address
        const { error } = await supabase.auth.updateUser({ email: newEmail });

        if (error) throw error;

        setMessage('Link de confirmação enviado para o novo e-mail. Verifique sua caixa de entrada para finalizar a alteração.');
        showSuccess('Confirmação enviada!');
    } catch (error) {
        showError('Falha ao atualizar e-mail. Tente novamente.');
        console.error(error);
    } finally {
        setLoading(false);
        dismissToast(toastId);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Alterar E-mail</h3>
        <form onSubmit={handleSave} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">E-mail Atual</label>
                <p className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-medium">{user?.email}</p>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Novo E-mail</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="email" 
                        required
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                        placeholder="novo@email.com"
                    />
                </div>
            </div>

            {message && (
                <div className="p-3 bg-blue-50 text-blue-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} /> {message}
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading || newEmail === user?.email || !newEmail}
                    className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Atualizar E-mail
                </button>
            </div>
        </form>
    </div>
  );
};