import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Link as LinkIcon, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  TrendingUp, 
  Star,
  ArrowRight,
  Check,
  Package
} from 'lucide-react';

export const Home = () => {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-b from-pink-50 via-white to-white pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Texto Hero */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-bold tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Star size={14} fill="currentColor" />
                A plataforma #1 para Nail Designers
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Sua agenda cheia, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">sem esforço.</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Abandone o caderno e a confusão no WhatsApp. Tenha um site de agendamento profissional, lembretes automáticos e controle financeiro em um só lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Link 
                  to="/register" 
                  className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-full font-bold text-xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Começar Agora <ArrowRight size={20} />
                </Link>
              </div>

              <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Sem cartão de crédito</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={16} className="text-green-500" /> Cancele quando quiser</span>
              </div>
            </div>

            {/* Visual Hero (Mockup CSS) */}
            <div className="flex-1 relative w-full max-w-[400px] lg:max-w-none flex justify-center lg:justify-end">
              <div className="relative z-10 bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl shadow-pink-200 border-4 border-gray-800 w-[300px] sm:w-[340px] rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-[2rem] overflow-hidden h-[600px] relative">
                  {/* Mockup Header */}
                  <div className="bg-pink-600 p-6 pb-12 text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold">N</div>
                    <p className="font-bold text-lg">Studio Nailify</p>
                    <p className="text-pink-100 text-sm">Agende seu horário</p>
                  </div>
                  {/* Mockup Body */}
                  <div className="p-4 -mt-6 space-y-3">
                    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">Manicure Gel</p>
                        <p className="text-xs text-gray-500">1h 30min • R$ 120</p>
                      </div>
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">+</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center opacity-70">
                      <div>
                        <p className="font-bold text-gray-800">Spa dos Pés</p>
                        <p className="text-xs text-gray-500">45min • R$ 60</p>
                      </div>
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold">+</div>
                    </div>
                    <div className="mt-6">
                      <p className="font-bold text-gray-900 mb-2">Horários Livres</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-pink-600 text-white text-center py-2 rounded-lg text-xs font-bold">09:00</div>
                        <div className="bg-gray-100 text-gray-400 text-center py-2 rounded-lg text-xs font-bold line-through">10:30</div>
                        <div className="border border-gray-200 text-gray-600 text-center py-2 rounded-lg text-xs font-bold">13:00</div>
                      </div>
                    </div>
                    <div className="mt-8 bg-gray-50 p-4 rounded-xl text-center">
                      <p className="text-xs text-gray-400">Powered by Nailify</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST BADGES --- */}
      <section className="bg-white py-10 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">A escolha inteligente de profissionais em todo o Brasil</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos fictícios usando texto estilizado */}
            <div className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2"><Star className="text-pink-600" fill="currentColor"/> BeautyPro</div>
            <div className="text-2xl font-serif italic text-gray-800">StudioGlam</div>
            <div className="text-xl font-bold text-gray-800 border-2 border-gray-800 p-1 px-3">NAILS.CO</div>
            <div className="text-2xl font-light text-gray-800 tracking-[0.2em]">ELITE</div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Tudo o que você precisa para crescer</h2>
            <p className="text-lg text-gray-600">O Nailify não é apenas uma agenda. É o seu assistente pessoal que trabalha 24 horas por dia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6">
                <LinkIcon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Link de Agendamento</h3>
              <p className="text-gray-600 leading-relaxed">
                Envie seu link exclusivo para as clientes. Elas veem seus horários livres e agendam sozinhas, sem precisar te chamar no WhatsApp.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Tempo Real</h3>
              <p className="text-gray-600 leading-relaxed">
                Nosso algoritmo inteligente calcula automaticamente os encaixes baseados na duração de cada serviço. Adeus buracos na agenda!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Controle Financeiro</h3>
              <p className="text-gray-600 leading-relaxed">
                Saiba exatamente quanto você vai faturar no dia, na semana e no mês. Tenha previsibilidade e controle do seu negócio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Pare de perder tempo no WhatsApp respondendo "tem horário?"
              </h2>
              <p className="text-lg text-gray-600">
                Enquanto você atende uma cliente, outras 3 estão tentando marcar. Com o Nailify, o agendamento acontece enquanto você trabalha (ou descansa).
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Você configura seus serviços</h4>
                    <p className="text-gray-600">Defina preços, duração e seus horários de atendimento.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Compartilha seu Link</h4>
                    <p className="text-gray-600">Coloque na bio do Instagram ou mande no WhatsApp.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Recebe Agendamentos</h4>
                    <p className="text-gray-600">O sistema preenche sua agenda automaticamente.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 bg-gray-100 rounded-3xl p-8 relative">
              {/* Abstract decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-200 rounded-full blur-xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full blur-xl opacity-50"></div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 relative z-10">
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600"><Smartphone /></div>
                  <div>
                    <p className="font-bold text-gray-900">Notificação</p>
                    <p className="text-xs text-gray-500">Agora mesmo</p>
                  </div>
                </div>
                <p className="text-gray-800 font-medium mb-2">🎉 Novo agendamento confirmado!</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                  <p className="text-sm font-bold text-gray-900">Cliente: Júlia Souza</p>
                  <p className="text-sm text-gray-600">Serviço: Alongamento Fibra</p>
                  <p className="text-sm text-gray-600">Data: Amanhã às 14:00</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 bg-gray-900 text-white text-sm rounded-lg font-medium">Ver Detalhes</button>
                  <button className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg font-medium">Dispensar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-24 bg-gray-50" id="planos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Investimento que cabe no seu bolso</h2>
            <p className="text-lg text-gray-600">Menos que o valor de um único atendimento seu. Tenha controle total do seu negócio.</p>
          </div>

          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border-2 border-pink-500 overflow-hidden relative transform hover:-translate-y-2 transition-all duration-300">
            {/* Badge */}
            <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Mais Popular
            </div>

            <div className="p-8 text-center border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nailify PRO</h3>
              <div className="flex items-center justify-center gap-1 mb-4">
                <span className="text-gray-400 text-lg">R$</span>
                <span className="text-5xl font-extrabold text-gray-900">29,90</span>
                <span className="text-gray-400 text-lg">/mês</span>
              </div>
              <p className="text-gray-500 text-sm">Tudo incluso. Sem taxas escondidas.</p>
            </div>

            <div className="p-8 bg-gray-50/50">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={14} strokeWidth={3} /></div>
                  <span className="font-medium">Link de Agendamento Ilimitado</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={14} strokeWidth={3} /></div>
                  <span className="font-medium">Controle Total de Agendamentos</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Package size={14} strokeWidth={3} /></div>
                  <span className="font-medium">Controle de Estoque <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full ml-1">Novo</span></span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={14} strokeWidth={3} /></div>
                  <span className="font-medium">Relatórios Financeiros</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0"><Check size={14} strokeWidth={3} /></div>
                  <span className="font-medium">Suporte via WhatsApp</span>
                </li>
              </ul>
              <Link to="/register" className="block w-full py-4 bg-pink-600 text-white rounded-xl font-bold text-center hover:bg-pink-700 transition-all shadow-lg shadow-pink-200">
                Quero Assinar Agora
              </Link>
              <p className="text-center text-xs text-gray-400 mt-4">7 dias de garantia incondicional</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-pink-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">Quem usa, ama ❤️</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
              </div>
              <p className="text-lg mb-6 italic">"Mudou minha vida! Antes eu perdia horas respondendo mensagens. Agora a agenda se enche sozinha."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 font-bold">P</div>
                <div>
                  <p className="font-bold">Patrícia Lima</p>
                  <p className="text-sm text-pink-200">Nail Designer</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
              </div>
              <p className="text-lg mb-6 italic">"O sistema é muito fácil de usar. Minhas clientes adoraram a praticidade de marcar pelo link."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 font-bold">C</div>
                <div>
                  <p className="font-bold">Carla Mendes</p>
                  <p className="text-sm text-pink-200">Manicure</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
              </div>
              <p className="text-lg mb-6 italic">"O controle financeiro me ajudou a ver onde eu estava errando. Super recomendo!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-600 font-bold">F</div>
                <div>
                  <p className="font-bold">Fernanda Costa</p>
                  <p className="text-sm text-pink-200">Esteticista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Pronta para profissionalizar seu negócio?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Junte-se a milhares de profissionais que já modernizaram seus atendimentos.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 text-white rounded-full font-bold text-xl hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1"
          >
            Criar Minha Conta Grátis <ArrowRight />
          </Link>
          <p className="mt-6 text-sm text-gray-500">Teste grátis • Sem compromisso • Configuração em 2 min</p>
        </div>
      </section>

    </div>
  );
};
