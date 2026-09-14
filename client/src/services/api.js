// API service for serverless functions & custom backend endpoints

// Get base URL based on environment
const getBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  if (configuredBase && !configuredBase.includes('your-backend-server') && !configuredBase.includes('your-server-url')) {
    return configuredBase.replace(/\/api\/?$/, '').replace(/\/$/, '') + '/api';
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

// Generic resilient API request function
export const apiRequest = async (endpoint, options = {}) => {
  const base = getBaseUrl();
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const candidates = [
    `${base}${normalizedEndpoint}`,
    `/api${normalizedEndpoint}`,
    `http://localhost:5000/api${normalizedEndpoint}`
  ];

  const uniqueCandidates = [...new Set(candidates)];
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let lastError = null;

  for (const url of uniqueCandidates) {
    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        const errMsg = data.message || data.error || `HTTP error ${response.status}`;
        const err = new Error(errMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (err) {
      lastError = err;
      // If client-level response error with HTTP status (e.g. 400 bad request, 401 unauthorized, 403 forbidden), don't retry other candidates
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }
    }
  }

  throw lastError || new Error('Network request failed across all candidate endpoints.');
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

// Auth Policy & Registration OTP API
export const authAPI = {
  getPolicy: async () => {
    return apiRequest('/auth/policy');
  },
  sendRegistrationOTP: async ({ email, name }) => {
    return apiRequest('/auth/send-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  },
  verifyRegistrationOTP: async ({ email, otp, password, name }) => {
    return apiRequest('/auth/verify-registration-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password, name }),
    });
  },
};

// Admin Auth Settings API
export const adminAuthAPI = {
  getAuthSettings: async (token) => {
    return apiRequest('/admin/auth-settings', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  updateAuthSettings: async (token, { allow_non_college_emails, allowed_domains }) => {
    return apiRequest('/admin/auth-settings', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ allow_non_college_emails, allowed_domains }),
    });
  },
};

// Export default API service
export default {
  apiRequest,
  rewardsAPI,
  authAPI,
  adminAuthAPI,
};
