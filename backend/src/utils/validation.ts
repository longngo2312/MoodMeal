import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const profileSchema = z.object({
  name: z.string().optional(),
  age: z.number().int().min(0).optional(),
  gender: z.string().optional(),
  medical_history: z.array(z.string()).optional(),
});

export const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  description: z.string().optional().default(''),
  ingredients: z.array(z.string()).optional().default([]),
  meal_time: z.string().min(1, 'Meal time is required'),
  date: z.string().min(1, 'Date is required'),
});

export const symptomSchema = z.object({
  symptom_type: z.string().min(1, 'Symptom type is required'),
  severity: z.number().int().min(1).max(10),
  description: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
});

export const moodSchema = z.object({
  mood_type: z.string().min(1, 'Mood type is required'),
  mood_score: z.number().int().min(1).max(5),
  emoji: z.string().min(1, 'Emoji is required'),
  notes: z.string().optional().default(''),
  energy_level: z.number().int().min(1).max(5).nullable().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
});
