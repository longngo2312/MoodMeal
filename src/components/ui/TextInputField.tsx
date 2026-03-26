// TODO: [Phase 2.3] Redesign TextInputField with animated micro-interactions:
//   1. Floating label — label starts inside the input, floats up + shrinks on focus
//      Use Reanimated useSharedValue + useAnimatedStyle to drive the transform.
//   2. Animated bottom border — a colored line that grows from 0% → 100% width on focus.
//      Use a View with width driven by a Reanimated shared value.
//   3. Glass background — on focus, background shifts to theme.colors.glass.
//   4. Error shake — when `error` prop appears, run a horizontal spring shake
//      using Reanimated withSequence + withSpring.
//
// RESOURCES:
//   Reanimated shared values & animations — https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/your-first-animation
//   Floating label tutorial (React Native) — https://www.reactnative.guide/
//   withSequence for shake — https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../theme';

interface TextInputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.error : theme.colors.inputBorder,
            color: theme.colors.text,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.placeholder}
        {...props}
      />
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
