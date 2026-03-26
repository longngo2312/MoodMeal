import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../contexts/AuthContext';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { OnboardingScreen, ONBOARDING_KEY } from '../screens/onboarding/OnboardingScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MealFormScreen } from '../screens/meals/MealFormScreen';
import { SymptomFormScreen } from '../screens/symptoms/SymptomFormScreen';
import { MoodFormScreen } from '../screens/moods/MoodFormScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { RecommendationsScreen } from '../screens/recommendations/RecommendationsScreen';
import { RootStackParamList, BottomTabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// TODO: [Phase 1.2] Replace this local COLORS constant with useTheme() hook.
//   Import { useTheme } from '../theme' inside TabNavigator and AppNavigator,
//   then replace all COLORS.x references with theme.colors.x.
//   This ensures dark/light mode works correctly everywhere.
// RESOURCE: React useContext (which useTheme is built on) — https://react.dev/reference/react/useContext
const COLORS = {
  accent: '#00e6ff',
  text: '#eeeeee',
  tabBar: '#444444',
  header: '#4037dfff',
};

// TODO: [Phase 2.4] Redesign the tab bar into a floating glassmorphic pill:
//   tabBarStyle changes:
//     position: 'absolute'     ← detaches it from edge
//     bottom: 24               ← floats above edge
//     left: 24, right: 24      ← side margins
//     borderRadius: 28         ← pill shape
//     backgroundColor: 'rgba(20,20,40,0.8)'
//     borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)'
//   Wrap in a BlurView for the frosted glass effect.
//   Active tab icon: animated Reanimated scale spring (1 → 1.2 → 1) on press.
//   Active indicator: animated pill underline that slides between tabs.
//
// TODO: [Phase 1.3] Add Reanimated screen transitions to the Stack.Navigator:
//   Use cardStyleInterpolator from @react-navigation/stack for:
//     Modal screens (MealForm, MoodForm, etc.) → vertical slide from bottom
//     Tab switch → horizontal fade-slide
// RESOURCE: React Navigation custom transitions — https://reactnavigation.org/docs/stack-navigator/#animation-related-options
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
        },
        headerStyle: {
          backgroundColor: COLORS.header,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold' as const,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: 'Insights' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setOnboardingComplete(value === 'true');
    });
  }, []);

  if (loading || onboardingComplete === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Profile',
                headerStyle: { backgroundColor: COLORS.header },
                headerTintColor: 'white',
              }}
            />
            <Stack.Screen
              name="MealForm"
              component={MealFormScreen}
              options={{
                headerShown: true,
                title: 'Log Meal',
                headerStyle: { backgroundColor: COLORS.header },
                headerTintColor: 'white',
              }}
            />
            <Stack.Screen
              name="SymptomForm"
              component={SymptomFormScreen}
              options={{
                headerShown: true,
                title: 'Log Symptom',
                headerStyle: { backgroundColor: COLORS.header },
                headerTintColor: 'white',
              }}
            />
            <Stack.Screen
              name="MoodForm"
              component={MoodFormScreen}
              options={{
                headerShown: true,
                title: 'Log Mood',
                headerStyle: { backgroundColor: COLORS.header },
                headerTintColor: 'white',
              }}
            />
            <Stack.Screen
              name="Recommendations"
              component={RecommendationsScreen}
              options={{
                headerShown: true,
                title: 'AI Recommendations',
                headerStyle: { backgroundColor: COLORS.header },
                headerTintColor: 'white',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
