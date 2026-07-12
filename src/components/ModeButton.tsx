import { Text, TouchableOpacity } from 'react-native';

import type { WorkMode } from '@/db/types';

interface ModeButtonProps {
  mode: WorkMode;
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Status colors must stay identical in light and dark mode,
// so they are applied unconditionally — not via the themed Text component.
// Full literal class names are required: NativeWind cannot resolve dynamic
// class strings at build time.
const modeColor: Record<
  WorkMode,
  { border: string; text: string; bgSelected: string; bgIdle: string }
> = {
  driving: {
    border: 'border-driving',
    text: 'text-driving',
    bgSelected: 'bg-driving/40',
    bgIdle: 'bg-driving/10',
  },
  other_work: {
    border: 'border-other-work',
    text: 'text-other-work',
    bgSelected: 'bg-other-work/40',
    bgIdle: 'bg-other-work/10',
  },
  standby: {
    border: 'border-standby',
    text: 'text-standby',
    bgSelected: 'bg-standby/40',
    bgIdle: 'bg-standby/10',
  },
  break: {
    border: 'border-break',
    text: 'text-break',
    bgSelected: 'bg-break/40',
    bgIdle: 'bg-break/10',
  },
  rest: {
    border: 'border-rest',
    text: 'text-rest',
    bgSelected: 'bg-rest/40',
    bgIdle: 'bg-rest/10',
  },
};

export function ModeButton({
  mode,
  label,
  selected,
  onPress,
}: ModeButtonProps) {
  const c = modeColor[mode];
  return (
    <TouchableOpacity
      className={`flex-1 border-2 rounded-2xl py-6 items-center justify-center min-h-12 ${c.border} ${selected ? c.bgSelected : c.bgIdle}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-lg font-bold uppercase ${c.text}`}>{label}</Text>
    </TouchableOpacity>
  );
}
