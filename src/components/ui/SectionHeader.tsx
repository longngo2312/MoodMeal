import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const { theme } = useTheme();

  return (
    <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
