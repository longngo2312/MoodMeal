import { supabase } from './supabase';
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
  async getMoodsByDate(userId: string, date: string): Promise<Mood[]> {
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Mood[]) || [];
  },

  async getMoodsByDateRange(userId: string, startDate: string, endDate: string): Promise<Mood[]> {
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data as Mood[]) || [];
  },

  async createMood(userId: string, moodData: MoodFormData): Promise<void> {
    const { error } = await supabase
      .from('moods')
      .insert([{ user_id: userId, ...moodData }]);

    if (error) throw error;
  },

  async updateMood(moodId: string, userId: string, moodData: MoodFormData): Promise<void> {
    const { error } = await supabase
      .from('moods')
      .update({ user_id: userId, ...moodData })
      .eq('id', moodId);

    if (error) throw error;
  },

  async deleteMood(moodId: string): Promise<void> {
    const { error } = await supabase
      .from('moods')
      .delete()
      .eq('id', moodId);

    if (error) throw error;
  },
};
