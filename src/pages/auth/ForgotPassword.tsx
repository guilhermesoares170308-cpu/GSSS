import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, ArrowRight, Loader2, ArrowLeft, Lock } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // O URL de redirecionamento deve ser a rota que criaremos no App.tsx
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    setLoading(false);

    if (resetError) {
      console.error(resetError);
      setError('Ocorreu um erro ao enviar o link. Verifique o e-mail e tente novamente.');
    } else {
      setMessage('Link de redefinição enviado! Verifique sua caixa de entrada (e spam).');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
        <Link 
          to="/login" 
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
          title="Voltar para o login"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <Lock size={32} className="text-pink-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Esqueceu a Senha?</h2>
            <p className="text-gray-500 mt-2">Insira seu e-mail para receber um link de redefinição.</p>
          </div>

          <form onSubmit={handleSendResetLink} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-pink-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Link de Redefinição'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Lembrou a senha?{' '}
              <Link to="/login" className="font-bold text-gray-900 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};