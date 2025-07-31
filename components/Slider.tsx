import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex justify-between items-center text-xs font-medium text-gray-400">
        <span>{label}</span>
        <span>{Number(value).toFixed(2)}x</span>
      </label>
      <input
        type="range"
        value={value}
        {...props}
        className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
      />
    </div>
  );
};