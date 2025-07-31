import React from 'react';
import { Resolution } from '../types';
import { ptBR } from '../locales/pt-BR';
import { IconScale } from './icons';

interface ResolutionSelectorProps {
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({ resolution, setResolution }) => {
  return (
    <div className="glassmorphism p-4 rounded-xl">
      <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
        <IconScale className="w-5 h-5 text-purple-300"/>
        {ptBR.resolution}
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <RadioOption
          id="standard"
          name="resolution"
          checked={resolution === 'standard'}
          onChange={() => setResolution('standard')}
          label={ptBR.resolutionStandard}
          description={ptBR.resolutionStandardSub}
        />
        <RadioOption
          id="high"
          name="resolution"
          checked={resolution === 'high'}
          onChange={() => setResolution('high')}
          label={ptBR.resolutionHigh}
          description={ptBR.resolutionHighSub}
        />
      </div>
    </div>
  );
};

const RadioOption: React.FC<{
    id: string;
    name: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
}> = ({ id, name, checked, onChange, label, description }) => (
    <label htmlFor={id} className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all ${checked ? 'border-purple-500 bg-purple-500/20' : 'border-gray-600 bg-white/5 hover:bg-white/10'}`}>
        <div className="flex items-center">
            <input
                type="radio"
                id={id}
                name={name}
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 accent-purple-500 mt-0.5 self-start bg-transparent"
            />
            <div className="ml-3">
                <span className={`block text-sm font-bold ${checked ? 'text-white' : 'text-gray-300'}`}>{label}</span>
                <span className={`block text-xs ${checked ? 'text-purple-300' : 'text-gray-400'}`}>{description}</span>
            </div>
        </div>
    </label>
);