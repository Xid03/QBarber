export const previewModes = ['live', 'loading', 'empty', 'error'];

export const branches = [
  {
    id: 'central',
    name: 'QBarber Central',
    district: 'Bukit Bintang',
    distance: '1.2 km away',
    waitMinutes: 45,
    highlight: 'Fastest lane today'
  },
  {
    id: 'ttdi',
    name: 'QBarber TTDI',
    district: 'TTDI',
    distance: '4.6 km away',
    waitMinutes: 18,
    highlight: 'Most premium slots open'
  },
  {
    id: 'mont',
    name: 'QBarber Mont Kiara',
    district: 'Mont Kiara',
    distance: '7.1 km away',
    waitMinutes: 28,
    highlight: 'Late-night branch'
  }
];

export const barbers = [
  {
    id: 'ali',
    name: 'Ali',
    specialty: 'Skin fade',
    average: '24 min avg',
    status: 'online',
    rating: '4.9'
  },
  {
    id: 'nora',
    name: 'Nora',
    specialty: 'Texture crop',
    average: '27 min avg',
    status: 'online',
    rating: '4.8'
  },
  {
    id: 'hakim',
    name: 'Hakim',
    specialty: 'Beard sculpt',
    average: '31 min avg',
    status: 'break',
    rating: '4.7'
  },
  {
    id: 'mina',
    name: 'Mina',
    specialty: 'Premium styling',
    average: '29 min avg',
    status: 'online',
    rating: '5.0'
  }
];

export const queueSnapshot = {
  waitingCount: 8,
  activeBarbers: 3,
  totalBarbers: 4,
  estimatedWait: 45,
  nowServing: 15,
  queueNumber: 23,
  position: 5,
  peopleAhead: 4,
  countdownSeconds: 22 * 60,
  arrivalWindow: '10:35 AM - 10:45 AM',
  expectedChair: 'Chair B2',
  serviceType: 'Signature fade',
  joinedAt: '9:58 AM',
  ahead: [
    {
      id: 'a1',
      queueNumber: 19,
      service: 'Beard sculpt',
      eta: '4 min left',
      stage: 'Finishing up'
    },
    {
      id: 'a2',
      queueNumber: 20,
      service: 'Kids trim',
      eta: '9 min left',
      stage: 'In progress'
    },
    {
      id: 'a3',
      queueNumber: 21,
      service: 'Fade + wash',
      eta: '13 min left',
      stage: 'Waiting'
    },
    {
      id: 'a4',
      queueNumber: 22,
      service: 'Buzz cut',
      eta: '18 min left',
      stage: 'Waiting'
    }
  ]
};

export const bookingSetup = {
  serviceTypes: [
    {
      id: 'signature',
      name: 'Signature Fade',
      duration: '35 min',
      price: 40,
      badge: 'Most booked'
    },
    {
      id: 'executive',
      name: 'Executive Groom',
      duration: '45 min',
      price: 60,
      badge: 'Premium finish'
    },
    {
      id: 'beard',
      name: 'Beard Sculpt',
      duration: '20 min',
      price: 25,
      badge: 'Quick refresh'
    }
  ],
  dates: [
    { id: 'today', label: 'Today', meta: 'Tue 14 Apr', slotsLeft: 6 },
    { id: 'tomorrow', label: 'Tomorrow', meta: 'Wed 15 Apr', slotsLeft: 9 },
    { id: 'thu', label: 'Thu', meta: '16 Apr', slotsLeft: 12 },
    { id: 'fri', label: 'Fri', meta: '17 Apr', slotsLeft: 5 }
  ],
  timeSlots: [
    { id: '09:00', label: '9:00', available: false },
    { id: '09:30', label: '9:30', available: true },
    { id: '10:00', label: '10:00', available: true },
    { id: '10:30', label: '10:30', available: false },
    { id: '11:00', label: '11:00', available: true },
    { id: '11:30', label: '11:30', available: true, featured: true },
    { id: '12:00', label: '12:00', available: true },
    { id: '12:30', label: '12:30', available: true }
  ],
  paymentMethods: [
    {
      id: 'visa',
      label: 'iisa •••• 2208',
      note: 'Recommended'
    },
    {
      id: 'fpx',
      label: 'FPX Online Banking',
      note: 'Instant approval'
    },
    {
      id: 'wallet',
      label: 'Queue Wallet',
      note: 'Use loyalty credit'
    }
  ],
  summary: {
    currency: 'RM',
    bookingFee: 12,
    bookingSubtotal: 40,
    total: 52
  },
  confirmation: {
    bookingId: 'BKG-240414-091',
    barber: 'Nora',
    date: 'Tue, 14 Apr 2026',
    time: '11:30 AM',
    reminder: 'Reminder goes out 15 minutes before',
    lane: 'Premium priority lane'
  }
};

export const notifications = [
  {
    id: 'notif-1',
    category: 'queue',
    type: 'turn_soon',
    title: 'Your turn is getting close',
    message: 'You are now #3 in line at QBarber Central. Plan to arrive within 10 minutes.',
    time: '2 min ago',
    read: false,
    icon: 'clock'
  },
  {
    id: 'notif-2',
    category: 'queue',
    type: 'now_serving',
    title: 'Now serving #15',
    message: 'Ali just called the next customer. Your chair is warming up.',
    time: '9 min ago',
    read: false,
    icon: 'scissors'
  },
  {
    id: 'notif-3',
    category: 'booking',
    type: 'booking_reminder',
    title: 'Premium slot reminder',
    message: 'Your 11:30 AM premium slot with Nora is confirmed for tomorrow.',
    time: 'Yesterday',
    read: true,
    icon: 'calendar'
  },
  {
    id: 'notif-4',
    category: 'alerts',
    type: 'promo',
    title: 'Bonus loyalty points unlocked',
    message: 'Book one premium slot this week to earn 25 extra points.',
    time: 'Yesterday',
    read: true,
    icon: 'award'
  }
];

export const profile = {
  name: 'Adam Hakim',
  email: 'adam@qbarber.app',
  phone: '+60 12-345 6789',
  tier: 'Silver Fade Club',
  loyaltyPoints: 74,
  nextRewardAt: 100,
  visits: 18,
  memberSince: 'Aug 2024',
  preferences: {
    push: true,
    sms: false,
    promo: true
  },
  history: [
    {
      id: 'visit-1',
      title: 'Signature Fade',
      date: '7 Apr 2026',
      barber: 'Ali',
      points: '+10 pts'
    },
    {
      id: 'visit-2',
      title: 'Premium Executive Groom',
      date: '28 Mar 2026',
      barber: 'Nora',
      points: '+25 pts'
    },
    {
      id: 'visit-3',
      title: 'Beard Sculpt',
      date: '13 Mar 2026',
      barber: 'Hakim',
      points: '+10 pts'
    }
  ],
  achievements: ['3 visits this month', 'Never missed a booking', 'Top 10% loyalty earner']
};

export function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function formatCurrency(amount) {
  return `RM ${amount.toFixed(2)}`;
}

export function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}
