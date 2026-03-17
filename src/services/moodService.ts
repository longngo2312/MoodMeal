import { api } from './api';
import { Mood } from '../types';

export interface MoodFormData {
  mood_type: string;
  mood_score: number;
  emoji: string;
  notes: string;
  energy_level: number | null;
  date: string;
  time: string;
}

export const moodService = {
  async getMoodsByDate(_userId: string, date: string): Promise<Mood[]> {
    const { data, error } = await api.get<Mood[]>(`/moods?date=${date}`);
    if (error) throw new Error(error);
    return data || [];
  },

  async getMoodsByDateRange(_userId: string, startDate: string, endDate: string): Promise<Mood[]> {
    const { data, error } = await api.get<Mood[]>(`/moods?start_date=${startDate}&end_date=${endDate}`);
    if (error) throw new Error(error);
    return data || [];
  },

  async createMood(_userId: string, moodData: MoodFormData): Promise<void> {
    const { error } = await api.post('/moods', moodData);
    if (error) throw new Error(error);
  },

  async updateMood(moodId: string, _userId: string, moodData: MoodFormData): Promise<void> {
    const { error } = await api.put(`/moods/${moodId}`, moodData);
    if (error) throw new Error(error);
  },

  async deleteMood(moodId: string): Promise<void> {
    const { error } = await api.delete(`/moods/${moodId}`);
    if (error) throw new Error(error);
  },
};
