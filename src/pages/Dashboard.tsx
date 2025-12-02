import React from 'react';
import { Link } from 'react-router-dom';
import { useNailify } from '../context/NailifyContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { 
  CalendarCheck, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowRight, 
  Calendar as CalendarIcon,
  Scissors,
  Copy,
  Check
} from 'lucide-react';
import { format, parseISO, isToday, isFuture } from 'date-fns';

export const Dashboard = () => {
  const { appointments, services } = useNailify();
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  // Métricas Simples
  const todayAppointments = appointments.filter(a => isToday(parseISO(a.date)) && a.status !== 'cancelled');
  const futureAppointments = appointments.filter(a => isFuture(parseISO(a.date)) && a.status !== 'cancelled');
  
  // Cálculo de Faturamento
  const totalRevenue = appointments
    .filter(a => a.status === 'confirmed')
    .reduce((acc, curr) => {
      const service = services.find(s => s.id === curr.serviceId);
      return acc + (service?.price || 0);
    }, 0);

  const nextAppointment = futureAppointments.sort((a, b) => 
    new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
  )[0];

  // Gerar Link Público Completo
  const publicLink = `${window.location.origin}/book/u/${user?.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Profissional'} 👋</h1>
          <p className="text-gray-500">Aqui está o resumo do seu negócio hoje.</p>
        </div>
        <div className="flex gap-3">
          {/* Botão Ver meu Link: ESCONDIDO no Mobile (hidden), VISÍVEL no Desktop (md:flex) */}
          <Link 
            to="/dashboard/booking-link"
            className="hidden md:flex px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm items-center gap-2"
          >
            Ver meu Link
          </Link>
          <Link 
            to="/dashboard/manual-booking" 
            className="flex-1 md:flex-none text-center px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            + Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Hoje</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Agendamentos Hoje</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{todayAppointments.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-gray-400">Total Acumulado</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Faturamento Estimado</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Futuros</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">Próximos Clientes</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{futureAppointments.length}</h3>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Next Appointment & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Next Appointment Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Clock size={20} className="text-pink-400" /> Próximo Atendimento
              </h3>
              
              {nextAppointment ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Cliente</p>
                    <p className="text-2xl font-bold">{nextAppointment.clientName}</p>
                    <p className="text-pink-400 font-medium mt-1">{nextAppointment.serviceName}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-w-[140px] text-center">
                    <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">Horário</p>
                    <p className="text-2xl font-bold">{nextAppointment.startTime}</p>
                    <p className="text-sm text-gray-400">{format(parseISO(nextAppointment.date), "dd/MM")}</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <p>Nenhum agendamento futuro encontrado.</p>
                  <Link to="/dashboard/manual-booking" className="text-white underline mt-2 inline-block">Agendar agora</Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Agenda de Hoje</h3>
              <Link to="/dashboard/appointments" className="text-sm text-pink-600 font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={16} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {todayAppointments.length > 0 ? (
                todayAppointments.map(appt => (
                  <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {appt.clientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{appt.clientName}</p>
                        <p className="text-sm text-gray-500">{appt.serviceName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{appt.startTime}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Confirmado
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <CalendarIcon className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>Sua agenda está livre hoje.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links / Promotion */}
        <div className="space-y-6">
          <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100">
            <h3 className="font-bold text-gray-900 mb-2">Divulgue seu trabalho</h3>
            <p className="text-sm text-gray-600 mb-4">
              Compartilhe seu link exclusivo no Instagram e WhatsApp para conseguir mais clientes.
            </p>
            
            {/* Link Copy Box */}
            <div className="bg-white p-3 rounded-lg border border-pink-200 flex items-center justify-between mb-4 shadow-sm">
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-xs text-gray-500 truncate">{publicLink}</p>
              </div>
              <button 
                onClick={copyLink}
                className="text-pink-600 hover:text-pink-700 p-1.5 hover:bg-pink-50 rounded-md transition-colors"
                title="Copiar Link"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <Link 
              to="/dashboard/booking-link"
              className="block w-full py-2 bg-pink-600 text-white text-center rounded-lg font-medium hover:bg-pink-700 transition-colors shadow-md shadow-pink-200"
            >
              Configurar Link
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Atalhos Rápidos</h3>
            <div className="space-y-2">
              <Link to="/dashboard/services" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                    <Scissors size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Editar Serviços</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
              
              <Link to="/dashboard/hours" className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Ajustar Horários</span>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};