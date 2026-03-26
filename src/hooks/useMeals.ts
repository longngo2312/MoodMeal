import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { mealService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Meal } from '../types';

export const useMeals = (date?: string) => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMeals = useCallback(async () => {
    if (!user || !date) return;

    setLoading(true);
    try {
      const data = await mealService.getMealsByDate(user.id, date);
      setMeals(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  return { meals, loading, refresh: loadMeals };
};
