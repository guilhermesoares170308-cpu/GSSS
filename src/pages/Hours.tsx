import React, { useState } from 'react';
import { useNailify } from '../context/NailifyContext';
import { BusinessHours, DaySchedule } from '../types';
import { Check, Loader2 } from 'lucide-react';
import { showSuccess, showError, showLoading, dismissToast } from '../lib/toast';

const TimeInput = ({ value, onChange, disabled }: { value: string, onChange: (val: string) => void, disabled: boolean }) => (
  <input 
    type="time" 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors w-full"
  />
);

// Componente auxiliar para renderizar a linha de um dia
const DayRow: React.FC<{ dayKey: keyof BusinessHours, label: string, schedule: DaySchedule, updateDay: (key: keyof BusinessHours, field: keyof DaySchedule, value: any) => void }> = ({ dayKey, label, schedule, updateDay }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
        <div className="w-full md:w-40 mb-2 md:mb-0">
            <h3 className="font-bold text-gray-900">{label}</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            {/* Checkbox de Ativo */}
            <label className="flex items-center cursor-pointer shrink-0">
                <input 
                    type="checkbox" 
                    checked={schedule.enabled}
                    onChange={(e) => updateDay(dayKey, 'enabled', e.target.checked)}
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700 font-medium">Ativo</span>
            </label>
            
            {/* Inputs de Horário */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1">
                    <TimeInput 
                        value={schedule.start} 
                        onChange={(v) => updateDay(dayKey, 'start', v)} 
                        disabled={!schedule.enabled}
                    />
                </div>
                <span className="text-gray-400 shrink-0">até</span>
                <div className="flex-1">
                    <TimeInput 
                        value={schedule.end} 
                        onChange={(v) => updateDay(dayKey, 'end', v)} 
                        disabled={!schedule.enabled}
                    />
                </div>
            </div>
        </div>
    </div>
);

export const Hours = () => {
  const { businessHours, updateBusinessHours } = useNailify();
  const [hours, setHours] = useState<BusinessHours>(businessHours);
  const [loading, setLoading] = useState(false);

  // Sincroniza o estado local quando o contexto é atualizado
  React.useEffect(() => {
    setHours(businessHours);
  }, [businessHours]);

  const handleSave = async () => {
    setLoading(true);
    const toastId = showLoading('Salvando horários...');
    
    try {
        await updateBusinessHours(hours);
        showSuccess('Horários de atendimento salvos com sucesso!');
    } catch (error) {
        showError('Falha ao salvar horários. Tente novamente.');
        console.error(error);
    } finally {
        setLoading(false);
        dismissToast(toastId);
    }
  };

  const updateDay = (key: keyof BusinessHours, field: keyof DaySchedule, value: any) => {
    setHours(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };
  
  const days: { key: keyof BusinessHours, label: string }[] = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Horários de Atendimento</h2>
        <p className="text-gray-500">Defina quando você está disponível. Isso será a base para os agendamentos.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-2">
          
          {days.map(({ key, label }) => (
            <DayRow 
                key={key}
                dayKey={key}
                label={label}
                schedule={hours[key]}
                updateDay={updateDay}
            />
          ))}

        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-center"> {/* Alterado de justify-end para justify-center */}
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};