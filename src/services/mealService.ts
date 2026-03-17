import { supabase } from './supabase';
import { Meal, MealFormData } from '../types';

export const mealService = {
  async getMealsByDate(userId: string, date: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Meal[]) || [];
  },

  async getMealsByDateRange(userId: string, startDate: string, endDate: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data as Meal[]) || [];
  },

  async getAllMeals(userId: string): Promise<Meal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data as Meal[]) || [];
  },

  async createMeal(userId: string, mealData: MealFormData): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .insert([{ user_id: userId, ...mealData }]);

    if (error) throw error;
  },

  async updateMeal(mealId: string, userId: string, mealData: MealFormData): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .update({ user_id: userId, ...mealData })
      .eq('id', mealId);

    if (error) throw error;
  },

  async deleteMeal(mealId: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);

    if (error) throw error;
  },
};
