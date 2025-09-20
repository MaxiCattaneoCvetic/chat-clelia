import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const ConnectionStatus = ({ 
  status = 'connected',
  onRetry = () => {},
  className = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'es';
    setCurrentLanguage(savedLanguage);

    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.language) {
        setCurrentLanguage(event.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const translations = {
    es: {
      connected: 'Conectado',
      connecting: 'Conectando...',
      disconnected: 'Sin conexión',
      reconnecting: 'Reconectando...',
      retry: 'Reintentar',
      checkConnection: 'Verificar conexión'
    },
    en: {
      connected: 'Connected',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      reconnecting: 'Reconnecting...',
      retry: 'Retry',
      checkConnection: 'Check connection'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: 'Wifi',
          color: 'text-success',
          bgColor: 'bg-success-50',
          text: t.connected,
          showRetry: false,
          animate: false
        };
      case 'connecting':
        return {
          icon: 'RotateCw',
          color: 'text-warning',
          bgColor: 'bg-warning-50',
          text: t.connecting,
          showRetry: false,
          animate: true
        };
      case 'reconnecting':
        return {
          icon: 'RotateCw',
          color: 'text-warning',
          bgColor: 'bg-warning-50',
          text: t.reconnecting,
          showRetry: false,
          animate: true
        };
      case 'disconnected':
        return {
          icon: 'WifiOff',
          color: 'text-error',
          bgColor: 'bg-error-50',
          text: t.disconnected,
          showRetry: true,
          animate: false
        };
      default:
        return {
          icon: 'Wifi',
          color: 'text-secondary-400',
          bgColor: 'bg-secondary-50',
          text: t.connected,
          showRetry: false,
          animate: false
        };
    }
  };

  const config = getStatusConfig();

  if (status === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <div className={`flex items-center justify-center p-2 ${config.bgColor} border-b border-border ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon 
          name={config.icon} 
          size={16} 
          className={`${config.color} ${config.animate ? 'animate-spin' : ''}`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        {config.showRetry && (
          <button
            onClick={onRetry}
            className="ml-2 text-sm text-error-600 hover:text-error-800 font-medium focus-ring rounded px-2 py-1 transition-colors"
            aria-label={t.retry}
          >
            {t.retry}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;