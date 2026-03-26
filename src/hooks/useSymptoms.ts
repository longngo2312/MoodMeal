import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { symptomService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Symptom } from '../types';

export const useSymptoms = (date?: string) => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSymptoms = useCallback(async () => {
    if (!user || !date) return;

    setLoading(true);
    try {
      const data = await symptomService.getSymptomsByDate(user.id, date);
      setSymptoms(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  useEffect(() => {
    loadSymptoms();
  }, [loadSymptoms]);

  return { symptoms, loading, refresh: loadSymptoms };
};
