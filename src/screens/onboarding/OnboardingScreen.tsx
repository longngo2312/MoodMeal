import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9',
};

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'restaurant',
    iconColor: '#4caf50',
    title: 'Track Your Meals',
    subtitle: 'Log what you eat',
    description:
      'Keep a detailed food diary with ingredients and meal times. Understanding what you eat is the first step to feeling better.',
  },
  {
    id: '2',
    icon: 'medical',
    iconColor: '#f44336',
    title: 'Monitor Symptoms',
    subtitle: 'Track how you feel',
    description:
      'Log symptoms with severity levels to identify patterns. Quick-log common symptoms or add detailed entries.',
  },
  {
    id: '3',
    icon: 'happy',
    iconColor: '#ff9800',
    title: 'Log Your Mood',
    subtitle: 'Emoji-based mood tracking',
    description:
      'Track your emotional state and energy levels throughout the day. See how your diet affects your mood over time.',
  },
  {
    id: '4',
    icon: 'analytics',
    iconColor: '#2196f3',
    title: 'Smart Insights',
    subtitle: 'AI-powered correlations',
    description:
      'Discover connections between what you eat and how you feel. Get personalized meal recommendations powered by AI.',
  },
  {
    id: '5',
    icon: 'sparkles',
    iconColor: '#9c27b0',
    title: 'Get Started',
    subtitle: "You're all set!",
    description:
      'Start logging your first meal or mood. The more data you add, the smarter your insights become.',
  },
];

const ONBOARDING_KEY = '@moodmeal_onboarding_complete';

type NavigationProp = StackNavigationProp<RootStackParamList>;

// TODO: [Phase 3.3] Rebuild the onboarding with a 3D particle background.
//   Create src/components/three/ParticleField.tsx using Three.js PointsMaterial.
//   The particle shape morphs on each slide swipe:
//     Slide 1 → scattered cloud (random positions)
//     Slide 2 → DNA double helix
//     Slide 3 → heart shape
//     Slide 4 → brain/neural network shape
//     Slide 5 → spiral galaxy
//   Morph = lerp (linear interpolation) particle positions over ~600ms using
//   Reanimated shared values passed as uniforms to the shader.
//
//   Keep the existing FlatList swipe logic and pagination dots — only replace
//   the background and the icon circles with the 3D canvas.
//   Slide content cards → GlassCard with glassmorphism over the particle field.
//
// RESOURCES:
//   Three.js Points / PointsMaterial — https://threejs.org/docs/#api/en/materials/PointsMaterial
//   Particle morph technique — https://threejs.org/examples/#webgl_morphtargets_points
//   Reanimated interpolation — https://docs.swmansion.com/react-native-reanimated/docs/animations/withTiming
export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const goToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: item.iconColor + '20' }]}>
          <Ionicons name={item.icon} size={64} color={item.iconColor} />
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
                backgroundColor: COLORS.accent,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        {!isLastSlide && (
          <TouchableOpacity onPress={skip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {renderPagination()}

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
          <LinearGradient
            style={styles.gradient}
            colors={['#3d1bf9', '#826ef5']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? "Let's Go!" : 'Next'}
            </Text>
            {!isLastSlide && (
              <Ionicons name="arrow-forward" size={20} color="white" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export { ONBOARDING_KEY };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.accent,
    marginBottom: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
