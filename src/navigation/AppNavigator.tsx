import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { CalendarScreen } from '../screens/calendar/CalendarScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MealFormScreen } from '../screens/meals/MealFormScreen';
import { SymptomFormScreen } from '../screens/symptoms/SymptomFormScreen';
import { RootStackParamList, BottomTabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const COLORS = {
  accent: '#00e6ff',
  text: '#eeeeee',
  tabBar: '#444444',
  header: '#4037dfff',
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
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

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
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
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
