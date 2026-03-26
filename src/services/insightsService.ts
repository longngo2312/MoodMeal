import { Meal, Symptom, Mood } from '../types';

export interface InsightCorrelation {
  ingredient: string;
  symptomType: string;
  occurrences: number;
  avgSeverity: number;
}

export interface MoodTrend {
  date: string;
  avgScore: number;
  avgEnergy: number;
}

export interface DailySummary {
  date: string;
  mealCount: number;
  symptomCount: number;
  moodCount: number;
  avgMoodScore: number;
  avgSeverity: number;
}

export interface InsightsData {
  correlations: InsightCorrelation[];
  moodTrends: MoodTrend[];
  dailySummaries: DailySummary[];
  topSymptoms: { type: string; count: number; avgSeverity: number }[];
  moodDistribution: { type: string; count: number; emoji: string }[];
  mealTimeCounts: { time: string; count: number }[];
}

export const insightsService = {
  /**
   * Find correlations between ingredients and symptoms.
   * For each symptom, look at meals eaten the same day and prior day,
   * and find which ingredients appear most often with that symptom.
   */
  findCorrelations(
    meals: Meal[],
    symptoms: Symptom[]
  ): InsightCorrelation[] {
    const correlationMap: Record<string, { count: number; totalSeverity: number }> = {};

    symptoms.forEach((symptom) => {
      const symptomDate = new Date(symptom.date);
      const prevDate = new Date(symptomDate);
      prevDate.setDate(prevDate.getDate() - 1);

      const prevDateStr = prevDate.toISOString().split('T')[0];

      // Find meals from same day or previous day
      const relatedMeals = meals.filter(
        (m) => m.date === symptom.date || m.date === prevDateStr
      );

      relatedMeals.forEach((meal) => {
        meal.ingredients.forEach((ingredient) => {
          const key = `${ingredient.toLowerCase()}|${symptom.symptom_type}`;
          if (!correlationMap[key]) {
            correlationMap[key] = { count: 0, totalSeverity: 0 };
          }
          correlationMap[key].count += 1;
          correlationMap[key].totalSeverity += symptom.severity;
        });
      });
    });

    return Object.entries(correlationMap)
      .map(([key, value]) => {
        const [ingredient, symptomType] = key.split('|');
        return {
          ingredient,
          symptomType,
          occurrences: value.count,
          avgSeverity: Math.round((value.totalSeverity / value.count) * 10) / 10,
        };
      })
      .filter((c) => c.occurrences >= 2) // Only show correlations with 2+ occurrences
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10);
  },

  /**
   * Calculate mood trends over time
   */
  calculateMoodTrends(moods: Mood[]): MoodTrend[] {
    const byDate: Record<string, { scores: number[]; energies: number[] }> = {};

    moods.forEach((mood) => {
      if (!byDate[mood.date]) {
        byDate[mood.date] = { scores: [], energies: [] };
      }
      byDate[mood.date].scores.push(mood.mood_score);
      if (mood.energy_level != null) {
        byDate[mood.date].energies.push(mood.energy_level);
      }
    });

    return Object.entries(byDate)
      .map(([date, data]) => ({
        date,
        avgScore:
          Math.round(
            (data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10
          ) / 10,
        avgEnergy:
          data.energies.length > 0
            ? Math.round(
                (data.energies.reduce((a, b) => a + b, 0) / data.energies.length) * 10
              ) / 10
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Generate daily summaries
   */
  generateDailySummaries(
    meals: Meal[],
    symptoms: Symptom[],
    moods: Mood[]
  ): DailySummary[] {
    const allDates = new Set<string>();
    meals.forEach((m) => allDates.add(m.date));
    symptoms.forEach((s) => allDates.add(s.date));
    moods.forEach((m) => allDates.add(m.date));

    return Array.from(allDates)
      .map((date) => {
        const dayMeals = meals.filter((m) => m.date === date);
        const daySymptoms = symptoms.filter((s) => s.date === date);
        const dayMoods = moods.filter((m) => m.date === date);

        return {
          date,
          mealCount: dayMeals.length,
          symptomCount: daySymptoms.length,
          moodCount: dayMoods.length,
          avgMoodScore:
            dayMoods.length > 0
              ? Math.round(
                  (dayMoods.reduce((a, m) => a + m.mood_score, 0) / dayMoods.length) * 10
                ) / 10
              : 0,
          avgSeverity:
            daySymptoms.length > 0
              ? Math.round(
                  (daySymptoms.reduce((a, s) => a + s.severity, 0) / daySymptoms.length) *
                    10
                ) / 10
              : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  /**
   * Get top symptom types
   */
  getTopSymptoms(symptoms: Symptom[]): { type: string; count: number; avgSeverity: number }[] {
    const map: Record<string, { count: number; totalSev: number }> = {};
    symptoms.forEach((s) => {
      if (!map[s.symptom_type]) {
        map[s.symptom_type] = { count: 0, totalSev: 0 };
      }
      map[s.symptom_type].count += 1;
      map[s.symptom_type].totalSev += s.severity;
    });

    return Object.entries(map)
      .map(([type, data]) => ({
        type,
        count: data.count,
        avgSeverity: Math.round((data.totalSev / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },

  /**
   * Get mood distribution
   */
  getMoodDistribution(moods: Mood[]): { type: string; count: number; emoji: string }[] {
    const EMOJI_MAP: Record<string, string> = {
      great: '😄',
      good: '🙂',
      okay: '😐',
      bad: '😞',
      awful: '😢',
    };
    const map: Record<string, number> = {};
    moods.forEach((m) => {
      map[m.mood_type] = (map[m.mood_type] || 0) + 1;
    });

    return Object.entries(map)
      .map(([type, count]) => ({ type, count, emoji: EMOJI_MAP[type] || '❓' }))
      .sort((a, b) => b.count - a.count);
  },

  /**
   * Get meal time distribution
   */
  getMealTimeCounts(meals: Meal[]): { time: string; count: number }[] {
    const map: Record<string, number> = {};
    meals.forEach((m) => {
      map[m.meal_time] = (map[m.meal_time] || 0) + 1;
    });
    const order = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    return order
      .filter((t) => map[t])
      .map((time) => ({ time, count: map[time] }));
  },

  /**
   * Generate full insights from all data
   */
  generateInsights(meals: Meal[], symptoms: Symptom[], moods: Mood[]): InsightsData {
    return {
      correlations: this.findCorrelations(meals, symptoms),
      moodTrends: this.calculateMoodTrends(moods),
      dailySummaries: this.generateDailySummaries(meals, symptoms, moods),
      topSymptoms: this.getTopSymptoms(symptoms),
      moodDistribution: this.getMoodDistribution(moods),
      mealTimeCounts: this.getMealTimeCounts(meals),
    };
  },
};
