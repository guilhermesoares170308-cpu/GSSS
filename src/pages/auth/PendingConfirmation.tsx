import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showSuccess, showError, showLoading, dismissToast } from '../../lib/toast';

export const PendingConfirmation: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email || 'seu e-mail';
  const [loading, setLoading] = React.useState(false);

  const handleResend = async () => {
    if (email === 'seu e-mail') {
        showError('Não foi possível reenviar. Por favor, volte e tente se registrar novamente.');
        return;
    }
    
    setLoading(true);
    const toastId = showLoading('Reenviando e-mail...');
    
    try {
        // Supabase uses the same signUp endpoint to resend confirmation if the user exists but is unconfirmed
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) throw error;
        
        showSuccess('E-mail reenviado! Verifique sua caixa de entrada.');
    } catch (err) {
        showError('Falha ao reenviar. Tente novamente mais tarde.');
        console.error(err);
    } finally {
        setLoading(false);
        dismissToast(toastId);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
        <Mail size={48} className="text-pink-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Confirmação Pendente</h2>
        
        <p className="text-gray-600">
          Enviamos um link de confirmação para: <br />
          <strong className="text-pink-600 break-all">{email}</strong>
        </p>
        
        <p className="text-sm text-gray-500">
          Por favor, clique no link no e-mail para ativar sua conta. Você pode fechar esta janela.
        </p>

        <div className="pt-4 border-t border-gray-100 space-y-3">
            <button
                onClick={handleResend}
                disabled={loading || email === 'seu e-mail'}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-70"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reenviar E-mail'}
            </button>
            <Link 
                to="/login" 
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-pink-600 font-medium"
            >
                <ArrowLeft size={16} /> Voltar para o Login
            </Link>
        </div>
      </div>
    </div>
  );
};