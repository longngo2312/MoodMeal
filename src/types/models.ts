export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Others';
  medical_history: string[];
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  ingredients: string[];
  meal_time: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  date: string;
  created_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  symptom_type: string;
  severity: number;
  description: string;
  date: string;
  time: string;
  created_at: string;
}

export interface Mood {
  id: string;
  user_id: string;
  mood_type: 'great' | 'good' | 'okay' | 'bad' | 'awful';
  mood_score: number;
  emoji: string;
  notes: string;
  energy_level: number | null;
  date: string;
  time: string;
  created_at: string;
}

export interface MealFormData {
  name: string;
  description: string;
  ingredients: string[];
  meal_time: string;
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
  gender: string;
  medical_history: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface DayData {
  meals: Meal[];
  symptoms: Symptom[];
  moods: Mood[];
}
