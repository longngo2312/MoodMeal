// TODO: [Phase 4.1] Build the SkeletonLoader component — animated placeholder
//   shown while data is loading, so the screen doesn't flash blank.
//
// WHAT THIS FILE SHOULD DO:
//   Render grey placeholder shapes (rectangles, circles) that match the layout
//   of the real content. A shimmer gradient sweeps across them left-to-right
//   to signal "loading in progress".
//
// HOW TO BUILD IT:
//   Option A — using @shopify/react-native-skia (recommended, GPU accelerated):
//     Use Skia's LinearGradient shader animating from left to right on loop.
//     Install: npx expo install @shopify/react-native-skia
//     Docs: https://shopify.github.io/react-native-skia/docs/shaders/gradients
//
//   Option B — using React Native Reanimated only (simpler to start):
//     Use a View with overflow: 'hidden', then animate a child View's translateX
//     from -width → +width on a loop using withRepeat + withTiming.
//     Layer a LinearGradient (transparent → white 30% → transparent) on top.
//
// COMPONENT INTERFACE (props):
//   width: number | string   — skeleton block width
//   height: number           — skeleton block height
//   borderRadius?: number    — corner rounding (default 8)
//   style?: ViewStyle
//
// USAGE EXAMPLE in DashboardScreen:
//   {loading ? (
//     <>
//       <SkeletonLoader width="100%" height={80} borderRadius={16} />
//       <SkeletonLoader width="100%" height={56} borderRadius={8} />
//     </>
//   ) : (
//     <MoodSummaryCard ... />
//   )}
//
// RESOURCES:
//   Reanimated withRepeat — https://docs.swmansion.com/react-native-reanimated/docs/animations/withRepeat
//   Skeleton UI pattern explained — https://uxdesign.cc/what-you-should-know-about-skeleton-screens-a820c45a571a

// PLACEHOLDER — delete this export once you implement the real component
export {};
