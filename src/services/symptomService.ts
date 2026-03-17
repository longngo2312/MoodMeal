import { api } from './api';
import { Symptom, SymptomFormData } from '../types';

export const symptomService = {
  async getSymptomsByDate(_userId: string, date: string): Promise<Symptom[]> {
    const { data, error } = await api.get<Symptom[]>(`/symptoms?date=${date}`);
    if (error) throw new Error(error);
    return data || [];
  },

  async getSymptomsByDateRange(_userId: string, startDate: string, endDate: string): Promise<Symptom[]> {
    const { data, error } = await api.get<Symptom[]>(`/symptoms?start_date=${startDate}&end_date=${endDate}`);
    if (error) throw new Error(error);
    return data || [];
  },

  async getAllSymptoms(_userId: string): Promise<Symptom[]> {
    const { data, error } = await api.get<Symptom[]>('/symptoms');
    if (error) throw new Error(error);
    return data || [];
  },

  async createSymptom(_userId: string, symptomData: SymptomFormData): Promise<void> {
    const { error } = await api.post('/symptoms', symptomData);
    if (error) throw new Error(error);
  },

  async updateSymptom(symptomId: string, _userId: string, symptomData: SymptomFormData): Promise<void> {
    const { error } = await api.put(`/symptoms/${symptomId}`, symptomData);
    if (error) throw new Error(error);
  },

  async deleteSymptom(symptomId: string): Promise<void> {
    const { error } = await api.delete(`/symptoms/${symptomId}`);
    if (error) throw new Error(error);
  },
};
