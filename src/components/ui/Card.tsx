// TODO: [Phase 2.1] Create a new GlassCard component at src/components/ui/GlassCard.tsx
//   that replaces this flat Card with a frosted-glass look using expo-blur.
//   GlassCard layout:
//     <BlurView intensity={20} tint="dark">        ← blurs what's behind the card
//       <LinearGradient ... >                       ← subtle gradient border overlay
//         {children}
//       </LinearGradient>
//     </BlurView>
//   On press: Reanimated scale 1.0 → 0.97 (spring) + inner glow ring fades in.
//
// RESOURCES:
//   expo-blur docs     — https://docs.expo.dev/versions/latest/sdk/blur-view/
//   react-native-reanimated — https://docs.swmansion.com/react-native-reanimated/docs/
//   Glassmorphism guide — https://css.glass (concept, not React Native but good visual ref)
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'surface' | 'elevated';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'surface' }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === 'elevated' ? theme.colors.cardBackground : theme.colors.surface,
          borderRadius: theme.radii.md,
        },
        variant === 'elevated' && theme.shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 8,
  },
});
