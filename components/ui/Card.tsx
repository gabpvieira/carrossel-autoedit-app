import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const combinedClassName = `dark-card glassmorphism rounded-2xl p-6 shadow-2xl transition-all duration-300 ease-in-out hover:shadow-purple-500/20 hover:border-purple-500/30 ${onClick ? 'cursor-pointer hover:scale-105' : ''} ${className}`;
  
  return (
    <div className={combinedClassName} onClick={onClick}>
      {children}
    </div>
  );
};
