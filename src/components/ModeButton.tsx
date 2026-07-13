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
  {
    border: string;
    bgSelected: string;
    bgIdle: string;
    textSelected: string;
    textIdle: string;
  }
> = {
  driving: {
    border: 'border-driving',
    bgSelected: 'bg-driving',
    bgIdle: 'bg-driving/10',
    textSelected: 'text-night',
    textIdle: 'text-driving',
  },
  other_work: {
    border: 'border-other-work',
    bgSelected: 'bg-other-work',
    bgIdle: 'bg-other-work/10',
    textSelected: 'text-night',
    textIdle: 'text-other-work',
  },
  standby: {
    border: 'border-standby',
    bgSelected: 'bg-standby',
    bgIdle: 'bg-standby/10',
    textSelected: 'text-night',
    textIdle: 'text-standby',
  },
  break: {
    border: 'border-break',
    bgSelected: 'bg-break',
    bgIdle: 'bg-break/10',
    textSelected: 'text-night',
    textIdle: 'text-break',
  },
  rest: {
    border: 'border-rest',
    bgSelected: 'bg-rest',
    bgIdle: 'bg-rest/10',
    textSelected: 'text-night',
    textIdle: 'text-rest',
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
      <Text
        className={`text-lg font-bold uppercase ${selected ? c.textSelected : c.textIdle}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
