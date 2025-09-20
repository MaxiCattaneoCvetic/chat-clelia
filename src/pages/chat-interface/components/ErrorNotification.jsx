import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ErrorNotification = ({ 
  error = null,
  onRetry = () => {},
  onDismiss = () => {},
  autoHide = false,
  duration = 5000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
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

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, duration]);

  const translations = {
    es: {
      retry: 'Reintentar',
      dismiss: 'Cerrar',
      connectionError: 'Error de conexión',
      messageError: 'Error al enviar mensaje',
      genericError: 'Ha ocurrido un error',
      tryAgain: 'Inténtalo de nuevo'
    },
    en: {
      retry: 'Retry',
      dismiss: 'Dismiss',
      connectionError: 'Connection error',
      messageError: 'Message send error',
      genericError: 'An error occurred',
      tryAgain: 'Try again'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 200);
  };

  const handleRetry = () => {
    onRetry();
    handleDismiss();
  };

  if (!error || !isVisible) {
    return null;
  }

  const getErrorType = (errorMessage) => {
    if (typeof errorMessage === 'string') {
      if (errorMessage.toLowerCase().includes('conexión') || errorMessage.toLowerCase().includes('connection')) {
        return 'connection';
      }
      if (errorMessage.toLowerCase().includes('mensaje') || errorMessage.toLowerCase().includes('message')) {
        return 'message';
      }
    }
    return 'generic';
  };

  const errorType = getErrorType(error);
  const errorMessage = typeof error === 'string' ? error : t.genericError;

  return (
    <div className={`animate-slide-up ${className}`}>
      <div className="bg-error-50 border border-error-200 rounded-lg p-4 mx-4 mb-4 shadow-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon 
              name="AlertCircle" 
              size={20} 
              className="text-error-500"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-error-800 mb-1">
                  {errorType === 'connection' && t.connectionError}
                  {errorType === 'message' && t.messageError}
                  {errorType === 'generic' && t.genericError}
                </h4>
                <p className="text-sm text-error-700">
                  {errorMessage}
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 ml-2 text-error-400 hover:text-error-600 focus-ring rounded p-1 transition-colors"
                aria-label={t.dismiss}
              >
                <Icon name="X" size={16} />
              </button>
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleRetry}
                className="text-error-600 border-error-300 hover:bg-error-50"
              >
                <Icon name="RotateCw" size={14} className="mr-1" />
                {t.retry}
              </Button>
              
              <button
                onClick={handleDismiss}
                className="text-xs text-error-600 hover:text-error-800 font-medium focus-ring rounded px-2 py-1 transition-colors"
              >
                {t.dismiss}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorNotification;