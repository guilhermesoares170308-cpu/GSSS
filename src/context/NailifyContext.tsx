import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Service, Appointment, BusinessHours } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface NailifyContextType {
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  removeService: (id: string) => Promise<void>;
  
  businessHours: BusinessHours;
  updateBusinessHours: (hours: BusinessHours) => Promise<void>;
  
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string, newStartTime: string, newEndTime: string) => Promise<void>;
  
  refreshData: () => Promise<void>;
  isLoading: boolean; // Adicionado
}

const defaultDaySchedule = { enabled: true, start: '09:00', end: '18:00' };
const defaultHours: BusinessHours = {
  monday: defaultDaySchedule,
  tuesday: defaultDaySchedule,
  wednesday: defaultDaySchedule,
  thursday: defaultDaySchedule,
  friday: defaultDaySchedule,
  saturday: { enabled: true, start: '09:00', end: '14:00' },
  sunday: { enabled: false, start: '00:00', end: '00:00' },
};

const NailifyContext = createContext<NailifyContextType | undefined>(undefined);

export const NailifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultHours);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Novo estado

  const refreshData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true); // Inicia o carregamento

    try {
        // Fetch Profile (Business Hours)
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_hours')
          .eq('id', user.id)
          .single();
        
        // Se houver business_hours no perfil, usa. Caso contrário, usa o default.
        if (profile?.business_hours) {
          // Merge com default para garantir que todos os 7 dias existam, caso o formato antigo tenha sido salvo
          const fetchedHours = profile.business_hours as unknown as BusinessHours;
          setBusinessHours({ ...defaultHours, ...fetchedHours });
        } else {
          setBusinessHours(defaultHours);
        }

        // Fetch Services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', user.id);
        
        if (servicesData) {
          setServices(servicesData);
        }

        // Fetch Appointments
        const { data: apptsData } = await supabase
          .from('appointments')
          .select(`
            *,
            services (
              name
            )
          `)
          .eq('user_id', user.id);
        
        if (apptsData) {
          const formattedAppts = apptsData.map((a: any) => ({
            ...a,
            serviceName: a.services?.name || 'Serviço Removido',
            serviceId: a.service_id,
            clientName: a.client_name,
            startTime: a.start_time,
            endTime: a.end_time
          }));
          setAppointments(formattedAppts);
        }
    } catch (error) {
        console.error("Error refreshing Nailify data:", error);
    } finally {
        setIsLoading(false); // Finaliza o carregamento
    }
  }, [user]); // Depende apenas do usuário

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setServices([]);
      setAppointments([]);
      setBusinessHours(defaultHours);
      setIsLoading(false); // Se não há usuário, não há dados para carregar
    }
  }, [user, refreshData]); // Adicionado refreshData como dependência

  const addService = async (service: Omit<Service, 'id'>) => {
    if (!user) {
        throw new Error("AUTH_REQUIRED: User not authenticated or session not loaded.");
    }
    
    // Garantir que price e duration são números
    const priceValue = Number(service.price);
    const durationValue = Number(service.duration);

    if (isNaN(priceValue) || isNaN(durationValue)) {
        throw new Error("Price or duration is not a valid number.");
    }
    
    // Log para debug
    console.log("Attempting to insert service for user ID:", user.id);

    const payload = {
      user_id: user.id,
      name: service.name,
      description: service.description && service.description.trim() !== '' ? service.description : null, // Garante NULL se vazio
      duration: durationValue,
      price: priceValue,
    };

    const { error } = await supabase.from('services').insert(payload);
    
    if (error) {
        console.error("SUPABASE INSERT ERROR (Services):", error);
        throw error;
    }
    
    await refreshData();
  };

  const removeService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const updateBusinessHours = async (hours: BusinessHours) => {
    if (!user) return;
    
    // Usamos upsert para garantir que o perfil seja criado se não existir
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      business_hours: hours,
      updated_at: new Date().toISOString()
    });
    
    if (!error) setBusinessHours(hours);
    if (error) throw error;
  };

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'status'>) => {
    if (!user) return;
    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      service_id: appt.serviceId,
      client_name: appt.clientName,
      date: appt.date,
      start_time: appt.startTime,
      end_time: appt.endTime,
      status: 'confirmed'
    });
    if (error) throw error;
    await refreshData();
  };

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  const rescheduleAppointment = async (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    const { error } = await supabase.from('appointments').update({
      date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'rescheduled'
    }).eq('id', id);
    if (error) throw error;
    await refreshData();
  };

  return (
    <NailifyContext.Provider value={{
      services,
      addService,
      removeService,
      businessHours,
      updateBusinessHours,
      appointments,
      addAppointment,
      cancelAppointment,
      rescheduleAppointment,
      refreshData,
      isLoading // Exportando o estado de carregamento
    }}>
      {children}
    </NailifyContext.Provider>
  );
};

export const useNailify = () => {
  const context = useContext(NailifyContext);
  if (!context) throw new Error('useNailify must be used within a NailifyProvider');
  return context;
};