"use client";

interface InfoBannerProps {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
}

export function InfoBanner({ type, title, description }: InfoBannerProps) {
  const styles = {
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-700/40',
      iconColor: 'text-green-400',
      titleColor: 'text-green-300',
      descColor: 'text-green-200/80',
    },
    info: {
      bg: 'bg-purple-900/20',
      border: 'border-purple-700/40',
      iconColor: 'text-purple-400',
      titleColor: 'text-purple-300',
      descColor: 'text-purple-200/80',
    },
    warning: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-700/40',
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-300',
      descColor: 'text-yellow-200/80',
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-700/40',
      iconColor: 'text-red-400',
      titleColor: 'text-red-300',
      descColor: 'text-red-200/80',
    },
  };

  const style = styles[type];

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <svg className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <div className="flex-1">
          <p className={`text-sm font-medium ${style.titleColor}`}>{title}</p>
          <p className={`text-xs ${style.descColor} mt-1`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
