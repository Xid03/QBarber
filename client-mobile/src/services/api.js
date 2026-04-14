import axios from 'axios';

const FALLBACK_API_URL = 'http://localhost:5000/api';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || FALLBACK_API_URL;
let authToken = null;

export const mobileApiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

mobileApiClient.interceptors.request.use((config) => {
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
    const response = await mobileApiClient.request(config);
    return response.data;
  } catch (error) {
    const nextError = new Error(extractErrorMessage(error, fallbackMessage));
    nextError.cause = error;
    throw nextError;
  }
}

export function setMobileAuthToken(token) {
  authToken = token || null;
}

export function getMobileApiBaseUrl() {
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
      'Unable to restore the current session.'
    )
};

export const shopsAPI = {
  list: () =>
    request(
      {
        method: 'get',
        url: '/shops'
      },
      'Unable to load nearby branches.'
    )
};

export const barbersAPI = {
  list: (shopId) =>
    request(
      {
        method: 'get',
        url: '/barbers',
        params: { shopId }
      },
      'Unable to load the barber lineup.'
    )
};

export const queueAPI = {
  join: (payload) =>
    request(
      {
        method: 'post',
        url: '/queue/join',
        data: payload
      },
      'Unable to join the queue.'
    ),
  status: (shopId) =>
    request(
      {
        method: 'get',
        url: `/queue/status/${shopId}`
      },
      'Unable to load the queue status.'
    ),
  myPosition: (shopId) =>
    request(
      {
        method: 'get',
        url: '/queue/my-position',
        params: { shopId }
      },
      'Unable to load your queue position.'
    ),
  leave: (queueEntryId, reason = 'Left from mobile app.') =>
    request(
      {
        method: 'delete',
        url: `/queue/leave/${queueEntryId}`,
        data: { reason }
      },
      'Unable to leave the queue.'
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
      'Unable to load premium slots.'
    ),
  create: (payload) =>
    request(
      {
        method: 'post',
        url: '/bookings',
        data: payload
      },
      'Unable to create the booking.'
    ),
  mine: (params = {}) =>
    request(
      {
        method: 'get',
        url: '/bookings/my-bookings',
        params
      },
      'Unable to load your bookings.'
    ),
  pay: (bookingId, amount) =>
    request(
      {
        method: 'post',
        url: `/bookings/${bookingId}/pay`,
        data: { amount }
      },
      'Unable to complete the payment.'
    ),
  cancel: (bookingId, reason = 'Cancelled from mobile app.') =>
    request(
      {
        method: 'put',
        url: `/bookings/${bookingId}/cancel`,
        data: { reason }
      },
      'Unable to cancel the booking.'
    ),
  checkIn: (bookingId, qrCode) =>
    request(
      {
        method: 'post',
        url: `/bookings/${bookingId}/checkin`,
        data: { qrCode }
      },
      'Unable to check in the booking.'
    )
};

export const notificationsAPI = {
  list: (userId) =>
    request(
      {
        method: 'get',
        url: '/notifications',
        params: userId ? { userId } : {}
      },
      'Unable to load notifications.'
    ),
  markRead: (notificationId) =>
    request(
      {
        method: 'patch',
        url: `/notifications/${notificationId}/read`
      },
      'Unable to mark the notification as read.'
    )
};
