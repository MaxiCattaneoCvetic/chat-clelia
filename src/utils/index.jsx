// Utility functions for the application

/**
 * Generates a unique conversation ID
 * @returns {string} A unique conversation identifier
 */
export const generateConversationId = () => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `conv_${timestamp}_${randomPart}`;
};

/**
 * Gets or creates a conversation ID from localStorage
 * @returns {string} The conversation ID for the current session
 */
export const getOrCreateConversationId = () => {
  try {
    const existingId = localStorage.getItem('conversationId');
    if (existingId) {
      return existingId;
    }
    
    const newId = generateConversationId();
    localStorage.setItem('conversationId', newId);
    return newId;
  } catch (error) {
    // Fallback if localStorage is not available
    console.warn('localStorage not available, generating temporary conversation ID');
    return generateConversationId();
  }
};

/**
 * Clears the current conversation ID (for starting a new conversation)
 */
export const clearConversationId = () => {
  try {
    localStorage.removeItem('conversationId');
  } catch (error) {
    console.warn('Could not clear conversation ID from localStorage');
  }
};