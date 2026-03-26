import { api } from './api';

export interface RecommendationResponse {
  recommendation: string;
  dataUsed: {
    mealsCount: number;
    symptomsCount: number;
    moodsCount: number;
  };
}

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  prepTime: string;
  tags: string[];
}

export interface RecipeResponse {
  recipes: Recipe[];
  rawResponse?: string;
}

export const recommendationService = {
  async getRecommendations(prompt?: string): Promise<RecommendationResponse> {
    const { data, error } = await api.post<RecommendationResponse>('/recommendations', {
      prompt: prompt || 'Give me meal recommendations for today based on my history.',
    });
    if (error) throw new Error(error);
    return data!;
  },

  async searchRecipes(query: string): Promise<RecipeResponse> {
    const { data, error } = await api.get<RecipeResponse>(
      `/recommendations/recipes?query=${encodeURIComponent(query)}`
    );
    if (error) throw new Error(error);
    return data!;
  },
};
