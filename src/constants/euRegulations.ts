// All durations stored in milliseconds.
// Legal references based on EU Regulation 561/2006.

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

// ============================================================================
// EU Regulation 561/2006 art. 6 — driving limits
// ============================================================================

// Standard daily driving limit.
export const MAX_DAILY_DRIVING_REGULAR_MS = 9 * HOUR_MS;

// Extended daily driving limit.
export const MAX_DAILY_DRIVING_EXTENDED_MS = 10 * HOUR_MS;

// Max extended daily drives allowed per calendar week (Mon 00:00 – next Mon 00:00).
// Calculated per calendar week, not per rolling 7-day window.
export const MAX_EXTENDED_DAILY_DRIVES_PER_WEEK = 2;

// Maximum total driving time in a single calendar week.
export const MAX_WEEKLY_DRIVING_MS = 56 * HOUR_MS;

// Maximum combined driving time over any two consecutive calendar weeks.
export const MAX_BIWEEKLY_DRIVING_MS = 90 * HOUR_MS;

// ============================================================================
// EU Regulation 561/2006 art. 7 — mandatory breaks
// ============================================================================

// Maximum accumulated driving time since last qualifying break/rest before a mandatory break.
export const DRIVING_BEFORE_BREAK_MS = 4.5 * HOUR_MS;

// Standard continuous break duration required after 4.5h of driving.
export const REQUIRED_BREAK_MS = 45 * MINUTE_MS;

// First period of a split break (must be at least 15 minutes, strict order required).
export const SPLIT_BREAK_FIRST_MS = 15 * MINUTE_MS;

// Second period of a split break (must be at least 30 minutes and follow the first period).
// Note: Other configurations (e.g., 30 + 15) do NOT satisfy art. 7.
export const SPLIT_BREAK_SECOND_MS = 30 * MINUTE_MS;

// ============================================================================
// EU Regulation 561/2006 art. 4(g), 8 — daily rests
// ============================================================================

// Regular daily rest: continuous uninterrupted rest period.
export const DAILY_REST_REGULAR_MS = 11 * HOUR_MS;

// First period of a split regular daily rest (minimum 3 hours, strict order required).
export const DAILY_REST_SPLIT_FIRST_MS = 3 * HOUR_MS;

// Second period of a split regular daily rest (minimum 9 hours, total 12h required).
export const DAILY_REST_SPLIT_SECOND_MS = 9 * HOUR_MS;

// Reduced daily rest: continuous rest period shorter than 11h but at least 9h.
// Same numeric value as split second segment, but represents a different legal concept.
export const DAILY_REST_REDUCED_MS = 9 * HOUR_MS;

// Max 3 reduced daily rests allowed between two weekly rests (not per calendar week).
export const MAX_REDUCED_DAILY_RESTS_BETWEEN_WEEKLY_RESTS = 3;

// ============================================================================
// EU Regulation 561/2006 art. 8 — weekly rests
// ============================================================================

// Regular weekly rest (may not be taken in the vehicle — legal requirement).
export const WEEKLY_REST_REGULAR_MS = 45 * HOUR_MS;

// Reduced weekly rest: continuous rest period shorter than 45h but at least 24h.
export const WEEKLY_REST_REDUCED_MS = 24 * HOUR_MS;

// Time window (in weeks) to compensate the shortage from a reduced weekly rest.
export const WEEKLY_REST_COMPENSATION_WINDOW_WEEKS = 3;

// ============================================================================
// Application UI & Alert thresholds
// ============================================================================

// 75% of limit reached — info notification threshold.
export const WARN_THRESHOLD_INFO = 0.75;

// 90% of limit reached — yellow alert threshold.
export const WARN_THRESHOLD_WARNING = 0.9;

// 100% of limit reached — red alert / violation threshold.
export const WARN_THRESHOLD_DANGER = 1.0;

// Pre-alert buffer triggered 30 min before reaching the 4.5h driving limit.
export const BREAK_PRE_ALERT_BEFORE_LIMIT_MS = 30 * MINUTE_MS;
