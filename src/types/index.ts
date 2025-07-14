export * from './database';
import { Meal, Symptom } from './database';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface MealFormData {
  name: string;
  description: string;
  ingredients: string[];
  meal_time: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface SymptomFormData {
  symptom_type: string;
  severity: number;
  description: string;
  date: string;
  time: string;
}

export interface ProfileFormData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  medical_history: string[];
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  MealForm: { meal?: Meal };
  SymptomForm: { symptom?: Symptom };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Settings: undefined;
};
