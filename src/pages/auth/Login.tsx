import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Falha ao entrar. Verifique suas credenciais.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Botão Voltar */}
        <Link 
          to="/" 
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
          title="Voltar para o início"
        >
          <ArrowLeft size={20} />
        </Link>

        <div className="p-8 pt-12"> {/* Aumentei o padding top para não colidir com o botão */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-200">N</div>
              <span className="text-2xl font-bold text-gray-900">Nailify</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Bem-vinda de volta!</h2>
            <p className="text-gray-500 mt-2">Acesse sua conta para gerenciar seus agendamentos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <Link to="/forgot-password" className="text-xs font-medium text-pink-600 hover:underline">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar na conta'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-bold text-pink-600 hover:underline">
                Crie grátis agora
              </Link>
            </p>
          </div>
        </div>
        <div className="bg-pink-50 p-4 text-center border-t border-pink-100">
          <p className="text-xs text-pink-800 font-medium">🔒 Seus dados estão seguros conosco.</p>
        </div>
      </div>
    </div>
  );
};