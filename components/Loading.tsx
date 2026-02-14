'use client';

/**
 * Loading Component
 * 
 * Reusable loading spinner with optional text.
 */

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({ 
  text = 'Loading...', 
  size = 'md',
  fullScreen = false 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const content = (
    <div className="flex flex-col items-center">
      <div 
        className={`${sizeClasses[size]} border-slate-200 border-t-primary-600 rounded-full animate-spin`}
      />
      {text && (
        <p className={`mt-4 text-slate-600 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  );
}

export default Loading;
