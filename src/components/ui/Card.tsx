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
