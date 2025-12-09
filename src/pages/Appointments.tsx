import React from 'react';
import { useNailify } from '../context/NailifyContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, XCircle, CheckCircle, RotateCcw, Plus, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { Appointment } from '../types';

// Componente auxiliar para o status
const StatusBadge: React.FC<{ status: Appointment['status'] }> = ({ status }) => {
  const statusMap = {
    confirmed: { label: 'Confirmado', bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    rescheduled: { label: 'Remarcado', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: RotateCcw },
  };
  const { label, bg, text, icon: Icon } = statusMap[status];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize gap-1",
      bg, text
    )}>
      <Icon size={12} />
      {label}
    </span>
  );
};

// Componente Card para Mobile
const AppointmentCard: React.FC<{ appt: Appointment, cancelAppointment: (id: string) => Promise<void> }> = ({ appt, cancelAppointment }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                    {appt.clientName.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-gray-900">{appt.clientName}</p>
                    <p className="text-sm text-gray-500">{appt.serviceName}</p>
                </div>
            </div>
            <StatusBadge status={appt.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={16} className="text-gray-400"/>
                {format(parseISO(appt.date), "dd/MM/yyyy")}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
                <Clock size={16} className="text-gray-400"/>
                {appt.startTime} - {appt.endTime}
            </div>
        </div>

        {appt.status === 'confirmed' && (
            <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={() => cancelAppointment(appt.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg bg-red-50 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        )}
    </div>
);


export const Appointments = () => {
  const { appointments, cancelAppointment } = useNailify();

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateB.getTime() - dateA.getTime(); // Newest first
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Agendamentos</h2>
          <p className="text-gray-500">Gerencie os horários marcados pelos seus clientes.</p>
        </div>
        <Link 
          to="/dashboard/manual-booking" 
          className="w-full sm:w-auto bg-pink-600 text-white px-4 py-3 rounded-xl hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-pink-200"
        >
          <Plus size={20} /> Novo Agendamento
        </Link>
      </div>

      {/* MOBILE VIEW: List of Cards (Default) */}
      <div className="md:hidden space-y-4">
        {sortedAppointments.length > 0 ? (
            sortedAppointments.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} cancelAppointment={cancelAppointment} />
            ))
        ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500">Nenhum agendamento encontrado.</p>
            </div>
        )}
      </div>

      {/* DESKTOP VIEW: Table (md:block) */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Serviço</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">Data & Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right min-w-[80px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedAppointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{appt.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-700">{appt.serviceName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-gray-900 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400"/>
                        {format(parseISO(appt.date), "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1 mt-1">
                        <Clock size={14} className="text-gray-400"/>
                        {appt.startTime} - {appt.endTime}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={appt.status} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {appt.status === 'confirmed' && (
                      <button 
                        onClick={() => cancelAppointment(appt.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sortedAppointments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};