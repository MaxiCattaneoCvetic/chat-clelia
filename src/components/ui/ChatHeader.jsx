import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const ChatHeader = ({ 
  brandName = "Clinica Clelia Schajris", 
  logoUrl = "/assets/images/Captura_de_pantalla_2025-07-02_002719-1751426865156.png",
  connectionStatus = "connected",
  brandColor = "#2563EB" 
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
      disconnected: 'Desconectado',
      reconnecting: 'Reconectando...',
      online: 'En línea',
      offline: 'Fuera de línea ' 
    },
    en: {
      connected: 'Connected',
      connecting: 'Connecting...',
      disconnected: 'Disconnected',
      reconnecting: 'Reconnecting...',
      online: 'Online',
      offline: 'Offline'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-success';
      case 'connecting': case'reconnecting':
        return 'text-warning';
      case 'disconnected':
        return 'text-error';
      default:
        return 'text-secondary-400';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Wifi';
      case 'connecting': case'reconnecting':
        return 'RotateCw';
      case 'disconnected':
        return 'WifiOff';
      default:
        return 'Wifi';
    }
  };

  const getStatusText = () => {
    return t[connectionStatus] || t.connected;
  };

  const LogoComponent = () => {
   if (logoUrl) { 
      return (
        <img 
          src="/assets/images/Captura_de_pantalla_2025-07-02_002719-1751426865156.png"
          alt={`${brandName} logo`}
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
          style={{ backgroundColor: brandColor }}
        >
          {brandName.charAt(0).toUpperCase()}
        </div>
        <span className="font-semibold text-text-primary text-lg">
          {brandName}
        </span>
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-surface border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        {/* Brand Section */}
        <div className="flex items-center space-x-3">
          <LogoComponent />
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <Icon 
            name={getStatusIcon()} 
            size={16} 
            className={`${getStatusColor()} ${connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'animate-spin' : ''}`}
          />
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;