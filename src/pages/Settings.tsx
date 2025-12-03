import React from 'react';
import { ProfileSettingsForm } from '../components/ProfileSettingsForm';
import { EmailSettingsForm } from '../components/EmailSettingsForm';
import { PasswordSettingsForm } from '../components/PasswordSettingsForm';

export const Settings = () => {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações da Conta</h2>
        <p className="text-gray-500">Gerencie seus dados pessoais e credenciais de acesso.</p>
      </div>

      <div className="space-y-6">
        <ProfileSettingsForm />
        <EmailSettingsForm />
        <PasswordSettingsForm />
      </div>
    </div>
  );
};