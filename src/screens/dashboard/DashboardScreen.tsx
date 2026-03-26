import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/AuthContext';
import { mealService } from '../../services/mealService';
import { symptomService } from '../../services/symptomService';
import { moodService } from '../../services/moodService';
import { Meal, Symptom, Mood, RootStackParamList } from '../../types';

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9ff',
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MOOD_COLORS: Record<string, string> = {
  great: '#4caf50',
  good: '#8bc34a',
  okay: '#ff9800',
  bad: '#ff5722',
  awful: '#f44336',
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTodayData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [mealsData, symptomsData, moodsData] = await Promise.all([
        mealService.getMealsByDate(user.id, today),
        symptomService.getSymptomsByDate(user.id, today),
        moodService.getMoodsByDate(user.id, today),
      ]);

      setMeals(mealsData);
      setSymptoms(symptomsData);
      setMoods(moodsData);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [user])
  );

  const quickLogSymptom = (symptomType: string, severity: number) => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    navigation.navigate('SymptomForm', {
      symptom: {
        id: '',
        user_id: user!.id,
        symptom_type: symptomType,
        severity,
        description: '',
        date,
        time,
        created_at: '',
      },
    });
  };

  const getLatestMood = (): Mood | null => {
    if (moods.length === 0) return null;
    return moods[0];
  };

  const renderMoodSummary = () => {
    const latestMood = getLatestMood();
    if (!latestMood) {
      return (
        <TouchableOpacity
          style={styles.moodPrompt}
          onPress={() => navigation.navigate('MoodForm')}
        >
          <Text style={styles.moodPromptEmoji}>🤔</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.moodPromptTitle}>How are you feeling?</Text>
            <Text style={styles.moodPromptSubtitle}>Tap to log your mood</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.moodSummary}
        onPress={() => navigation.navigate('MoodForm')}
      >
        <Text style={styles.moodSummaryEmoji}>{latestMood.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moodSummaryTitle}>
            Feeling{' '}
            <Text style={{ color: MOOD_COLORS[latestMood.mood_type] || COLORS.accent }}>
              {latestMood.mood_type}
            </Text>
          </Text>
          {latestMood.notes ? (
            <Text style={styles.moodSummaryNotes} numberOfLines={1}>
              {latestMood.notes}
            </Text>
          ) : null}
        </View>
        <View style={styles.moodScoreBadge}>
          <Text style={styles.moodScoreText}>
            ⚡ {latestMood.energy_level ?? '-'}/10
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMealCard = (meal: Meal) => (
    <View key={meal.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.meal_time}</Text>
      </View>
      <Text style={styles.cardDescription}>{meal.description}</Text>
      <Text style={styles.ingredients}>
        Ingredients: {meal.ingredients.join(', ')}
      </Text>
    </View>
  );

  const renderSymptomCard = (symptom: Symptom) => (
    <View key={symptom.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{symptom.symptom_type}</Text>
        <View style={styles.severityContainer}>
          <Text style={styles.severityText}>Severity: {symptom.severity}/10</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{symptom.description}</Text>
      <Text style={styles.timeText}>Time: {symptom.time}</Text>
    </View>
  );

  const renderMoodCard = (mood: Mood) => (
    <View key={mood.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginRight: 8 }}>{mood.emoji}</Text>
          <Text style={[styles.cardTitle, { color: MOOD_COLORS[mood.mood_type] || COLORS.accent }]}>
            {mood.mood_type.charAt(0).toUpperCase() + mood.mood_type.slice(1)}
          </Text>
        </View>
        <Text style={styles.timeText}>{mood.time?.slice(0, 5)}</Text>
      </View>
      {mood.notes ? <Text style={styles.cardDescription}>{mood.notes}</Text> : null}
      {mood.energy_level != null && (
        <Text style={styles.ingredients}>Energy: {mood.energy_level}/10</Text>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadTodayData} />
      }
    >
      <View style={styles.content}>
        <View style={styles.welcomeContainer}>
          <LinearGradient
            style={styles.linearGradient}
            colors={['#3d1bf9ff', '#826ef5ff']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </LinearGradient>
        </View>

        {/* Mood Summary */}
        <View style={styles.containerSection}>
          {renderMoodSummary()}
        </View>

        {/* Quick Actions */}
        <View style={styles.containerSection}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('MealForm')}
              >
                <Ionicons name="restaurant" size={24} color={COLORS.accent} />
                <Text style={styles.actionButtonText}>Log Meal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('SymptomForm')}
              >
                <Ionicons name="medical" size={24} color={COLORS.accent} />
                <Text style={styles.actionButtonText}>Log Symptom</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('MoodForm')}
              >
                <Ionicons name="happy" size={24} color={COLORS.accent} />
                <Text style={styles.actionButtonText}>Log Mood</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* AI Recommendations */}
        <TouchableOpacity
          style={styles.containerSection}
          onPress={() => navigation.navigate('Recommendations')}
        >
          <View style={styles.aiBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiBannerTitle}>AI Meal Recommendations</Text>
              <Text style={styles.aiBannerSubtitle}>
                Get personalized suggestions based on your data
              </Text>
            </View>
            <Ionicons name="sparkles" size={28} color={COLORS.accent} />
          </View>
        </TouchableOpacity>

        {/* Quick Symptom Logging */}
        <View style={styles.containerSection}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Symptom Log</Text>
            <View style={styles.quickSymptoms}>
              <TouchableOpacity
                style={[styles.symptomButton, { backgroundColor: COLORS.background }]}
                onPress={() => quickLogSymptom('Nausea', 3)}
              >
                <Text style={styles.symptomButtonText}>Nausea</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.symptomButton, { backgroundColor: COLORS.background }]}
                onPress={() => quickLogSymptom('Headache', 5)}
              >
                <Text style={styles.symptomButtonText}>Headache</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.symptomButton, { backgroundColor: COLORS.background }]}
                onPress={() => quickLogSymptom('Stomach Pain', 6)}
              >
                <Text style={styles.symptomButtonText}>Stomachache</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Today's Moods */}
        {moods.length > 0 && (
          <View style={styles.containerSection}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Moods ({moods.length})</Text>
              {moods.map(renderMoodCard)}
            </View>
          </View>
        )}

        {/* Today's Meals */}
        <View style={styles.containerSection}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Meals ({meals.length})</Text>
            {meals.length === 0 ? (
              <Text style={styles.emptyText}>No meals logged today</Text>
            ) : (
              meals.map(renderMealCard)
            )}
          </View>
        </View>

        {/* Today's Symptoms */}
        <View style={styles.containerSection}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Symptoms ({symptoms.length})</Text>
            {symptoms.length === 0 ? (
              <Text style={styles.emptyText}>No symptoms logged today</Text>
            ) : (
              symptoms.map(renderSymptomCard)
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  linearGradient: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  welcomeContainer: {},
  content: {
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#ffffffbb',
    marginBottom: 24,
    textAlign: 'center',
  },
  containerSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 0.31,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 12,
  },
  quickSymptoms: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  symptomButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 0.33,
    justifyContent: 'center',
  },
  symptomButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 12,
  },
  moodPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  moodPromptEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  moodPromptSubtitle: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 2,
  },
  moodSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  moodSummaryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  moodSummaryNotes: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moodScoreBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moodScoreText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  aiBannerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.accent,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  ingredients: {
    fontSize: 12,
    color: COLORS.text,
  },
  severityContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: COLORS.text,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
