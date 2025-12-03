export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
};

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'rescheduled';

export type Appointment = {
  id: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO Date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AppointmentStatus;
};

export type DaySchedule = {
  enabled: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
};

export type BusinessHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};