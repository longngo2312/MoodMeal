import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { mealService } from '../services';
import { symptomService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { DayData } from '../types';
import { getMonthDateRange } from '../utils/dateUtils';

export const useCalendarData = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(false);

  const loadMonthData = useCallback(async (date?: Date) => {
    if (!user) return;

    setLoading(true);
    try {
      const { startDate, endDate } = getMonthDateRange(date);

      const [meals, symptoms] = await Promise.all([
        mealService.getMealsByDateRange(user.id, startDate, endDate),
        symptomService.getSymptomsByDateRange(user.id, startDate, endDate),
      ]);

      const dataByDate: Record<string, DayData> = {};

      symptoms.forEach(symptom => {
        if (!dataByDate[symptom.date]) {
          dataByDate[symptom.date] = { symptoms: [], meals: [], moods: [] };
        }
        dataByDate[symptom.date].symptoms.push(symptom);
      });

      meals.forEach(meal => {
        if (!dataByDate[meal.date]) {
          dataByDate[meal.date] = { symptoms: [], meals: [], moods: [] };
        }
        dataByDate[meal.date].meals.push(meal);
      });

      setMonthlyData(dataByDate);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { monthlyData, loading, loadMonthData };
};
