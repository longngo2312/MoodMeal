import { supabase } from './supabase';
import { Symptom, SymptomFormData } from '../types';

export const symptomService = {
  async getSymptomsByDate(userId: string, date: string): Promise<Symptom[]> {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Symptom[]) || [];
  },

  async getSymptomsByDateRange(userId: string, startDate: string, endDate: string): Promise<Symptom[]> {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data as Symptom[]) || [];
  },

  async getAllSymptoms(userId: string): Promise<Symptom[]> {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as Symptom[]) || [];
  },

  async createSymptom(userId: string, symptomData: SymptomFormData): Promise<void> {
    const { error } = await supabase
      .from('symptoms')
      .insert([{ user_id: userId, ...symptomData }]);

    if (error) throw error;
  },

  async updateSymptom(symptomId: string, userId: string, symptomData: SymptomFormData): Promise<void> {
    const { error } = await supabase
      .from('symptoms')
      .update({ user_id: userId, ...symptomData })
      .eq('id', symptomId);

    if (error) throw error;
  },

  async deleteSymptom(symptomId: string): Promise<void> {
    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('id', symptomId);

    if (error) throw error;
  },
};
