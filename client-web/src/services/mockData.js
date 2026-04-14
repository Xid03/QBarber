export const demoCredentials = {
  email: 'owner@qbarber.demo',
  password: 'demo12345'
};

export const demoOwner = {
  name: 'Zara Rahman',
  role: 'Shop Owner',
  shopName: 'QBarber Bukit Bintang',
  branch: 'Bukit Bintang',
  email: demoCredentials.email,
  avatar: 'ZR'
};

export const dashboardStats = [
  {
    id: 'customers',
    label: "Today's Customers",
    value: '45',
    delta: '+12% vs yesterday',
    tone: 'brand'
  },
  {
    id: 'wait',
    label: 'Avg Wait Time',
    value: '18 min',
    delta: '-4 min from last week',
    tone: 'warning'
  },
  {
    id: 'revenue',
    label: 'Booking Revenue',
    value: 'RM250',
    delta: '8 premium slots sold',
    tone: 'success'
  },
  {
    id: 'barbers',
    label: 'Active Barbers',
    value: '3',
    delta: '1 barber on break',
    tone: 'slate'
  }
];

export const trafficData = [
  { hour: '09:00', customers: 3, wait: 8 },
  { hour: '10:00', customers: 5, wait: 11 },
  { hour: '11:00', customers: 7, wait: 16 },
  { hour: '12:00', customers: 9, wait: 20 },
  { hour: '13:00', customers: 6, wait: 18 },
  { hour: '14:00', customers: 8, wait: 24 },
  { hour: '15:00', customers: 10, wait: 22 },
  { hour: '16:00', customers: 9, wait: 19 },
  { hour: '17:00', customers: 7, wait: 17 },
  { hour: '18:00', customers: 5, wait: 14 }
];

export const overviewQueueRows = [
  {
    id: 'Q12',
    number: 12,
    customer: 'John D.',
    type: 'Walk-in',
    barber: '-',
    status: 'Waiting',
    time: '10m',
    service: 'Classic Cut'
  },
  {
    id: 'Q13',
    number: 13,
    customer: 'Sarah M.',
    type: 'Booked',
    barber: 'Ali',
    status: 'In Progress',
    time: '5m',
    service: 'Executive Fade'
  },
  {
    id: 'Q14',
    number: 14,
    customer: 'Hafiz R.',
    type: 'Walk-in',
    barber: 'Naim',
    status: 'Called',
    time: '2m',
    service: 'Beard Trim'
  },
  {
    id: 'Q15',
    number: 15,
    customer: 'Lina A.',
    type: 'Booked',
    barber: 'Sara',
    status: 'Waiting',
    time: '14m',
    service: 'Wash + Style'
  },
  {
    id: 'Q16',
    number: 16,
    customer: 'Farid K.',
    type: 'Walk-in',
    barber: '-',
    status: 'Waiting',
    time: '18m',
    service: 'Skin Fade'
  }
];

export const recentActivity = [
  {
    id: 'A1',
    title: 'Premium booking confirmed',
    description: 'Nur A. secured 3:30 PM with Ali.',
    time: '2 min ago',
    tone: 'success'
  },
  {
    id: 'A2',
    title: 'Queue #13 moved to service',
    description: 'Sarah M. is now with Ali at Chair 2.',
    time: '5 min ago',
    tone: 'brand'
  },
  {
    id: 'A3',
    title: 'Reminder sent',
    description: 'Booking reminder sent to Amir L. for 4:00 PM.',
    time: '9 min ago',
    tone: 'warning'
  },
  {
    id: 'A4',
    title: 'Barber status updated',
    description: 'Hakim switched to break mode for 20 minutes.',
    time: '14 min ago',
    tone: 'slate'
  }
];

export const queueManagementEntries = [
  {
    id: 'Q12',
    number: 12,
    customer: 'John D.',
    type: 'Walk-in',
    barber: '-',
    status: 'Waiting',
    time: '10m',
    eta: '15 min',
    service: 'Classic Cut',
    phone: '+60 12-441 2090'
  },
  {
    id: 'Q13',
    number: 13,
    customer: 'Sarah M.',
    type: 'Booked',
    barber: 'Ali',
    status: 'In Progress',
    time: '5m',
    eta: 'In chair',
    service: 'Executive Fade',
    phone: '+60 17-883 2044'
  },
  {
    id: 'Q14',
    number: 14,
    customer: 'Hafiz R.',
    type: 'Walk-in',
    barber: 'Naim',
    status: 'Called',
    time: '2m',
    eta: 'Next',
    service: 'Beard Trim',
    phone: '+60 11-332 0488'
  },
  {
    id: 'Q15',
    number: 15,
    customer: 'Lina A.',
    type: 'Booked',
    barber: 'Sara',
    status: 'Waiting',
    time: '14m',
    eta: '18 min',
    service: 'Wash + Style',
    phone: '+60 16-247 5014'
  },
  {
    id: 'Q16',
    number: 16,
    customer: 'Farid K.',
    type: 'Walk-in',
    barber: '-',
    status: 'Waiting',
    time: '18m',
    eta: '24 min',
    service: 'Skin Fade',
    phone: '+60 18-009 2210'
  },
  {
    id: 'Q17',
    number: 17,
    customer: 'Adib N.',
    type: 'Walk-in',
    barber: '-',
    status: 'Waiting',
    time: '22m',
    eta: '28 min',
    service: 'Buzz Cut',
    phone: '+60 19-601 8834'
  }
];

export const barbers = [
  {
    id: 'B1',
    name: 'Ali Rahman',
    specialty: 'Skin fades and razor detailing',
    avgServiceTime: 28,
    status: 'Online',
    rating: 4.9,
    totalServices: 412,
    isActive: true,
    utilization: '87%',
    currentCustomer: 'Sarah M.',
    avatar: 'AR'
  },
  {
    id: 'B2',
    name: 'Naim Hakim',
    specialty: 'Beard sculpting and classic cuts',
    avgServiceTime: 31,
    status: 'Online',
    rating: 4.8,
    totalServices: 376,
    isActive: true,
    utilization: '82%',
    currentCustomer: 'Hafiz R.',
    avatar: 'NH'
  },
  {
    id: 'B3',
    name: 'Sara Idris',
    specialty: 'Texture styling and grooming plans',
    avgServiceTime: 26,
    status: 'Online',
    rating: 4.9,
    totalServices: 451,
    isActive: true,
    utilization: '90%',
    currentCustomer: 'Lina A.',
    avatar: 'SI'
  },
  {
    id: 'B4',
    name: 'Hakim Salleh',
    specialty: 'Kids cuts and quick trims',
    avgServiceTime: 24,
    status: 'Break',
    rating: 4.7,
    totalServices: 298,
    isActive: false,
    utilization: '61%',
    currentCustomer: 'None',
    avatar: 'HS'
  }
];

export const assignableCustomers = [
  'John D. (#12)',
  'Lina A. (#15)',
  'Farid K. (#16)',
  'Adib N. (#17)'
];

export const bookingCalendarDays = [
  { id: '2026-04-13', label: 'Mon', day: '13', bookings: 3 },
  { id: '2026-04-14', label: 'Tue', day: '14', bookings: 6 },
  { id: '2026-04-15', label: 'Wed', day: '15', bookings: 4 },
  { id: '2026-04-16', label: 'Thu', day: '16', bookings: 5 },
  { id: '2026-04-17', label: 'Fri', day: '17', bookings: 8 },
  { id: '2026-04-18', label: 'Sat', day: '18', bookings: 9 },
  { id: '2026-04-19', label: 'Sun', day: '19', bookings: 2 }
];

export const bookingRows = [
  {
    id: 'BK-204',
    customer: 'Nur A.',
    phone: '+60 13-998 4001',
    dateId: '2026-04-14',
    slot: '3:30 PM',
    barber: 'Ali Rahman',
    service: 'Executive Fade',
    source: 'Premium',
    amount: 'RM45',
    paymentStatus: 'Paid',
    checkInStatus: 'Pending',
    status: 'Confirmed'
  },
  {
    id: 'BK-205',
    customer: 'Amir L.',
    phone: '+60 12-143 8841',
    dateId: '2026-04-14',
    slot: '4:00 PM',
    barber: 'Sara Idris',
    service: 'Wash + Style',
    source: 'Premium',
    amount: 'RM55',
    paymentStatus: 'Paid',
    checkInStatus: 'Checked-in',
    status: 'Confirmed'
  },
  {
    id: 'BK-206',
    customer: 'Mira F.',
    phone: '+60 17-419 5550',
    dateId: '2026-04-15',
    slot: '11:30 AM',
    barber: 'Naim Hakim',
    service: 'Classic Cut',
    source: 'Premium',
    amount: 'RM35',
    paymentStatus: 'Pending',
    checkInStatus: 'Pending',
    status: 'Upcoming'
  },
  {
    id: 'BK-207',
    customer: 'Daniel P.',
    phone: '+60 11-848 3398',
    dateId: '2026-04-16',
    slot: '1:00 PM',
    barber: 'Ali Rahman',
    service: 'Skin Fade',
    source: 'Premium',
    amount: 'RM50',
    paymentStatus: 'Paid',
    checkInStatus: 'Pending',
    status: 'Upcoming'
  },
  {
    id: 'BK-198',
    customer: 'Hani Z.',
    phone: '+60 14-228 7000',
    dateId: '2026-04-12',
    slot: '5:00 PM',
    barber: 'Sara Idris',
    service: 'Quick Trim',
    source: 'Premium',
    amount: 'RM30',
    paymentStatus: 'Refunded',
    checkInStatus: 'Missed',
    status: 'Cancelled'
  },
  {
    id: 'BK-191',
    customer: 'Rizal K.',
    phone: '+60 18-880 1099',
    dateId: '2026-04-10',
    slot: '10:30 AM',
    barber: 'Hakim Salleh',
    service: 'Buzz Cut',
    source: 'Premium',
    amount: 'RM25',
    paymentStatus: 'Paid',
    checkInStatus: 'Checked-in',
    status: 'Past'
  }
];

export const analyticsSummary = [
  {
    id: 'retention',
    label: 'Retention Rate',
    value: '61%',
    delta: '+7% month-over-month',
    tone: 'success'
  },
  {
    id: 'peak',
    label: 'Peak Window',
    value: '2 PM - 5 PM',
    delta: 'Friday is busiest',
    tone: 'warning'
  },
  {
    id: 'no-show',
    label: 'No-show Rate',
    value: '3.4%',
    delta: 'Under 5% target',
    tone: 'brand'
  },
  {
    id: 'utilization',
    label: 'Barber Utilization',
    value: '80%',
    delta: 'Across 4 active chairs',
    tone: 'slate'
  }
];

export const customerVolumeData = [
  { label: 'Mon', customers: 38, bookings: 7 },
  { label: 'Tue', customers: 45, bookings: 8 },
  { label: 'Wed', customers: 41, bookings: 6 },
  { label: 'Thu', customers: 48, bookings: 9 },
  { label: 'Fri', customers: 56, bookings: 12 },
  { label: 'Sat', customers: 63, bookings: 15 },
  { label: 'Sun', customers: 29, bookings: 4 }
];

export const peakHours = [
  { day: 'Mon', hours: [2, 3, 5, 6, 4, 3] },
  { day: 'Tue', hours: [3, 4, 6, 7, 5, 4] },
  { day: 'Wed', hours: [2, 4, 5, 7, 6, 3] },
  { day: 'Thu', hours: [3, 5, 7, 8, 6, 4] },
  { day: 'Fri', hours: [4, 6, 8, 9, 8, 5] },
  { day: 'Sat', hours: [5, 7, 9, 10, 8, 6] },
  { day: 'Sun', hours: [2, 3, 4, 5, 4, 2] }
];

export const heatmapHours = ['10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'];

export const serviceTimeDistribution = [
  { name: 'Buzz Cut', avgMinutes: 18 },
  { name: 'Classic Cut', avgMinutes: 26 },
  { name: 'Beard Trim', avgMinutes: 21 },
  { name: 'Skin Fade', avgMinutes: 34 },
  { name: 'Wash + Style', avgMinutes: 31 }
];

export const revenueBreakdown = [
  { name: 'Walk-ins', value: 640 },
  { name: 'Bookings', value: 250 }
];

export const barberPerformance = [
  { name: 'Ali', services: 68, rating: 4.9, revenue: 880 },
  { name: 'Naim', services: 61, rating: 4.8, revenue: 760 },
  { name: 'Sara', services: 74, rating: 4.9, revenue: 910 },
  { name: 'Hakim', services: 45, rating: 4.7, revenue: 520 }
];

export const settingsData = {
  shopInfo: {
    name: 'QBarber Bukit Bintang',
    address: '17 Jalan Sultan Ismail, 50250 Kuala Lumpur',
    phone: '+60 3-2148 9191',
    email: 'owner@qbarber.demo',
    logo: 'QB'
  },
  operatingHours: [
    { day: 'Monday', open: '10:00', close: '21:00', enabled: true },
    { day: 'Tuesday', open: '10:00', close: '21:00', enabled: true },
    { day: 'Wednesday', open: '10:00', close: '21:00', enabled: true },
    { day: 'Thursday', open: '10:00', close: '21:00', enabled: true },
    { day: 'Friday', open: '10:00', close: '22:00', enabled: true },
    { day: 'Saturday', open: '10:00', close: '22:00', enabled: true },
    { day: 'Sunday', open: '11:00', close: '19:00', enabled: true }
  ],
  services: [
    { id: 'S1', name: 'Classic Cut', price: 'RM35', duration: '30 min' },
    { id: 'S2', name: 'Skin Fade', price: 'RM50', duration: '40 min' },
    { id: 'S3', name: 'Beard Trim', price: 'RM20', duration: '20 min' },
    { id: 'S4', name: 'Wash + Style', price: 'RM55', duration: '45 min' }
  ],
  bookingSettings: {
    fee: 'RM10',
    currency: 'MYR',
    slotBuffer: '5 min',
    queuePriority: 'Bookings first'
  },
  notificationTemplates: [
    {
      id: 'turn_soon',
      name: 'Turn approaching',
      message: "Your turn is coming up. You're #{position} in line with about {time} minutes left."
    },
    {
      id: 'now_serving',
      name: 'Now serving',
      message: "It's your turn now. Please head to {barberName}."
    },
    {
      id: 'booking_reminder',
      name: 'Booking reminder',
      message: 'Reminder: your premium slot starts in 15 minutes. Check in on arrival.'
    }
  ],
  branches: [
    {
      id: 'BR1',
      name: 'Bukit Bintang',
      address: '17 Jalan Sultan Ismail, Kuala Lumpur',
      status: 'Live'
    },
    {
      id: 'BR2',
      name: 'Mont Kiara',
      address: '8 Jalan Solaris, Kuala Lumpur',
      status: 'Soft Launch'
    }
  ]
};

export function getToneForStatus(status) {
  const normalized = String(status).toLowerCase();

  if (normalized.includes('paid') || normalized.includes('confirmed') || normalized.includes('online') || normalized.includes('checked')) {
    return 'success';
  }

  if (normalized.includes('pending') || normalized.includes('waiting') || normalized.includes('called') || normalized.includes('upcoming') || normalized.includes('break')) {
    return 'warning';
  }

  if (normalized.includes('cancelled') || normalized.includes('refunded') || normalized.includes('missed') || normalized.includes('offline')) {
    return 'danger';
  }

  if (normalized.includes('progress') || normalized.includes('live')) {
    return 'brand';
  }

  return 'slate';
}
