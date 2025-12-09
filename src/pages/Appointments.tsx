import React from 'react';
import { useNailify } from '../context/NailifyContext';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, XCircle, CheckCircle, RotateCcw, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data & Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedAppointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{appt.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700">{appt.serviceName}</div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      appt.status === 'confirmed' && "bg-green-100 text-green-800",
                      appt.status === 'cancelled' && "bg-red-100 text-red-800",
                      appt.status === 'rescheduled' && "bg-yellow-100 text-yellow-800",
                    )}>
                      {appt.status === 'confirmed' && 'Confirmado'}
                      {appt.status === 'cancelled' && 'Cancelado'}
                      {appt.status === 'rescheduled' && 'Remarcado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
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