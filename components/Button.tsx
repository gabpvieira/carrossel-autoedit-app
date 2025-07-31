import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'font-semibold rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';
  
  const variantStyles = {
    primary: 'text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea] focus:ring-[#764ba2]',
    secondary: 'text-white glassmorphism hover:bg-white/20 focus:ring-gray-400',
    danger: 'text-white bg-gradient-to-r from-[#f5576c] to-[#f093fb] hover:from-[#f093fb] hover:to-[#f5576c] focus:ring-[#f5576c]',
    ghost: 'text-gray-300 bg-transparent hover:bg-white/10 shadow-none focus:ring-purple-500',
  };

  const sizeStyles = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button ref={ref} className={combinedClassName} {...props}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';