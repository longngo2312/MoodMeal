import { api } from './api';
import { Meal, MealFormData } from '../types';

export const mealService = {
  async getMealsByDate(_userId: string, date: string): Promise<Meal[]> {
    const { data, error } = await api.get<Meal[]>(`/meals?date=${date}`);
    if (error) throw new Error(error);
    return data || [];
  },

  async getMealsByDateRange(_userId: string, startDate: string, endDate: string): Promise<Meal[]> {
    const { data, error } = await api.get<Meal[]>(`/meals?start_date=${startDate}&end_date=${endDate}`);
    if (error) throw new Error(error);
    return data || [];
  },

  async getAllMeals(_userId: string): Promise<Meal[]> {
    const { data, error } = await api.get<Meal[]>('/meals');
    if (error) throw new Error(error);
    return data || [];
  },

  async createMeal(_userId: string, mealData: MealFormData): Promise<void> {
    const { error } = await api.post('/meals', mealData);
    if (error) throw new Error(error);
  },

  async updateMeal(mealId: string, _userId: string, mealData: MealFormData): Promise<void> {
    const { error } = await api.put(`/meals/${mealId}`, mealData);
    if (error) throw new Error(error);
  },

  async deleteMeal(mealId: string): Promise<void> {
    const { error } = await api.delete(`/meals/${mealId}`);
    if (error) throw new Error(error);
  },
};
