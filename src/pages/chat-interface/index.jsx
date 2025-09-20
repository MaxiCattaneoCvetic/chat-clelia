import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import ChatContainer from './components/ChatContainer';
import ConnectionStatus from './components/ConnectionStatus';
import ErrorNotification from './components/ErrorNotification';
import LoadingIndicator from './components/LoadingIndicator';
import { BRAND_NAME } from '../../data';

const ChatInterface = () => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      title: `Chat de Soporte - ${BRAND_NAME}`,
      description: 'Interfaz de chat en tiempo real para soporte técnico y atención al cliente',
      keywords: 'chat, soporte, técnico, scooter, reparación, atención al cliente'
    },
    en: {
      title: `Support Chat - ${BRAND_NAME}`,
      description: 'Real-time chat interface for technical support and customer service',
      keywords: 'chat, support, technical, scooter, repair, customer service'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const handleConnectionRetry = () => {
    setConnectionStatus('reconnecting');
    setError(null);
    
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  const handleErrorRetry = () => {
    setError(null);
    setIsLoading(false);
  };

  const handleErrorDismiss = () => {
    setError(null);
  };

  return (
    <>
      <Helmet>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
        <meta name="keywords" content={t.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/chat-interface" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Connection Status Banner */}
        <ConnectionStatus
          status={connectionStatus}
          onRetry={handleConnectionRetry}
        />

        {/* Error Notification */}
        <ErrorNotification
          error={error}
          onRetry={handleErrorRetry}
          onDismiss={handleErrorDismiss}
          autoHide={false}
        />

        {/* Loading Indicator */}
        <LoadingIndicator
          isVisible={isLoading}
          type="connecting"
        />

        {/* Main Chat Container */}
        <ChatContainer />
      </div>
    </>
  );
};

export default ChatInterface;