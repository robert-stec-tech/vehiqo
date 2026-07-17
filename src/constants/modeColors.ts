import type { WorkMode } from '@/db/types';

// Single source of truth for mode→color class names. NativeWind needs literal
// class strings to statically detect them at build time, so these must stay
// spelled out here (not built dynamically from the mode key elsewhere).
export const MODE_COLORS: Record<
  WorkMode,
  { bg: string; border: string; text: string }
> = {
  driving: { bg: 'bg-driving', border: 'border-driving', text: 'text-driving' },
  other_work: {
    bg: 'bg-other-work',
    border: 'border-other-work',
    text: 'text-other-work',
  },
  standby: { bg: 'bg-standby', border: 'border-standby', text: 'text-standby' },
  break: { bg: 'bg-break', border: 'border-break', text: 'text-break' },
  rest: { bg: 'bg-rest', border: 'border-rest', text: 'text-rest' },
};
