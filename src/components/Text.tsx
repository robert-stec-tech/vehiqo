import { Text as RNText, TextProps } from 'react-native';

type TextVariant =
  | 'hero'
  | 'display'
  | 'heading'
  | 'label'
  | 'body'
  | 'caption'
  | 'timestamp';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  hero: 'text-hero font-bold tracking-tight',
  display: 'text-4xl font-bold',
  heading: 'text-2xl font-bold',
  label: 'text-lg font-semibold',
  body: 'text-base',
  caption: 'text-sm text-gray-500 dark:text-ink-muted',
  timestamp: 'text-xs text-gray-500 dark:text-ink-muted',
};

export function Text({
  variant = 'body',
  className,
  children,
  ...props
}: AppTextProps) {
  return (
    <RNText
      className={`text-gray-900 dark:text-ink ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}
