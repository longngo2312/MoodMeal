import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  const { theme } = useTheme();

  return (
    <Text style={[styles.text, { color: theme.colors.textMuted }]}>{message}</Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 8,
  },
});
