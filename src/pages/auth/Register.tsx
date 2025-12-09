import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '../../lib/toast';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      
      // Se o registro for bem-sucedido, redireciona para a página de confirmação pendente
      navigate('/pending-confirmation', { state: { email } });
      showSuccess('Verifique seu e-mail para confirmar sua conta!');
      
    } catch (err: any) {
      console.error(err);
      // Supabase retorna um erro se o e-mail já estiver em uso, etc.
      showError(err.message || 'Falha ao criar conta. Tente novamente.');
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

        <div className="p-8 pt-12"> {/* Aumentei o padding top */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-200">N</div>
              <span className="text-2xl font-bold text-gray-900">Nailify</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Crie sua conta grátis</h2>
            <p className="text-gray-500 mt-2">Comece a organizar sua agenda em menos de 2 minutos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  placeholder="Ex: Ana Silva"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Profissional</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
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
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">Link de agendamento exclusivo</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">Gestão completa de serviços e horários</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500">Sem necessidade de cartão de crédito</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-medium hover:bg-pink-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-pink-200"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Criar minha conta'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
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