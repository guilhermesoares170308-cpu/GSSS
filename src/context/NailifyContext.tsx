import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

const defaultHours: BusinessHours = {
  weekdays: { enabled: true, start: '09:00', end: '18:00' },
  saturday: { enabled: true, start: '09:00', end: '14:00' },
  sunday: { enabled: false, start: '00:00', end: '00:00' },
};

const NailifyContext = createContext<NailifyContextType | undefined>(undefined);

export const NailifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultHours);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const refreshData = async () => {
    if (!user) return;

    // Fetch Profile (Business Hours)
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_hours')
      .eq('id', user.id)
      .single();
    
    if (profile?.business_hours) {
      setBusinessHours(profile.business_hours as unknown as BusinessHours);
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
  };

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setServices([]);
      setAppointments([]);
      setBusinessHours(defaultHours);
    }
  }, [user]);

  const addService = async (service: Omit<Service, 'id'>) => {
    if (!user) return;
    const { error } = await supabase.from('services').insert({
      user_id: user.id,
      ...service
    });
    if (!error) refreshData();
  };

  const removeService = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) refreshData();
  };

  const updateBusinessHours = async (hours: BusinessHours) => {
    if (!user) return;
    
    // Usamos upsert para garantir que o perfil seja criado se não existir
    // Isso corrige casos onde o trigger de criação falhou ou não rodou
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      business_hours: hours,
      updated_at: new Date().toISOString()
    });
    
    if (!error) setBusinessHours(hours);
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
    if (!error) refreshData();
  };

  const cancelAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    if (!error) refreshData();
  };

  const rescheduleAppointment = async (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    const { error } = await supabase.from('appointments').update({
      date: newDate,
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'rescheduled'
    }).eq('id', id);
    if (!error) refreshData();
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
      refreshData
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
