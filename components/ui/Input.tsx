import React, { useState } from 'react';
import { IconMail, IconLock, IconEye, IconEyeOff } from '../icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

export const Input: React.FC<InputProps> = ({ type = 'text', label, id, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

  const Icon = type === 'email' ? IconMail : IconLock;

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        id={id}
        type={currentType}
        placeholder=" " // Important for floating label
        {...props}
        className="dark-input block w-full pl-10 pr-4 py-3 text-white rounded-lg appearance-none focus:outline-none peer floating-label-input"
      />
      <label
        htmlFor={id}
        className="absolute text-sm text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-10 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
        >
          {isPasswordVisible ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};
