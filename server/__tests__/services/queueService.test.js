/* global describe, expect, test */

const {
  BUFFER_MINUTES,
  calculateEstimatedWait,
  getQueueDateKey,
  selectAvailableBarber,
  sortQueueEntries
} = require('../../services/queueService');

describe('queueService helpers', () => {
  test('should format the queue date key as YYYY-MM-DD', () => {
    expect(getQueueDateKey(new Date('2026-04-14T10:35:00.000Z'))).toBe('2026-04-14');
  });

  test('should prioritize booking entries ahead of walk-ins when enabled', () => {
    const ordered = sortQueueEntries(
      [
        {
          queueNumber: 4,
          type: 'walk-in',
          status: 'waiting',
          joinedAt: '2026-04-14T09:20:00.000Z'
        },
        {
          queueNumber: 5,
          type: 'booking',
          status: 'waiting',
          joinedAt: '2026-04-14T09:25:00.000Z'
        },
        {
          queueNumber: 3,
          type: 'walk-in',
          status: 'called',
          joinedAt: '2026-04-14T09:10:00.000Z'
        }
      ],
      true
    );

    expect(ordered.map((entry) => entry.queueNumber)).toEqual([5, 3, 4]);
  });

  test('should calculate a buffered wait time using position, barber count, and ongoing services', () => {
    const estimatedWait = calculateEstimatedWait({
      positionAhead: 5,
      activeBarbers: 2,
      avgServiceTime: 30,
      ongoingServices: [10, 8]
    });

    expect(estimatedWait).toBe(104);
  });

  test('should still return a buffered estimate when no barber is active yet', () => {
    const estimatedWait = calculateEstimatedWait({
      positionAhead: 1,
      activeBarbers: 0,
      avgServiceTime: 25,
      ongoingServices: []
    });

    expect(estimatedWait).toBe(25 + BUFFER_MINUTES);
  });

  test('should choose the least busy online barber for the next assignment', () => {
    const barbers = [
      { _id: 'barber-1', isActive: true, status: 'online', totalServices: 12 },
      { _id: 'barber-2', isActive: true, status: 'online', totalServices: 8 },
      { _id: 'barber-3', isActive: true, status: 'break', totalServices: 3 }
    ];

    const entries = [
      { barberId: 'barber-1', status: 'serving' },
      { barberId: 'barber-1', status: 'called' },
      { barberId: 'barber-2', status: 'serving' }
    ];

    expect(selectAvailableBarber(barbers, entries)).toMatchObject({ _id: 'barber-2' });
  });
});
