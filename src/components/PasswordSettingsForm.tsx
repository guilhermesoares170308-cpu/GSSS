import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Save, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

export const PasswordSettingsForm: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
        setError('A nova senha deve ter no mínimo 6 caracteres.');
        return;
    }
    if (newPassword !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }
    
    setLoading(true);
    const toastId = showLoading('Atualizando senha...');

    try {
        // Supabase updates the password directly if the user is currently authenticated
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) throw error;

        showSuccess('Senha atualizada com sucesso!');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error) {
        showError('Falha ao atualizar senha. Tente novamente.');
        console.error(error);
    } finally {
        setLoading(false);
        dismissToast(toastId);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Alterar Senha</h3>
        <form onSubmit={handleSave} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nova Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                        placeholder="Mínimo 6 caracteres"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirme a Nova Senha</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                        placeholder="Confirme a senha"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading || !newPassword || !confirmPassword}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Atualizar Senha
                </button>
            </div>
        </form>
    </div>
  );
};