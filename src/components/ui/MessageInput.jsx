import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const MessageInput = ({ 
  onSendMessage = () => {},
  isLoading = false,
  disabled = false,
  placeholder = "",
  maxLength = 1000,
  allowAttachments = false,
  onAttachmentSelect = () => {}
}) => {
  const [message, setMessage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

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
      placeholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      attach: 'Adjuntar archivo',
      maxLength: 'Máximo {max} caracteres',
      remaining: '{count} caracteres restantes'
    },
    en: {
      placeholder: 'Type your message...',
      send: 'Send',
      attach: 'Attach file',
      maxLength: 'Maximum {max} characters',
      remaining: '{count} characters remaining'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || disabled) {
      return;
    }

    const messageToSend = message.trim();
    setMessage('');
    
    try {
      await onSendMessage(messageToSend);
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageToSend);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };

  const handleAttachmentClick = () => {
    if (allowAttachments && !disabled && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onAttachmentSelect(files);
    }
    // Reset file input
    e.target.value = '';
  };

  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars <= 50;
  const canSend = message.trim().length > 0 && !isLoading && !disabled;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border shadow-lg">
      <div className="max-w-4xl mx-auto p-2">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Attachment Button */}
          {allowAttachments && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleAttachmentClick}
                disabled={disabled || isLoading}
                className="flex-shrink-0 p-2"
                aria-label={t.attach}
              >
                <Icon name="Paperclip" size={20} className="text-secondary-500" />
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,application/pdf,.doc,.docx,.txt"
              />
            </>
          )}

          {/* Message Input Container */}
          <div className="flex-1 relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={placeholder || t.placeholder}
                disabled={disabled || isLoading}
                className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 pr-12 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] max-h-32 scrollbar-thin"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '44px',
                  maxHeight: '128px'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              
              {/* Character Counter */}
              {isNearLimit && (
                <div className="absolute -top-6 right-0">
                  <span className={`text-xs ${remainingChars <= 10 ? 'text-error' : 'text-warning'}`}>
                    {remainingChars}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canSend}
            loading={isLoading}
            className="flex-shrink-0 px-4 py-3"
            aria-label={t.send}
          >
            {isLoading ? (
              <Icon name="RotateCw" size={18} className="animate-spin" />
            ) : (
              <Icon name="Send" size={18} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;