import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthRedirectHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const type = searchParams.get('type');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redireciona usuários logados
  useEffect(() => {
    if (user && type !== 'recovery') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, type]);

  // Lida com a confirmação de e-mail (geralmente o Supabase lida com isso automaticamente)
  useEffect(() => {
    if (type === 'signup') {
      setMessage('Seu e-mail foi confirmado com sucesso! Você pode fazer login agora.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [type, navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    
    // O Supabase usa o token da URL para identificar o usuário e permitir a atualização
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      console.error(updateError);
      setError('Falha ao redefinir a senha. O link pode ter expirado.');
    } else {
      setMessage('Senha redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  };

  // --- Renderização da Redefinição de Senha ---
  if (type === 'recovery') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div className="text-center">
            <Lock size={32} className="text-pink-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Nova Senha</h2>
            <p className="text-gray-500 mt-2">Defina uma nova senha para sua conta.</p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirme a Nova Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle size={18} /> {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition-all disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Redefinir Senha'}
            </button>
          </form>
          
          <div className="text-center pt-4 border-t border-gray-100">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-pink-600 flex items-center mx-auto gap-1">
                <ArrowLeft size={16} /> Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Renderização de Mensagens de Status (Confirmação de E-mail, etc.) ---
  if (message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-8 space-y-4">
          <CheckCircle size={48} className="text-green-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">{message}</h2>
          <p className="text-sm text-gray-500">Você será redirecionado em breve.</p>
        </div>
      </div>
    );
  }
  
  // Se não for um tipo de autenticação conhecido, apenas mostra um loader
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-pink-600" size={32} />
    </div>
  );
};