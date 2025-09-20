import React, { useRef, useEffect, useState } from 'react';
import Icon from '../AppIcon';

const MessageContainer = ({ 
  messages = [], 
  isLoading = false, 
  isTyping = false,
  onMessageAction = () => {},
  currentUserId = 'user'
}) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
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
      typing: 'Escribiendo...',
      sent: 'Enviado',
      delivered: 'Entregado',
      read: 'Leído',
      failed: 'Error al enviar',
      retry: 'Reintentar',
      copy: 'Copiar',
      delete: 'Eliminar',
      today: 'Hoy',
      yesterday: 'Ayer'
    },
    en: {
      typing: 'Typing...',
      sent: 'Sent',
      delivered: 'Delivered',
      read: 'Read',
      failed: 'Failed to send',
      retry: 'Retry',
      copy: 'Copy',
      delete: 'Delete',
      today: 'Today',
      yesterday: 'Yesterday'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(currentLanguage === 'es' ? 'es-ES' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t.today;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t.yesterday;
    } else {
      return date.toLocaleDateString(currentLanguage === 'es' ? 'es-ES' : 'en-US');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Icon name="Check" size={12} className="text-secondary-400" />;
      case 'delivered':
        return <Icon name="CheckCheck" size={12} className="text-primary" />;
      case 'read':
        return <Icon name="CheckCheck" size={12} className="text-success" />;
      case 'failed':
        return <Icon name="AlertCircle" size={12} className="text-error" />;
      default:
        return null;
    }
  };

  const handleMessageClick = (message, action) => {
    onMessageAction(message, action);
  };

  const TypingIndicator = () => (
    <div className="flex items-start space-x-3 mb-4 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center">
        <Icon name="User" size={16} className="text-secondary-500" />
      </div>
      <div className="bg-surface rounded-bubble px-4 py-3 shadow-message max-w-xs">
        <div className="flex items-center space-x-1">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-start space-x-3 max-w-xs">
            {i % 2 === 1 && (
              <div className="w-8 h-8 rounded-full bg-secondary-200"></div>
            )}
            <div className="bg-secondary-100 rounded-bubble px-4 py-3 shimmer">
              <div className="h-4 bg-secondary-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-secondary-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const MessageBubble = ({ message, isOwn }) => (
    <div 
      className={`flex items-start space-x-3 mb-4 animate-fade-in ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
      onClick={() => handleMessageClick(message, 'select')}
    >
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-secondary-200 flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={16} className="text-secondary-500" />
        </div>
      )}
      
      <div className="flex flex-col max-w-lg lg:max-w-xl">
        <div 
          className={`message-bubble px-4 py-3 rounded-bubble cursor-pointer ${
            isOwn 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-surface shadow-message'
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </div>
        
        <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-text-muted">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <div className="flex items-center">
              {getStatusIcon(message.status)}
            </div>
          )}
        </div>
        
        {message.status === 'failed' && isOwn && (
          <button
            onClick={() => handleMessageClick(message, 'retry')}
            className="text-xs text-error hover:text-error-500 mt-1 self-end focus-ring rounded"
          >
            {t.retry}
          </button>
        )}
      </div>
    </div>
  );

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  const DateSeparator = ({ timestamp }) => (
    <div className="flex items-center justify-center my-6">
      <div className="bg-secondary-100 px-3 py-1 rounded-full">
        <span className="text-xs text-text-secondary font-medium">
          {formatDate(timestamp)}
        </span>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scrollbar-thin"
      style={{ 
        height: 'calc(100vh - 120px)', // Reduced from 140px to provide more scroll space
        paddingTop: '80px', // Account for fixed header
        paddingBottom: '60px' // Increased padding bottom for better message visibility above input
      }}
    >
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const isOwn = message.senderId === currentUserId;
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

            return (
              <React.Fragment key={message.id || index}>
                {showDateSeparator && <DateSeparator timestamp={message.timestamp} />}
                <MessageBubble message={message} isOwn={isOwn} />
              </React.Fragment>
            );
          })}
          
          {isTyping && <TypingIndicator />}
        </>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageContainer;