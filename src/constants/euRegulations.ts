const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

// EU Regulation 561/2006 art. 6 — daily driving limit.
// Standard 9h. May be extended to 10h twice per week.
export const MAX_DAILY_DRIVING_REGULAR_MS = 9 * HOUR_MS;
export const MAX_DAILY_DRIVING_EXTENDED_MS = 10 * HOUR_MS;
// Counted per calendar week (Mon 00:00 – Sun 24:00),
// not per rolling 7-day window.
export const MAX_EXTENDED_DAILY_DRIVES_PER_WEEK = 2;

// EU Regulation 561/2006 art. 6 — weekly and biweekly limits.
export const MAX_WEEKLY_DRIVING_MS = 56 * HOUR_MS;
export const MAX_BIWEEKLY_DRIVING_MS = 90 * HOUR_MS;

// EU Regulation 561/2006 art. 7 — mandatory break after driving.
// After 4.5h of continuous driving: 45 min break.
// Allowed split: 15 + 30 min (ONLY in that order).
export const DRIVING_BEFORE_BREAK_MS = 4.5 * HOUR_MS;
export const REQUIRED_BREAK_MS = 45 * MINUTE_MS;
export const SPLIT_BREAK_FIRST_MS = 15 * MINUTE_MS;
export const SPLIT_BREAK_SECOND_MS = 30 * MINUTE_MS;

// EU Regulation 561/2006 art. 4(g), 8 — daily rest.
// Regular: 11h continuous OR split 3h + 9h = 12h (order mandatory).
// Reduced: min 9h, max 3 times between two weekly rests
// (not per calendar week).
export const DAILY_REST_REGULAR_MS = 11 * HOUR_MS;
export const DAILY_REST_SPLIT_FIRST_MS = 3 * HOUR_MS;
export const DAILY_REST_SPLIT_SECOND_MS = 9 * HOUR_MS;
// Value coincidence with DAILY_REST_SPLIT_SECOND_MS is accidental
// — different legal concepts (full reduced rest vs second segment of split regular rest).
export const DAILY_REST_REDUCED_MS = 9 * HOUR_MS;
export const MAX_REDUCED_DAILY_RESTS_BETWEEN_WEEKLY_RESTS = 3;

// EU Regulation 561/2006 art. 8 — weekly rest.
// Regular: 45h (must be taken OUTSIDE the vehicle cabin — legal requirement).
// Reduced: min 24h, shortage must be compensated within next 3 weeks.
export const WEEKLY_REST_REGULAR_MS = 45 * HOUR_MS;
export const WEEKLY_REST_REDUCED_MS = 24 * HOUR_MS;
export const WEEKLY_REST_COMPENSATION_WINDOW_WEEKS = 3;

// Warning thresholds for each counter (percent of limit).
// 75% — info notification, 90% — yellow alert, 100% — red alert.
export const WARN_THRESHOLD_INFO = 0.75;
export const WARN_THRESHOLD_WARNING = 0.9;
export const WARN_THRESHOLD_DANGER = 1.0;

// Pre-alert triggered 30 min before reaching the 4.5h driving limit.
export const BREAK_PRE_ALERT_BEFORE_LIMIT_MS = 30 * MINUTE_MS;
