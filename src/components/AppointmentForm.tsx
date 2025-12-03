import React, { useState, useEffect, useMemo } from 'react';
import { useNailify } from '../context/NailifyContext';
import { format, parseISO, startOfToday, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Calendar as CalendarIcon, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Service, BusinessHours } from '../types';

// Helper functions (copied from BookingLink for self-sufficiency)
const timeToMinutes = (time: string) => {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

interface AppointmentFormProps {
  onSuccess: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess }) => {
  const { services, businessHours, appointments, addAppointment, refreshData } = useNailify();
  
  // State
  const [step, setStep] = useState<'service' | 'date' | 'confirm'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // --- SLOT CALCULATION LOGIC ---
  const availableSlots = useMemo(() => {
    if (!selectedService || !businessHours) return [];

    const dateObj = parseISO(selectedDate);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    
    const dayKeys: (keyof BusinessHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];
    
    const dayConfig = businessHours[dayKey];

    if (!dayConfig || !dayConfig.enabled) {
      return [];
    }

    const startMinutes = timeToMinutes(dayConfig.start);
    const endMinutes = timeToMinutes(dayConfig.end);
    const serviceDuration = selectedService.duration;

    // Get existing appointments for this day
    const dayAppts = appointments
      .filter(a => a.date === selectedDate && a.status !== 'cancelled')
      .map(a => ({
        start: timeToMinutes(a.startTime),
        end: timeToMinutes(a.endTime)
      }))
      .sort((a, b) => a.start - b.start);

    const slots: string[] = [];
    let currentPointer = startMinutes;

    // Se for hoje, não mostrar horários passados
    const now = new Date();
    const isTodayDate = isToday(dateObj);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    while (currentPointer + serviceDuration <= endMinutes) {
      // Se for hoje e o horário já passou, pula (com buffer de 30 min)
      if (isTodayDate && currentPointer < currentMinutes + 30) { 
        currentPointer += 30; 
        continue;
      }

      const potentialEnd = currentPointer + serviceDuration;
      
      // Check collision
      const collision = dayAppts.find(appt => {
        return (currentPointer < appt.end) && (potentialEnd > appt.start);
      });

      if (collision) {
        currentPointer = collision.end;
      } else {
        slots.push(minutesToTime(currentPointer));
        currentPointer += 30; 
      }
    }

    return slots;
  }, [selectedService, selectedDate, businessHours, appointments]);

  // --- HANDLERS ---
  const handleBooking = async () => {
    if (!selectedService || !selectedSlot || !clientName) return;

    setIsSubmitting(true);
    setActionError('');
    const endTime = minutesToTime(timeToMinutes(selectedSlot) + selectedService.duration);

    try {
      await addAppointment({
        serviceId: selectedService.id,
        clientName: clientName,
        date: selectedDate,
        startTime: selectedSlot,
        endTime: endTime,
      } as any); // Omit<Appointment, 'id' | 'status'>

      onSuccess();
    } catch (err) {
      console.error(err);
      setActionError('Ocorreu um erro ao registrar o agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER STEPS ---
  
  // STEP 1: SERVICES
  if (step === 'service') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <h3 className="font-bold text-xl text-gray-900 mb-6">1. Escolha o Serviço</h3>
        
        {services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">Nenhum serviço cadastrado. Cadastre um em "Serviços".</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setStep('date');
                }}
                className="w-full text-left p-5 rounded-2xl border border-gray-100 bg-white hover:border-pink-500 hover:shadow-lg hover:shadow-pink-100 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg text-gray-900 group-hover:text-pink-600 transition-colors">{service.name}</span>
                  <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg group-hover:bg-pink-50 group-hover:text-pink-700 transition-colors">{formatCurrency(service.price)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Clock size={14} /> {service.duration} min
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // STEP 2: DATE & TIME
  if (step === 'date' && selectedService) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep('service')} className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold">Serviço escolhido</p>
            <p className="font-bold text-pink-600">{selectedService.name}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">2. Escolha o dia</label>
          <input 
            type="date" 
            value={selectedDate}
            min={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot(null); // Reset slot when date changes
            }}
            className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-gray-900"
          />
        </div>

        <div>
          <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-pink-500"/> Horários Disponíveis ({selectedService.duration} min)
          </h3>
          
          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {availableSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep('confirm');
                  }}
                  className="py-3 px-2 rounded-xl border border-gray-200 hover:border-pink-500 hover:bg-pink-600 hover:text-white transition-all text-sm font-bold text-gray-700 hover:shadow-md"
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <AlertCircle className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-gray-500 font-medium">Sem horários livres nesta data.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STEP 3: CONFIRM
  if (step === 'confirm' && selectedService && selectedSlot) {
    const endTime = minutesToTime(timeToMinutes(selectedSlot) + selectedService.duration);
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setStep('date')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
          <h3 className="font-bold text-xl text-gray-900">3. Confirmar Agendamento</h3>
        </div>

        <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">Serviço</span>
            <span className="font-bold text-gray-900 text-right">{selectedService.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">Data</span>
            <span className="font-bold text-gray-900 capitalize">{format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm font-medium">Horário</span>
            <span className="font-bold text-gray-900">{selectedSlot} - {endTime}</span>
          </div>
          <div className="pt-4 border-t border-pink-200 flex justify-between items-center">
            <span className="text-gray-900 font-bold">Total</span>
            <span className="font-black text-2xl text-pink-600">{formatCurrency(selectedService.price)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Nome do Cliente</label>
          <input 
            type="text" 
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex: Maria Silva"
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-medium"
          />
        </div>

        {actionError && (
          <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /> {actionError}
          </div>
        )}

        <button 
          onClick={handleBooking}
          disabled={!clientName || isSubmitting}
          className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold text-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-pink-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={22} />}
          {!isSubmitting && 'Agendar para Cliente'}
        </button>
      </div>
    );
  }
  
  return null;
};