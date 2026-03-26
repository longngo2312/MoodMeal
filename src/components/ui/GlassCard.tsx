// TODO: [Phase 2.1] Build the GlassCard component — a frosted-glass replacement for Card.
//
// WHAT THIS FILE SHOULD DO:
//   Render a card that looks like frosted glass floating over the background.
//   The "frost" effect is created by blurring whatever is behind the card.
//
// HOW TO BUILD IT (step by step):
//   1. Install expo-blur:  npx expo install expo-blur
//   2. Import BlurView from 'expo-blur'
//   3. Wrap the card content in a BlurView with intensity={20} tint="dark"
//   4. Add a LinearGradient overlay on top for the glass edge shine:
//        colors: ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.04)']
//        This makes the top-left corner brighter (like light hitting glass).
//   5. Add a border: 1px solid rgba(255,255,255,0.12)
//   6. Use Reanimated Pressable so the card scales to 0.97 when pressed (spring physics):
//        const scale = useSharedValue(1);
//        const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
//        On pressIn:  scale.value = withSpring(0.97)
//        On pressOut: scale.value = withSpring(1)
//
// COMPONENT INTERFACE (props):
//   children: ReactNode   — content inside the card
//   style?: ViewStyle     — extra styles from parent
//   onPress?: () => void  — optional tap handler (if provided, card is pressable)
//   glowColor?: string    — optional glow ring color (default: theme.colors.glow)
//
// RESOURCES:
//   expo-blur BlurView — https://docs.expo.dev/versions/latest/sdk/blur-view/
//   Reanimated useSharedValue — https://docs.swmansion.com/react-native-reanimated/docs/core/useSharedValue
//   Reanimated withSpring — https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring
//   Glassmorphism visual reference — https://hype4.academy/tools/glassmorphism-generator

// PLACEHOLDER — delete this export once you implement the real component
export {};
