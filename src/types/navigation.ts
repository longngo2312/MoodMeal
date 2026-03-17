import { Meal, Symptom } from './models';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Profile: undefined;
  MealForm: { meal?: Meal } | undefined;
  SymptomForm: { symptom?: Symptom } | undefined;
  MoodForm: undefined;
};

export type BottomTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Settings: undefined;
};
