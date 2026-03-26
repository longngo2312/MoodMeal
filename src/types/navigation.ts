import { Meal, Symptom, Mood } from './models';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  MealForm: { meal?: Meal } | undefined;
  SymptomForm: { symptom?: Symptom } | undefined;
  MoodForm: { mood?: Mood } | undefined;
  Insights: undefined;
  Recommendations: undefined;
  Onboarding: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Insights: undefined;
  Calendar: undefined;
  Settings: undefined;
};
