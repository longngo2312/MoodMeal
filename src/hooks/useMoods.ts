import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { moodService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Mood } from '../types';

export const useMoods = () => {
  const { user } = useAuth();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMoodsByDate = useCallback(async (date: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await moodService.getMoodsByDate(user.id, date);
      setMoods(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMoodsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    if (!user) return [];

    try {
      return await moodService.getMoodsByDateRange(user.id, startDate, endDate);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return [];
    }
  }, [user]);

  return { moods, loading, loadMoodsByDate, loadMoodsByDateRange };
};
