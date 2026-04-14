import axios from 'axios';

const FALLBACK_API_URL = 'http://localhost:5000/api';

const apiBaseUrl = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
let authToken = null;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const nextConfig = { ...config };

  if (!nextConfig.skipAuth && authToken) {
    nextConfig.headers = {
      ...(nextConfig.headers || {}),
      Authorization: `Bearer ${authToken}`
    };
  }

  return nextConfig;
});

function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

async function request(config, fallbackMessage) {
  try {
    const response = await apiClient.request(config);
    return response.data;
  } catch (error) {
    const nextError = new Error(extractErrorMessage(error, fallbackMessage));
    nextError.cause = error;
    throw nextError;
  }
}

export function setWebAuthToken(token) {
  authToken = token || null;
}

export function getWebApiBaseUrl() {
  return apiBaseUrl;
}

export const authAPI = {
  login: (payload) =>
    request(
      {
        method: 'post',
        url: '/auth/login',
        data: payload,
        skipAuth: true
      },
      'Unable to sign in right now.'
    ),
  me: () =>
    request(
      {
        method: 'get',
        url: '/auth/me'
      },
      'Unable to load your session.'
    )
};

export const shopsAPI = {
  list: (params = {}) =>
    request(
      {
        method: 'get',
        url: '/shops',
        params
      },
      'Unable to load shops.'
    ),
  get: (shopId) =>
    request(
      {
        method: 'get',
        url: `/shops/${shopId}`
      },
      'Unable to load the selected shop.'
    ),
  update: (shopId, payload) =>
    request(
      {
        method: 'put',
        url: `/shops/${shopId}`,
        data: payload
      },
      'Unable to save shop settings.'
    )
};

export const barbersAPI = {
  list: (params = {}) =>
    request(
      {
        method: 'get',
        url: '/barbers',
        params
      },
      'Unable to load barbers.'
    ),
  create: (payload) =>
    request(
      {
        method: 'post',
        url: '/barbers',
        data: payload
      },
      'Unable to create the barber.'
    ),
  update: (barberId, payload) =>
    request(
      {
        method: 'put',
        url: `/barbers/${barberId}`,
        data: payload
      },
      'Unable to update the barber.'
    )
};

export const queueAPI = {
  status: (shopId) =>
    request(
      {
        method: 'get',
        url: `/queue/status/${shopId}`
      },
      'Unable to load the live queue.'
    ),
  history: (shopId) =>
    request(
      {
        method: 'get',
        url: '/queue/history',
        params: { shopId }
      },
      'Unable to load queue history.'
    ),
  callNext: (payload) =>
    request(
      {
        method: 'post',
        url: '/queue/call-next',
        data: payload
      },
      'Unable to call the next customer.'
    ),
  startService: (queueEntryId, payload) =>
    request(
      {
        method: 'put',
        url: `/queue/${queueEntryId}/start`,
        data: payload
      },
      'Unable to start the selected service.'
    ),
  completeService: (queueEntryId) =>
    request(
      {
        method: 'put',
        url: `/queue/${queueEntryId}/complete`
      },
      'Unable to complete the service.'
    ),
  markNoShow: (queueEntryId) =>
    request(
      {
        method: 'put',
        url: `/queue/${queueEntryId}/no-show`
      },
      'Unable to mark the customer as no-show.'
    ),
  pause: (payload) =>
    request(
      {
        method: 'post',
        url: '/queue/pause',
        data: payload
      },
      'Unable to pause the queue.'
    ),
  resume: (payload) =>
    request(
      {
        method: 'post',
        url: '/queue/resume',
        data: payload
      },
      'Unable to resume the queue.'
    ),
  join: (payload, options = {}) =>
    request(
      {
        method: 'post',
        url: '/queue/join',
        data: payload,
        skipAuth: options.skipAuth
      },
      'Unable to add the customer to the queue.'
    )
};

export const bookingsAPI = {
  slots: (params) =>
    request(
      {
        method: 'get',
        url: '/bookings/slots',
        params
      },
      'Unable to load available slots.'
    ),
  myBookings: (params = {}) =>
    request(
      {
        method: 'get',
        url: '/bookings/my-bookings',
        params
      },
      'Unable to load bookings.'
    ),
  adminList: (params = {}) =>
    request(
      {
        method: 'get',
        url: '/admin/bookings',
        params
      },
      'Unable to load admin bookings.'
    ),
  updateAdmin: (bookingId, payload) =>
    request(
      {
        method: 'put',
        url: `/admin/bookings/${bookingId}`,
        data: payload
      },
      'Unable to update the booking.'
    )
};

export const analyticsAPI = {
  summary: (params = {}) =>
    request(
      {
        method: 'get',
        url: '/analytics',
        params
      },
      'Unable to load analytics.'
    )
};
