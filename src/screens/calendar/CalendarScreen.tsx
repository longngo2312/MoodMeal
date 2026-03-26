import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/AuthContext';
import { mealService } from '../../services/mealService';
import { symptomService } from '../../services/symptomService';
import { moodService } from '../../services/moodService';
import { Meal, Symptom, Mood, DayData, RootStackParamList } from '../../types';

// TODO: [Phase 1.2] Replace local COLORS with useTheme() — same pattern as DashboardScreen.
//
// TODO: [Phase 4.4] Polish calendar interactions:
//   1. Selected day cell — animate a "lifted" feel: scale 1 → 1.08 + shadow increase (Reanimated).
//   2. Multi-dot markers — stagger their appearance when a new month loads.
//      Use Reanimated FadeIn with a delay: dot[0] delay 0ms, dot[1] delay 50ms, etc.
//   3. Day cells with data — render a soft mood-colored blur behind the day number.
//      The blur color = the mood color for that day (use theme.colors for mood color map).
//   4. Month swipe transition — add a horizontal swipe gesture that slides the month
//      in/out instead of the default jump.
//
// RESOURCES:
//   react-native-calendars theming — https://github.com/wix/react-native-calendars#customization
//   Reanimated stagger animation — https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations
//   react-native-gesture-handler pan — https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture
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

interface MultiDotMarkedDate {
  dots?: { key: string; color: string }[];
  selected?: boolean;
  selectedColor?: string;
}

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [monthlyData, setMonthlyData] = useState<Record<string, DayData>>({});
  const [markedDates, setMarkedDates] = useState<Record<string, MultiDotMarkedDate>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const loadMonthlyData = async (monthDate?: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      const d = monthDate || currentMonth;
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      const [mealsData, symptomsData, moodsData] = await Promise.all([
        mealService.getMealsByDateRange(user.id, startDate, endDate),
        symptomService.getSymptomsByDateRange(user.id, startDate, endDate),
        moodService.getMoodsByDateRange(user.id, startDate, endDate),
      ]);

      const dataByDate: Record<string, DayData> = {};
      const marked: Record<string, MultiDotMarkedDate> = {};

      (symptomsData || []).forEach(symptom => {
        if (!dataByDate[symptom.date]) {
          dataByDate[symptom.date] = { symptoms: [], meals: [], moods: [] };
        }
        dataByDate[symptom.date].symptoms.push(symptom);
      });

      (mealsData || []).forEach(meal => {
        if (!dataByDate[meal.date]) {
          dataByDate[meal.date] = { symptoms: [], meals: [], moods: [] };
        }
        dataByDate[meal.date].meals.push(meal);
      });

      (moodsData || []).forEach(mood => {
        if (!dataByDate[mood.date]) {
          dataByDate[mood.date] = { symptoms: [], meals: [], moods: [] };
        }
        dataByDate[mood.date].moods.push(mood);
      });

      // Build multi-dot markers
      Object.keys(dataByDate).forEach(date => {
        const dayData = dataByDate[date];
        const dots: { key: string; color: string }[] = [];

        if (dayData.meals.length > 0) {
          dots.push({ key: 'meals', color: '#4caf50' });
        }
        if (dayData.symptoms.length > 0) {
          dots.push({ key: 'symptoms', color: '#f44336' });
        }
        if (dayData.moods.length > 0) {
          dots.push({ key: 'moods', color: '#2196f3' });
        }

        marked[date] = { dots };
      });

      // Mark selected date
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: COLORS.accent,
      };

      setMonthlyData(dataByDate);
      setMarkedDates(marked);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMonthlyData();
    }, [user, currentMonth])
  );

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);

    const newMarked = { ...markedDates };

    // Deselect previous
    Object.keys(newMarked).forEach(date => {
      if (newMarked[date].selected) {
        newMarked[date] = {
          ...newMarked[date],
          selected: false,
          selectedColor: undefined,
        };
      }
    });

    newMarked[day.dateString] = {
      ...newMarked[day.dateString],
      selected: true,
      selectedColor: COLORS.accent,
    };

    setMarkedDates(newMarked);
  };

  const onMonthChange = (month: DateData) => {
    const newMonth = new Date(month.year, month.month - 1, 1);
    setCurrentMonth(newMonth);
  };

  const getSeverityColor = (severity: number): string => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  const renderSymptomCard = (symptom: Symptom) => (
    <View key={symptom.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{symptom.symptom_type}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(symptom.severity) }]}>
          <Text style={styles.severityText}>{symptom.severity}/10</Text>
        </View>
      </View>
      {symptom.description ? <Text style={styles.cardDescription}>{symptom.description}</Text> : null}
      <Text style={styles.timeText}>Time: {symptom.time}</Text>
    </View>
  );

  const renderMealCard = (meal: Meal) => (
    <TouchableOpacity
      key={meal.id}
      style={styles.card}
      onPress={() => navigation.navigate('MealForm', { meal })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.meal_time}</Text>
      </View>
      {meal.description ? <Text style={styles.cardDescription}>{meal.description}</Text> : null}
      {meal.ingredients.length > 0 && (
        <Text style={styles.ingredientsText}>
          {meal.ingredients.join(', ')}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderMoodCard = (mood: Mood) => (
    <View key={mood.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>{mood.emoji}</Text>
          <Text style={[styles.cardTitle, { color: MOOD_COLORS[mood.mood_type] || COLORS.accent }]}>
            {mood.mood_type.charAt(0).toUpperCase() + mood.mood_type.slice(1)}
          </Text>
        </View>
        <Text style={styles.timeText}>{mood.time?.slice(0, 5)}</Text>
      </View>
      {mood.notes ? <Text style={styles.cardDescription}>{mood.notes}</Text> : null}
      {mood.energy_level != null && (
        <Text style={styles.ingredientsText}>Energy: {mood.energy_level}/10</Text>
      )}
    </View>
  );

  const selectedDayData = monthlyData[selectedDate] || { symptoms: [], meals: [], moods: [] };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Calendar
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: COLORS.surface,
            textSectionTitleColor: COLORS.text,
            selectedDayBackgroundColor: '#4037dfff',
            selectedDayTextColor: '#000000ff',
            todayTextColor: COLORS.text,
            dayTextColor: COLORS.text,
            textDisabledColor: '#555',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: COLORS.accent,
            disabledArrowColor: '#555',
            monthTextColor: COLORS.accent,
            indicatorColor: COLORS.text,
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
          }}
        />

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4caf50' }]} />
              <Text style={styles.legendText}>Meals</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
              <Text style={styles.legendText}>Symptoms</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2196f3' }]} />
              <Text style={styles.legendText}>Moods</Text>
            </View>
          </View>
        </View>

        <View style={styles.dayDetails}>
          <Text style={styles.dayTitle}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {selectedDayData.moods.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="happy-outline" size={16} color="#2196f3" />{' '}
                Moods ({selectedDayData.moods.length})
              </Text>
              {selectedDayData.moods.map(renderMoodCard)}
            </View>
          )}

          {selectedDayData.meals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="restaurant-outline" size={16} color="#4caf50" />{' '}
                Meals ({selectedDayData.meals.length})
              </Text>
              {selectedDayData.meals.map(renderMealCard)}
            </View>
          )}

          {selectedDayData.symptoms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="medical-outline" size={16} color="#f44336" />{' '}
                Symptoms ({selectedDayData.symptoms.length})
              </Text>
              {selectedDayData.symptoms.map(renderSymptomCard)}
            </View>
          )}

          {selectedDayData.symptoms.length === 0 &&
            selectedDayData.meals.length === 0 &&
            selectedDayData.moods.length === 0 && (
              <Text style={styles.emptyText}>No data recorded for this day</Text>
            )}
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
  content: {
    padding: 16,
  },
  legend: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.text,
  },
  dayDetails: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ingredientsText: {
    fontSize: 11,
    color: '#888',
  },
  severityBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  severityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  mealTime: {
    fontSize: 10,
    color: '#4caf50',
    backgroundColor: '#1b3a1b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timeText: {
    fontSize: 10,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
