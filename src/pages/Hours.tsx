import React, { useState } from 'react';
import { useNailify } from '../context/NailifyContext';
import { BusinessHours, DaySchedule } from '../types';

const TimeInput = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <input 
    type="time" 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
  />
);

export const Hours = () => {
  const { businessHours, updateBusinessHours } = useNailify();
  const [hours, setHours] = useState<BusinessHours>(businessHours);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateBusinessHours(hours);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateDay = (key: keyof BusinessHours, field: keyof DaySchedule, value: any) => {
    setHours(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Horários de Atendimento</h2>
        <p className="text-gray-500">Defina quando você está disponível. Isso será a base para os agendamentos.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Weekdays */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="w-40">
              <h3 className="font-bold text-gray-900">Segunda a Sexta</h3>
              <p className="text-sm text-gray-500">Dias úteis</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hours.weekdays.enabled}
                  onChange={(e) => updateDay('weekdays', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
              {hours.weekdays.enabled && (
                <div className="flex items-center gap-2">
                  <TimeInput value={hours.weekdays.start} onChange={(v) => updateDay('weekdays', 'start', v)} />
                  <span className="text-gray-400">até</span>
                  <TimeInput value={hours.weekdays.end} onChange={(v) => updateDay('weekdays', 'end', v)} />
                </div>
              )}
            </div>
          </div>

          {/* Saturday */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="w-40">
              <h3 className="font-bold text-gray-900">Sábado</h3>
              <p className="text-sm text-gray-500">Fim de semana</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hours.saturday.enabled}
                  onChange={(e) => updateDay('saturday', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
              {hours.saturday.enabled && (
                <div className="flex items-center gap-2">
                  <TimeInput value={hours.saturday.start} onChange={(v) => updateDay('saturday', 'start', v)} />
                  <span className="text-gray-400">até</span>
                  <TimeInput value={hours.saturday.end} onChange={(v) => updateDay('saturday', 'end', v)} />
                </div>
              )}
            </div>
          </div>

          {/* Sunday */}
          <div className="flex items-center justify-between">
            <div className="w-40">
              <h3 className="font-bold text-gray-900">Domingo</h3>
              <p className="text-sm text-gray-500">Fim de semana</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hours.sunday.enabled}
                  onChange={(e) => updateDay('sunday', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
              {hours.sunday.enabled && (
                <div className="flex items-center gap-2">
                  <TimeInput value={hours.sunday.start} onChange={(v) => updateDay('sunday', 'start', v)} />
                  <span className="text-gray-400">até</span>
                  <TimeInput value={hours.sunday.end} onChange={(v) => updateDay('sunday', 'end', v)} />
                </div>
              )}
            </div>
          </div>

        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button 
            onClick={handleSave}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-sm"
          >
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};
