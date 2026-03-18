// API service for serverless functions

// Get base URL based on environment
const getBaseUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // For Netlify, use the deployed server URL
  if (import.meta.env.MODE === 'netlify' || import.meta.env.VITE_PLATFORM === 'netlify') {
    return import.meta.env.VITE_API_BASE_URL || 'https://your-server-url.com/api';
  }
  
  // Default for Vercel and other platforms
  return '/api';
};

const BASE_URL = getBaseUrl();

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Rewards API
export const rewardsAPI = {
  // Daily login reward
  claimDailyLogin: async (userId) => {
    return apiRequest('/rewards/daily-login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Get user wallet
  getWallet: async (userId) => {
    return apiRequest(`/rewards/wallet/${userId}`);
  },

  // Download resource
  downloadResource: async (resourceId, userId) => {
    return apiRequest(`/rewards/download/${resourceId}`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Accept answer
  acceptAnswer: async (doubtId, answerId, authorId) => {
    return apiRequest('/rewards/accept-answer', {
      method: 'POST',
      body: JSON.stringify({ doubtId, answerId, authorId }),
    });
  },

  // Attend event
  attendEvent: async (eventId, studentId, eventCoins) => {
    return apiRequest('/rewards/attend-event', {
      method: 'POST',
      body: JSON.stringify({ eventId, studentId, eventCoins }),
    });
  },

  // Fiat purchase webhook
  processFiatPurchase: async (webhookData) => {
    return apiRequest('/rewards/fiat-webhook', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  },
};

// Export default API service
export default {
  apiRequest,
  rewardsAPI,
};
