/* global describe, expect, test */

const {
  addMinutes,
  combineDateAndTime,
  formatTimeFromMinutes,
  getDateKey,
  parseTimeString
} = require('../../services/bookingService');

describe('bookingService helpers', () => {
  test('should parse time strings into minute offsets', () => {
    expect(parseTimeString('09:30')).toBe(570);
  });

  test('should format minute offsets back into HH:MM', () => {
    expect(formatTimeFromMinutes(570)).toBe('09:30');
  });

  test('should add minutes to a slot start time', () => {
    expect(addMinutes('09:30', 35)).toBe('10:05');
  });

  test('should produce a local date key for booking comparisons', () => {
    expect(getDateKey(new Date('2026-04-14T05:00:00.000Z'))).toBe('2026-04-14');
  });

  test('should combine a date and time into a booking timestamp', () => {
    const combined = combineDateAndTime('2026-04-14', '15:30');

    expect(combined.getFullYear()).toBe(2026);
    expect(combined.getMonth()).toBe(3);
    expect(combined.getDate()).toBe(14);
    expect(combined.getHours()).toBe(15);
    expect(combined.getMinutes()).toBe(30);
  });
});
