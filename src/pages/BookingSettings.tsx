import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Link as LinkIcon, 
  Copy, 
  ExternalLink, 
  Check, 
  Smartphone, 
  Share2,
  MessageCircle
} from 'lucide-react';

export const BookingSettings = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const publicLink = `${window.location.origin}/book/u/${user?.id}`;
  const whatsappMessage = `Olá! Agende seu horário comigo através deste link: ${publicLink}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Link de Agendamento</h2>
        <p className="text-gray-500">Gerencie como seus clientes agendam horários com você.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Principal */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-4">
            <LinkIcon size={32} />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900">Seu Link Exclusivo</h3>
            <p className="text-gray-500 mt-2">
              Este é o endereço que você deve enviar para seus clientes. Ao clicar, eles verão seus serviços e horários livres.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 truncate font-medium">{publicLink}</p>
            </div>
            <button 
              onClick={copyLink}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-pink-600 shadow-sm"
              title="Copiar"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href={publicLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-center hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
              <ExternalLink size={20} /> Visualizar Formulário Real
            </a>
            
            <a 
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-center hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              <MessageCircle size={20} /> Enviar no WhatsApp
            </a>
          </div>
        </div>

        {/* Card de Preview / Dicas */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-1 shadow-xl">
            <div className="bg-white rounded-[22px] p-6 h-full">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Smartphone className="text-pink-500" /> Como seu cliente vê
              </h3>
              
              <div className="border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50 relative h-[300px]">
                {/* Mockup Header */}
                <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {user?.user_metadata?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="h-2 w-24 bg-gray-200 rounded mb-1"></div>
                    <div className="h-1.5 w-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="p-4 space-y-3 opacity-50">
                  <div className="h-20 bg-white rounded-xl border border-gray-200"></div>
                  <div className="h-20 bg-white rounded-xl border border-gray-200"></div>
                  <div className="h-20 bg-white rounded-xl border border-gray-200"></div>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                  <a 
                    href={publicLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-pink-600 text-white rounded-full font-bold text-sm hover:bg-pink-700 transition-colors shadow-lg"
                  >
                    Ver ao vivo
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Share2 size={18} /> Dica de Ouro
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Coloque este link na <strong>Bio do seu Instagram</strong>. Assim, suas clientes podem agendar sozinhas sem precisar esperar você responder o Direct!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
