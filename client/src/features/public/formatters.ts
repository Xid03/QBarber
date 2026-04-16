const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatMinutes(minutes: number) {
  if (minutes <= 0) {
    return 'No wait';
  }

  if (minutes < 60) {
    return `~${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `~${hours} hr`;
  }

  return `~${hours} hr ${remainingMinutes} min`;
}

export function formatUpdatedAt(date: Date) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function formatJoinedAt(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function formatOperatingHour(dayOfWeek: number, opensAt: string, closesAt: string, isEnabled: boolean) {
  return `${dayLabels[dayOfWeek]} · ${isEnabled ? `${opensAt} - ${closesAt}` : 'Closed'}`;
}

export function getBusyTone(level: 'LOW' | 'MEDIUM' | 'HIGH') {
  if (level === 'HIGH') {
    return 'danger';
  }

  if (level === 'MEDIUM') {
    return 'warning';
  }

  return 'success';
}

export function getQueueWarning(queueLength: number) {
  if (queueLength >= 8) {
    return 'Heads up: the shop is in a rush window right now.';
  }

  if (queueLength === 0) {
    return 'No wait right now. This is a sweet spot to walk in.';
  }

  return 'Queue is moving steadily at the moment.';
}
