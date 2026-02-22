const TZ = 'America/New_York';
const OPEN_MINUTES = 12 * 60; // 12:00

/** Close time (minutes since midnight) by weekday in Eastern. Sun=5pm, Mon-Thu=8pm, Fri-Sat=9pm */
const CLOSE_MINUTES: Record<string, number> = {
  Sun: 17 * 60,
  Mon: 20 * 60,
  Tue: 20 * 60,
  Wed: 20 * 60,
  Thu: 20 * 60,
  Fri: 21 * 60,
  Sat: 21 * 60,
};

/**
 * Returns whether the store is currently open (Eastern time).
 * Mon-Thu 12pm-8pm, Fri & Sat 12pm-9pm, Sun 12pm-5pm.
 */
export function isStoreOpenNow(now: Date = new Date()): boolean {
  const day = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(now);
  const hour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }).format(now),
    10
  );
  const minute = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, minute: 'numeric' }).format(now),
    10
  );
  const mins = hour * 60 + minute;
  const close = CLOSE_MINUTES[day] ?? 20 * 60;
  return mins >= OPEN_MINUTES && mins < close;
}
