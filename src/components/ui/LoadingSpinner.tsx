import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  const classes = `${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`;

  return <Loader2 className={classes} />;
};

// Компонент для центрированного спиннера
export const CenteredSpinner: React.FC<LoadingSpinnerProps> = (props) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner {...props} />
  </div>
);

// Компонент для спиннера с текстом
export const LoadingWithText: React.FC<LoadingSpinnerProps & { text?: string }> = ({
  text = 'Загрузка...',
  ...props
}) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4">
    <LoadingSpinner {...props} />
    <p className="text-gray-600 text-sm">{text}</p>
  </div>
);

export default LoadingSpinner; 