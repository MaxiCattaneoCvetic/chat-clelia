import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from '../../../components/ui/ChatHeader';
import MessageContainer from '../../../components/ui/MessageContainer';
import MessageInput from '../../../components/ui/MessageInput';
import { getOrCreateConversationId } from '../../../utils';
import axios from 'axios';
import { BRAND_NAME, WEBHOOK_URL } from '../../../data';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const retryTimeoutRef = useRef(null);
  const brandName = BRAND_NAME

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'es';
    setCurrentLanguage(savedLanguage);
    
    // Initialize conversation ID
    const chatId = getOrCreateConversationId();
    setConversationId(chatId);
    console.log('Chat initialized with conversation ID:', chatId);

    const handleLanguageChange = (event) => {
      if (event.detail && event.detail.language) {
        setCurrentLanguage(event.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const translations = {
    es: {
      connectionError: 'Error de conexión. Reintentando...',
      messageFailed: 'No se pudo enviar el mensaje',
      retry: 'Reintentar',
      placeholder: 'Escribe tu mensaje...',
      brandName: brandName,
      webhookError: 'Error al conectar con el servidor',
      emptyResponse: 'Respuesta vacía del servidor'
    },
    en: {
      connectionError: 'Connection error. Retrying...',
      messageFailed: 'Failed to send message',
      retry: 'Retry',
      placeholder: 'Type your message...',
      brandName: brandName,
      webhookError: 'Error connecting to server',
      emptyResponse: 'Empty response from server'
    }
  };

  const t = translations[currentLanguage] || translations.es;

  const sendMessageToWebhook = async (messageContent) => {
    try {
      setConnectionStatus('connecting');
      
      const payload = {
        message: messageContent,
        conversationId: conversationId,
        timestamp: new Date().toISOString(),
        userId: 'user' // Optional: Add user identifier
      };

      const response = await axios.post(
        WEBHOOK_URL,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000 // Increased timeout for webhook response
        }
      );

      setConnectionStatus('connected');
      return response.data;
    } catch (error) {
      console.error('Webhook error:', error);
      setConnectionStatus('disconnected');
      throw error;
    }
  };

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    const userMessage = {
      id: Date.now(),
      senderId: 'user',
      content: messageContent,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' } 
            : msg
        )
      );

      // Send to webhook and get real response
      const webhookResponse = await sendMessageToWebhook(messageContent);
      
      // Update to delivered
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      );

      // Show typing indicator while processing response
      setIsTyping(true);
      
      // Process webhook response
      setTimeout(() => {
        setIsTyping(false);
        
        // Extract response message from webhook response
        let responseContent = '';
        
        if (webhookResponse) {
          if (typeof webhookResponse === 'string') {
            responseContent = webhookResponse;
          } else if (webhookResponse.message) {
            responseContent = webhookResponse.message;
          } else if (webhookResponse.response) {
            responseContent = webhookResponse.response;
          } else if (webhookResponse.text) {
            responseContent = webhookResponse.text;
          } else if (webhookResponse.data) {
            responseContent = typeof webhookResponse.data === 'string' ? webhookResponse.data : JSON.stringify(webhookResponse.data);
          } else {
            responseContent = JSON.stringify(webhookResponse);
          }
        }

        // If response is empty, show error message
        if (!responseContent || responseContent.trim() === '') {
          responseContent = t.emptyResponse;
        }

        const agentResponse = {
          id: Date.now() + 1,
          senderId: 'agent',
          content: responseContent,
          timestamp: new Date(),
          status: 'delivered'
        };

        setMessages(prev => {
          // Mark user message as read
          const updatedMessages = prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'read' } 
              : msg
          );
          return [...updatedMessages, agentResponse];
        });
      }, 500); // Small delay to show typing indicator

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      let errorMessage = t.messageFailed;
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `${t.webhookError}: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        errorMessage = t.connectionError;
      } else {
        // Other error
        errorMessage = error.message || t.messageFailed;
      }
      
      setError(errorMessage);
      
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'failed' } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageAction = (message, action) => {
    switch (action) {
      case 'retry':
        if (message.status === 'failed') {
          handleSendMessage(message.content);
          // Remove the failed message
          setMessages(prev => prev.filter(msg => msg.id !== message.id));
        }
        break;
      case 'select':
        // Handle message selection if needed
        break;
      default:
        break;
    }
  };

  const handleRetryConnection = () => {
    setConnectionStatus('reconnecting');
    setError(null);
    
    retryTimeoutRef.current = setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <ChatHeader
        brandName={t.brandName}
        logoUrl={null}
        connectionStatus={connectionStatus}
        brandColor="#2563EB"
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-error-50 border-l-4 border-error px-4 py-3 mx-4 mt-2 rounded">
          <div className="flex items-center justify-between">
            <p className="text-sm text-error-700">{error}</p>
            <button
              onClick={handleRetryConnection}
              className="text-sm text-error-600 hover:text-error-800 font-medium focus-ring rounded px-2 py-1"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )}

      {/* Message Container */}
      <MessageContainer
        messages={messages}
        isLoading={false}
        isTyping={isTyping}
        onMessageAction={handleMessageAction}
        currentUserId="user"
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={connectionStatus === 'disconnected'}
        placeholder={t.placeholder}
        maxLength={1000}
        allowAttachments={false}
      />
    </div>
  );
};

export default ChatContainer;