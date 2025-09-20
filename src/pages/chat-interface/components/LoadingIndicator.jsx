import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const LoadingIndicator = ({ 
  isVisible = false,
  message = '',
  type = 'sending', // 'sending', 'connecting', 'typing'
  className = ''
}) => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [dots, setDots] = useState('');

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

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  const translations = {
    es: {
      sending: 'Enviando mensaje',
      connecting: 'Conectando',
      typing: 'Escribiendo',
      processing: 'Procesando'
    },
    en: {
      sending: 'Sending message',
      connecting: 'Connecting',
      typing: 'Typing',
      processing: 'Processing'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const getLoadingConfig = () => {
    switch (type) {
      case 'sending':
        return {
          icon: 'Send',
          text: message || t.sending,
          color: 'text-primary',
          bgColor: 'bg-primary-50',
          animate: 'animate-pulse'
        };
      case 'connecting':
        return {
          icon: 'RotateCw',
          text: message || t.connecting,
          color: 'text-warning',
          bgColor: 'bg-warning-50',
          animate: 'animate-spin'
        };
      case 'typing':
        return {
          icon: 'MessageCircle',
          text: message || t.typing,
          color: 'text-secondary-500',
          bgColor: 'bg-secondary-50',
          animate: 'animate-pulse'
        };
      default:
        return {
          icon: 'RotateCw',
          text: message || t.processing,
          color: 'text-secondary-500',
          bgColor: 'bg-secondary-50',
          animate: 'animate-spin'
        };
    }
  };

  if (!isVisible) {
    return null;
  }

  const config = getLoadingConfig();

  return (
    <div className={`flex items-center justify-center p-3 ${config.bgColor} rounded-lg mx-4 mb-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Icon 
          name={config.icon} 
          size={16} 
          className={`${config.color} ${config.animate}`}
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}{dots}
        </span>
      </div>
    </div>
  );
};

export default LoadingIndicator;