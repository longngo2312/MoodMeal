// TODO: [Phase 2.2] Redesign Button variants with modern treatments:
//   'primary'   → keep gradient + add a Skia glow halo drawn beneath the button
//   'secondary' → glass surface (rgba white bg) with gradient border ring
//   'ghost'     → text only + animated underline that grows on press (Reanimated width)
//   'danger'    → red-tinted glass surface
//
//   All variants: wrap onPress to also call
//     Haptics.impactAsync(ImpactFeedbackStyle.Light)   ← makes press feel physical
//   Replace TouchableOpacity → Pressable + useAnimatedStyle for scale feedback.
//
// RESOURCES:
//   expo-haptics — https://docs.expo.dev/versions/latest/sdk/haptics/
//   Reanimated Pressable pattern — https://docs.swmansion.com/react-native-reanimated/docs/gestures/animated-gesture-handler
//   @shopify/react-native-skia (for glow) — https://shopify.github.io/react-native-skia/docs/getting-started/installation
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'gradient';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  const isDisabled = disabled || loading;

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabled, style]}
        onPress={onPress}
        disabled={isDisabled}
      >
        <LinearGradient
          style={styles.gradient}
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.gradientText}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const bgColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.surface,
    danger: theme.colors.error,
  }[variant];

  const textColor = variant === 'secondary' ? theme.colors.text : 'white';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.solidButton,
        { backgroundColor: bgColor },
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  solidButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradientText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
});
