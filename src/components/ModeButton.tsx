import { Text, TouchableOpacity } from 'react-native';

import type { WorkMode } from '@/db/types';

interface ModeButtonProps {
  mode: WorkMode;
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Status colors must stay identical in light and dark mode (see CLAUDE.md),
// so they are applied unconditionally — not via the themed Text component.
// Full literal class names are required: NativeWind cannot resolve dynamic
// class strings at build time.
const modeColor: Record<
  WorkMode,
  { border: string; text: string; bgSelected: string; bgIdle: string }
> = {
  driving: {
    border: 'border-green-500',
    text: 'text-green-500',
    bgSelected: 'bg-green-500/40',
    bgIdle: 'bg-green-500/10',
  },
  other_work: {
    border: 'border-amber-500',
    text: 'text-amber-500',
    bgSelected: 'bg-amber-500/40',
    bgIdle: 'bg-amber-500/10',
  },
  standby: {
    border: 'border-gray-500',
    text: 'text-gray-500',
    bgSelected: 'bg-gray-500/40',
    bgIdle: 'bg-gray-500/10',
  },
  break: {
    border: 'border-blue-500',
    text: 'text-blue-500',
    bgSelected: 'bg-blue-500/40',
    bgIdle: 'bg-blue-500/10',
  },
  rest: {
    border: 'border-violet-500',
    text: 'text-violet-500',
    bgSelected: 'bg-violet-500/40',
    bgIdle: 'bg-violet-500/10',
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
      className={`flex-1 border-2 rounded-2xl py-6 items-center justify-center min-h-[48px] ${c.border} ${selected ? c.bgSelected : c.bgIdle}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-lg font-bold uppercase ${c.text}`}>{label}</Text>
    </TouchableOpacity>
  );
}
