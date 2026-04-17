import {
  adminLoginSchema,
  analyticsRangeQuerySchema,
  createAdminUserSchema,
  joinQueueSchema,
  updateAdminUserSchema,
  updateOperatingHoursSchema,
  updateServiceTypeSchema
} from './schemas.js';

describe('validation schemas', () => {
  it('accepts a valid admin login payload', () => {
    expect(
      adminLoginSchema.parse({
        username: 'admin',
        password: 'password'
      })
    ).toEqual({
      username: 'admin',
      password: 'password'
    });
  });

  it('rejects a queue join when the customer name is too short', () => {
    expect(() =>
      joinQueueSchema.parse({
        customerName: 'A',
        serviceTypeId: 'svc-1'
      })
    ).toThrow('Customer name must be at least 2 characters.');
  });

  it('rejects operating hours where closing time is before opening time', () => {
    expect(() =>
      updateOperatingHoursSchema.parse({
        operatingHours: [
          {
            id: 'hour-1',
            dayOfWeek: 1,
            opensAt: '18:00',
            closesAt: '09:00',
            isEnabled: true
          }
        ]
      })
    ).toThrow('Closing time must be after opening time.');
  });

  it('rejects a service type update with a duration under five minutes', () => {
    expect(() =>
      updateServiceTypeSchema.parse({
        name: 'Buzz cut',
        durationMinutes: 4,
        priceCents: 1200,
        isActive: true
      })
    ).toThrow('Duration must be at least 5 minutes.');
  });

  it('accepts a valid admin creation payload', () => {
    expect(
      createAdminUserSchema.parse({
        displayName: 'Maria',
        username: 'maria-admin',
        password: 'secure123'
      })
    ).toEqual({
      displayName: 'Maria',
      username: 'maria-admin',
      password: 'secure123'
    });
  });

  it('rejects an invalid analytics range query', () => {
    expect(() =>
      analyticsRangeQuerySchema.parse({
        range: 'month'
      })
    ).toThrow();
  });

  it('rejects admin updates when a replacement password is too short', () => {
    expect(() =>
      updateAdminUserSchema.parse({
        displayName: 'Tony',
        username: 'tony-admin',
        password: '123'
      })
    ).toThrow('Password must be at least 6 characters.');
  });
});
