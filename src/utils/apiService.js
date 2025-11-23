import axios from 'axios';

// API Key - Replace with your actual OpenAI API key
// IMPORTANT: Do not commit your actual API key to version control
// For local development, set your API key here
// For production, use environment variables or secure storage
const API_KEY = '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'; // Replace with your actual API key

const instance = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

export const modelMapping = {
  'GPT-4.5 Turbo': 'gpt-4-turbo-preview',
  'GPT-5': 'gpt-4',  // Note: GPT-5 doesn't exist yet, using gpt-4 as placeholder
  'GPT-4o': 'gpt-4o-mini',
  'GPT-4o Mini': 'gpt-3.5-turbo'
};

export const sendMessage = async (message, model) => {
  try {
    const actualModel = modelMapping[model] || 'gpt-3.5-turbo';
    
    const response = await instance.post('/chat/completions', {
      model: actualModel,
      messages: [
        { role: 'user', content: message }
      ],
      temperature: 0.7
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('API request error:', error);
    throw new Error('Failed to get AI response');
  }
};

// Add a function to send messages with conversation history
export const sendMessageWithHistory = async (messages, model) => {
  try {
    const actualModel = modelMapping[model] || 'gpt-3.5-turbo';
    
    const response = await instance.post('/chat/completions', {
      model: actualModel,
      messages: messages,
      temperature: 0.7
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('API request error:', error);
    throw new Error('Failed to get AI response');
  }
};
