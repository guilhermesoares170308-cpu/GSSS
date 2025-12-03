import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  LayoutDashboard, 
  Scissors, 
  Link as LinkIcon, 
  Menu, 
  X, 
  LogOut, 
  Instagram,
  Facebook,
  Twitter,
  Package,
  DollarSign,
  Settings
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isBookingPage = location.pathname.includes('/book/u/');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/auth/callback';
  const isDashboard = location.pathname.includes('/dashboard');

  // --- LAYOUT 1: PÁGINAS DE AUTH (Login/Register/Forgot/Callback) ---
  if (isAuthPage) {
    return <>{children}</>;
  }

  // --- LAYOUT 2: PÁGINA PÚBLICA DE AGENDAMENTO ---
  if (isBookingPage) {
    return <div className="min-h-screen bg-pink-50/50">{children}</div>;
  }

  // --- LAYOUT 3: ÁREA ADMINISTRATIVA (Dashboard) ---
  if (isDashboard) {
    if (!user) {
        // Em um app real, usaríamos useEffect para redirecionar
    }

    const navItems = [
      { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
      { icon: Calendar, label: 'Agendamentos', path: '/dashboard/appointments' },
      { icon: Scissors, label: 'Serviços', path: '/dashboard/services' },
      { icon: Clock, label: 'Horários', path: '/dashboard/hours' },
    ];

    const managementItems = [
      { icon: Package, label: 'Controle de Estoque', path: '/dashboard/inventory' },
      { icon: DollarSign, label: 'Financeiro', path: '/dashboard/financial' },
      { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
    ];

    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed md:sticky top-0 h-screen w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-200 ease-in-out flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-pink-200">N</div>
              <span className="text-xl font-bold text-gray-900">Nailify</span>
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Dia a Dia</p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-pink-50 text-pink-700 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-pink-600" : "text-gray-400"} />
                  {item.label}
                </Link>
              );
            })}

            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Gestão</p>
            {managementItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-pink-50 text-pink-700 shadow-sm" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} className={isActive ? "text-pink-600" : "text-gray-400"} />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-8">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Divulgação</p>
              <Link
                to="/dashboard/booking-link"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  location.pathname === '/dashboard/booking-link'
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                )}
              >
                <LinkIcon size={20} className={location.pathname === '/dashboard/booking-link' ? "text-teal-600" : "text-teal-500 group-hover:text-teal-600"} />
                Link de Agendamento
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold">
                {user?.user_metadata?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.user_metadata?.name || 'Usuário'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors" title="Sair">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
              <Menu size={24} />
            </button>
            <span className="font-bold text-gray-900">Dashboard</span>
            <div className="w-6" /> {/* Spacer */}
          </header>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- LAYOUT 4: HOME PAGE (Landing Page) ---
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-pink-200 group-hover:scale-105 transition-transform">N</div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Nailify</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Início</Link>
            <Link to="#" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Funcionalidades</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Dashboard</Link>
            {/* NOVO BOTÃO DE TESTE */}
            <Link 
              to="/auth/callback?type=recovery" 
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors border border-red-200 px-2 py-1 rounded-full"
              title="Acesso Direto para Teste de Nova Senha"
            >
              TESTE: Nova Senha
            </Link>
            <a href="#planos" className="text-gray-600 hover:text-pink-600 font-medium transition-colors">Planos</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
               <Link to="/dashboard" className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg">
                 Ir para Dashboard
               </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-900 font-medium hover:text-pink-600 hidden sm:block">Entrar</Link>
                <Link to="/register" className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Começar Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                <span className="text-xl font-bold">Nailify</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Transformando a gestão de beleza com tecnologia simples e poderosa.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Facebook size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Twitter size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">Funcionalidades</Link></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Preços</a></li>
                <li><Link to="#" className="hover:text-white transition-colors">Para Salões</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Acesso</h4>
              <div className="flex flex-col gap-3">
                <Link to="/register" className="block text-center bg-pink-600 text-white py-2 rounded-lg font-medium hover:bg-pink-700 transition-colors">
                  Cadastrar Grátis
                </Link>
                <Link to="/login" className="block text-center border border-gray-700 text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Entrar na Conta
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2025 Nailify Tecnologia. Todos os direitos reservados.</p>
            <p>Feito com ❤️ para profissionais de beleza.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};