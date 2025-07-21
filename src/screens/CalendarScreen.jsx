import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export const CalendarScreen = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  /** @type {[Object, Function]} */
  const [monthlyData, setMonthlyData] = useState({});
  /** @type {[Object, Function]} */
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMonthlyData();
  }, []);

  const loadMonthlyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const currentDate = new Date();
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      // Load symptoms for the month
      const { data: symptomsData, error: symptomsError } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (symptomsError) throw symptomsError;

      // Load meals for the month
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (mealsError) throw mealsError;

      // Organize data by date
      const dataByDate = {};
      const marked = {};

      // Process symptoms
      (symptomsData || []).forEach(symptom => {
        if (!dataByDate[symptom.date]) {
          dataByDate[symptom.date] = { symptoms: [], meals: [] };
        }
        dataByDate[symptom.date].symptoms.push(symptom);
      });

      // Process meals
      (mealsData || []).forEach(meal => {
        if (!dataByDate[meal.date]) {
          dataByDate[meal.date] = { symptoms: [], meals: [] };
        }
        dataByDate[meal.date].meals.push(meal);
      });

      // Create marked dates for calendar
      Object.keys(dataByDate).forEach(date => {
        const dayData = dataByDate[date];
        const hasSymptoms = dayData.symptoms.length > 0;
        const hasMeals = dayData.meals.length > 0;
        
        let color = '#e0e0e0';
        if (hasSymptoms && hasMeals) {
          color = '#ff9800'; // Orange for both
        } else if (hasSymptoms) {
          color = '#f44336'; // Red for symptoms
        } else if (hasMeals) {
          color = '#4caf50'; // Green for meals
        }

        marked[date] = {
          marked: true,
          dotColor: color,
          selectedColor: date === selectedDate ? '#2e7d32' : undefined,
        };
      });

      // Mark selected date
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#2e7d32',
      };

      setMonthlyData(dataByDate);
      setMarkedDates(marked);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    
    // Update marked dates to show new selection
    const newMarked = { ...markedDates };
    
    // Remove previous selection
    Object.keys(newMarked).forEach(date => {
      if (newMarked[date].selected) {
        newMarked[date] = {
          ...newMarked[date],
          selected: false,
          selectedColor: undefined,
        };
      }
    });
    
    // Add new selection
    newMarked[day.dateString] = {
      ...newMarked[day.dateString],
      selected: true,
      selectedColor: '#2e7d32',
    };
    
    setMarkedDates(newMarked);
  };

  const renderSymptomCard = (symptom) => (
    <View key={symptom.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{symptom.symptom_type}</Text>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(symptom.severity) }]}>
          <Text style={styles.severityText}>{symptom.severity}/10</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{symptom.description}</Text>
      <Text style={styles.timeText}>Time: {symptom.time}</Text>
    </View>
  );

  const renderMealCard = (meal) => (
    <View key={meal.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.meal_time}</Text>
      </View>
      <Text style={styles.cardDescription}>{meal.description}</Text>
    </View>
  );

  const getSeverityColor = (severity) => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  const selectedDayData = monthlyData[selectedDate] || { symptoms: [], meals: [] };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#2e7d32',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#2e7d32',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: '#2e7d32',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2e7d32',
            indicatorColor: '#2e7d32',
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
              <Text style={styles.legendText}>Meals only</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f44336' }]} />
              <Text style={styles.legendText}>Symptoms only</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ff9800' }]} />
              <Text style={styles.legendText}>Both</Text>
            </View>
          </View>
        </View>

        <View style={styles.dayDetails}>
          <Text style={styles.dayTitle}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>

          {selectedDayData.symptoms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Symptoms ({selectedDayData.symptoms.length})
              </Text>
              {selectedDayData.symptoms.map(renderSymptomCard)}
            </View>
          )}

          {selectedDayData.meals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Meals ({selectedDayData.meals.length})
              </Text>
              {selectedDayData.meals.map(renderMealCard)}
            </View>
          )}

          {selectedDayData.symptoms.length === 0 && selectedDayData.meals.length === 0 && (
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  legend: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
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
    color: '#666',
  },
  dayDetails: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#f9f9f9',
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
    color: '#333',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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
    color: '#666',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 10,
    color: '#999',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});
