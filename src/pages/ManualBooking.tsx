import React, { useState } from 'react';
import { AppointmentForm } from '../components/AppointmentForm';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ManualBooking = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 space-y-6 animate-in fade-in zoom-in duration-300">
        <CheckCircle size={64} className="text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Agendamento Registrado!</h2>
        <p className="text-gray-600">O horário foi adicionado à sua agenda com sucesso.</p>
        
        <div className="flex flex-col gap-3 pt-4">
            <Link 
                to="/dashboard/appointments"
                className="w-full py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors"
            >
                Ver Agenda Completa
            </Link>
            <button 
                onClick={() => setIsSuccess(false)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
                Fazer Novo Agendamento
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
        </Link>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Agendamento Manual</h2>
            <p className="text-gray-500">Marque um horário diretamente na sua agenda para um cliente.</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
        <AppointmentForm onSuccess={() => setIsSuccess(true)} />
      </div>
    </div>
  );
};