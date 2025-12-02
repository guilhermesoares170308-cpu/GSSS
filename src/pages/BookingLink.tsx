import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, startOfToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  X, 
  Loader2, 
  AlertTriangle, 
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Service, BusinessHours } from '../types';
import { supabase } from '../lib/supabase';

// Default hours fallback
const defaultHours: BusinessHours = {
  weekdays: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '09:00', end: '14:00' },
  sunday: { enabled: false, start: '00:00', end: '00:00' },
};

// Helper functions
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

export const BookingLink = () => {
  const { userId } = useParams<{ userId: string }>();
  
  // State for data fetched from DB
  const [professionalName, setProfessionalName] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Booking Flow State
  const [step, setStep] = useState<'service' | 'date' | 'confirm' | 'success' | 'manage'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(startOfToday(), 'yyyy-MM-dd'));
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Manage existing appointment state
  const [manageQuery, setManageQuery] = useState('');
  const [foundAppointments, setFoundAppointments] = useState<any[]>([]);
  const [actionType, setActionType] = useState<'cancel' | 'reschedule' | null>(null);
  const [apptToReschedule, setApptToReschedule] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // --- FETCH DATA FOR THIS PROFESSIONAL ---
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      // --- MODO DEMONSTRAÇÃO ---
      if (userId === 'demo-user') {
        setProfessionalName('Studio Demo Nailify');
        setBusinessHours(defaultHours);
        setServices([
          { id: '1', name: 'Manicure Gel', description: 'Aplicação completa de gel com acabamento natural', duration: 90, price: 120 },
          { id: '2', name: 'Pedicure Spa', description: 'Tratamento completo para os pés com esfoliação', duration: 45, price: 60 },
          { id: '3', name: 'Blindagem', description: 'Proteção para unhas naturais', duration: 60, price: 80 },
          { id: '4', name: 'Esmaltação em Gel', description: 'Durabilidade de até 20 dias', duration: 40, price: 70 }
        ] as Service[]);
        setAppointments([]); 
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Get Profile & Hours
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, business_hours')
          .eq('id', userId)
          .maybeSingle();
          
        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
        }
        
        setProfessionalName(profile?.name || 'Profissional Nailify');
        
        if (profile?.business_hours) {
          setBusinessHours(profile.business_hours as unknown as BusinessHours);
        } else {
          setBusinessHours(defaultHours);
        }

        // 2. Get Services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', userId);
          
        setServices(servicesData || []);

        // 3. Get Appointments (for slot calculation)
        const { data: apptsData } = await supabase
          .from('appointments')
          .select('date, start_time, end_time, status')
          .eq('user_id', userId)
          .neq('status', 'cancelled');
          
        setAppointments(apptsData || []);
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar a agenda. Verifique o link e tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // --- SLOT CALCULATION LOGIC ---
  useEffect(() => {
    if (!selectedService || !selectedDate || !businessHours) return;

    const dateObj = parseISO(selectedDate);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    
    let dayConfig;
    if (dayOfWeek === 0) dayConfig = businessHours.sunday;
    else if (dayOfWeek === 6) dayConfig = businessHours.saturday;
    else dayConfig = businessHours.weekdays;

    if (!dayConfig || !dayConfig.enabled) {
      setAvailableSlots([]);
      return;
    }

    const startMinutes = timeToMinutes(dayConfig.start);
    const endMinutes = timeToMinutes(dayConfig.end);
    const serviceDuration = selectedService.duration;

    // Get existing appointments for this day
    const dayAppts = appointments
      .filter(a => a.date === selectedDate)
      .map(a => ({
        start: timeToMinutes(a.start_time),
        end: timeToMinutes(a.end_time)
      }))
      .sort((a, b) => a.start - b.start);

    const slots: string[] = [];
    let currentPointer = startMinutes;

    // Se for hoje, não mostrar horários passados
    const now = new Date();
    const isTodayDate = format(now, 'yyyy-MM-dd') === selectedDate;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    while (currentPointer + serviceDuration <= endMinutes) {
      // Se for hoje e o horário já passou, pula
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

    setAvailableSlots(slots);
  }, [selectedService, selectedDate, businessHours, appointments]);


  const handleBooking = async () => {
    if (!selectedService || !selectedSlot || !clientName || !userId) return;
    
    // Simulação para Demo
    if (userId === 'demo-user') {
      setIsSubmitting(true);
      setTimeout(() => {
        setStep('success');
        setIsSubmitting(false);
      }, 1500);
      return;
    }

    setIsSubmitting(true);
    setActionError('');
    const endTime = minutesToTime(timeToMinutes(selectedSlot) + selectedService.duration);

    try {
      if (actionType === 'reschedule' && apptToReschedule) {
          const { error } = await supabase.from('appointments').update({
            date: selectedDate,
            start_time: selectedSlot,
            end_time: endTime,
            status: 'rescheduled'
          }).eq('id', apptToReschedule);
          if (error) throw error;
      } else {
          const { error } = await supabase.from('appointments').insert({
            user_id: userId,
            service_id: selectedService.id,
            client_name: clientName,
            date: selectedDate,
            start_time: selectedSlot,
            end_time: endTime,
            status: 'confirmed'
          });
          if (error) throw error;
      }
      setStep('success');
    } catch (err) {
      console.error(err);
      setActionError('Ocorreu um erro ao realizar o agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async () => {
    if (userId === 'demo-user') {
        setFoundAppointments([
            { id: 'demo1', client_name: 'Cliente Demo', serviceName: 'Manicure Gel', date: '2025-03-10', start_time: '14:00', service_id: '1' }
        ]);
        return;
    }

    if (!userId) return;
    if (!manageQuery.trim()) return;
    
    setIsSubmitting(true);
    const { data } = await supabase
      .from('appointments')
      .select('*, services(name)')
      .eq('user_id', userId)
      .ilike('client_name', `%${manageQuery}%`)
      .neq('status', 'cancelled');

    if (data) {
      const formatted = data.map((a: any) => ({
        ...a,
        serviceName: a.services?.name,
        startTime: a.start_time
      }));
      setFoundAppointments(formatted);
    }
    setIsSubmitting(false);
  };

  const handleCancel = async (id: string) => {
    if (userId === 'demo-user') {
        setFoundAppointments(prev => prev.filter(p => p.id !== id));
        setConfirmCancelId(null);
        return;
    }

    setIsSubmitting(true);
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    setConfirmCancelId(null);
    handleSearch(); // refresh list
    setIsSubmitting(false);
  };

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
            <Loader2 className="animate-spin text-pink-600 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Carregando agenda...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <a href="/" className="text-pink-600 font-bold hover:underline">Voltar para Nailify</a>
            </div>
        </div>
    );
  }

  // --- RENDER STEPS (Success) ---
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-purple-600"></div>
            
            <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
            <CheckCircle size={48} strokeWidth={3} />
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {actionType === 'reschedule' ? 'Horário Remarcado!' : 'Agendamento Confirmado!'}
                </h2>
                <p className="text-gray-500">Tudo certo com seu horário.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 text-sm">Profissional</span>
                    <span className="font-bold text-gray-900">{professionalName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-500 text-sm">Serviço</span>
                    <span className="font-bold text-gray-900">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Data e Hora</span>
                    <span className="font-bold text-pink-600">
                        {format(parseISO(selectedDate), "dd/MM", { locale: ptBR })} às {selectedSlot}
                    </span>
                </div>
            </div>

            <p className="text-sm text-gray-400">
                Um comprovante foi gerado. Tire um print desta tela se desejar.
            </p>

            <button 
            onClick={() => window.location.reload()}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg transform hover:-translate-y-1"
            >
            Fazer Novo Agendamento
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER STEPS (Manage) ---
  if (step === 'manage') {
      return (
        <div className="min-h-screen bg-pink-50 py-12 px-4">
            <div className="max-w-lg mx-auto bg-white p-6 rounded-3xl shadow-xl border border-gray-100 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Gerenciar Agendamento</h2>
                    <button onClick={() => setStep('service')} className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1">
                        <X size={16} /> Fechar
                    </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Buscar por nome</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Digite o nome usado no agendamento..." 
                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-gray-900"
                            value={manageQuery}
                            onChange={e => setManageQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                        onClick={handleSearch} 
                        disabled={isSubmitting}
                        className="bg-pink-600 text-white px-4 rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50 shadow-md"
                        >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {foundAppointments.map(appt => (
                        <div key={appt.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                            {confirmCancelId === appt.id ? (
                            <div className="text-center space-y-4 py-2">
                                <div className="flex flex-col items-center justify-center gap-2 text-amber-600 font-medium">
                                <AlertTriangle size={24} />
                                <p>Tem certeza que deseja cancelar este horário?</p>
                                </div>
                                <div className="flex justify-center gap-3">
                                <button 
                                    onClick={() => setConfirmCancelId(null)}
                                    className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-xl text-sm font-bold"
                                >
                                    Não, voltar
                                </button>
                                <button 
                                    onClick={() => handleCancel(appt.id)}
                                    className="flex-1 py-2 text-white bg-red-500 rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200"
                                >
                                    Sim, cancelar
                                </button>
                                </div>
                            </div>
                            ) : (
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{appt.serviceName}</p>
                                    <p className="text-gray-500 flex items-center gap-1 mt-1">
                                    <CalendarIcon size={16} className="text-pink-500"/>
                                    {format(parseISO(appt.date), "dd/MM")} às {appt.startTime}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => {
                                            const srv = services.find(s => s.id === appt.service_id) || (userId === 'demo-user' ? services[0] : null);
                                            if(srv) {
                                                setSelectedService(srv);
                                                setClientName(appt.client_name);
                                                setApptToReschedule(appt.id);
                                                setActionType('reschedule');
                                                setStep('date'); 
                                            }
                                        }}
                                        className="text-blue-600 text-xs font-bold px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                        Remarcar
                                    </button>
                                    <button 
                                        onClick={() => setConfirmCancelId(appt.id)}
                                        className="text-red-500 text-xs font-bold px-3 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                    ))}
                    {manageQuery && foundAppointments.length === 0 && !isSubmitting && (
                        <div className="text-center py-12 text-gray-400">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhum agendamento encontrado para "{manageQuery}".</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )
  }

  // --- RENDER STEPS (Wizard) ---
  return (
    <div className="min-h-screen bg-pink-50 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Profile */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl shadow-pink-200 transform rotate-3">
                {professionalName.charAt(0)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-pink-50"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{professionalName}</h1>
            <p className="text-gray-500 text-sm mt-1">Agendamento Online</p>
            
            <button onClick={() => setStep('manage')} className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-xs font-bold text-gray-600 shadow-sm hover:shadow-md transition-all border border-gray-100">
                <Search size={14} /> Já tem agendamento? Consultar
            </button>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all duration-500">
            
            {/* Progress Bar */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
            <div className={cn("flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider transition-colors relative", step === 'service' ? "text-pink-600" : "text-gray-400")}>
                1. Serviço
                {step === 'service' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-t-full"></div>}
            </div>
            <div className={cn("flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider transition-colors relative", step === 'date' ? "text-pink-600" : "text-gray-400")}>
                2. Data
                {step === 'date' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-t-full"></div>}
            </div>
            <div className={cn("flex-1 py-4 text-center text-xs font-bold uppercase tracking-wider transition-colors relative", step === 'confirm' ? "text-pink-600" : "text-gray-400")}>
                3. Confirmar
                {step === 'confirm' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-t-full"></div>}
            </div>
            </div>

            <div className="p-6 md:p-8 min-h-[400px]">
            
            {/* STEP 1: SERVICES */}
            {step === 'service' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                <h3 className="font-bold text-xl text-gray-900 mb-6">O que vamos fazer hoje? ✨</h3>
                
                {services.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">Nenhum serviço disponível no momento.</p>
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
                                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
            )}

            {/* STEP 2: DATE & TIME */}
            {step === 'date' && selectedService && (
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
                    <label className="block text-sm font-bold text-gray-900 mb-3">Escolha o dia</label>
                    <input 
                        type="date" 
                        value={selectedDate}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-4 border border-gray-200 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-medium text-gray-900"
                    />
                </div>

                <div>
                    <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-pink-500"/> Horários Disponíveis
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
            )}

            {/* STEP 3: CONFIRM */}
            {step === 'confirm' && selectedService && selectedSlot && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setStep('date')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <h3 className="font-bold text-xl text-gray-900">Confirmar Agendamento</h3>
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
                        <span className="font-bold text-gray-900">{selectedSlot} - {minutesToTime(timeToMinutes(selectedSlot) + selectedService.duration)}</span>
                    </div>
                    <div className="pt-4 border-t border-pink-200 flex justify-between items-center">
                        <span className="text-gray-900 font-bold">Total</span>
                        <span className="font-black text-2xl text-pink-600">{formatCurrency(selectedService.price)}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Seu Nome Completo</label>
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
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={22} />}
                    {actionType === 'reschedule' ? 'Confirmar Remarcação' : 'Confirmar Agendamento'}
                </button>
                </div>
            )}

            </div>
        </div>
      </div>
    </div>
  );
};
