import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { recommendationService, Recipe } from '../../services/recommendationService';

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9',
};

export const RecommendationsScreen: React.FC = () => {
  const [recommendation, setRecommendation] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'recipes'>('ai');

  const getRecommendations = async () => {
    setLoadingRec(true);
    try {
      const result = await recommendationService.getRecommendations();
      setRecommendation(result.recommendation);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingRec(false);
    }
  };

  const searchRecipes = async () => {
    if (!recipeQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setLoadingRecipes(true);
    try {
      const result = await recommendationService.searchRecipes(recipeQuery);
      setRecipes(result.recipes);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const renderRecipeCard = (recipe: Recipe, index: number) => (
    <View key={index} style={styles.recipeCard}>
      <Text style={styles.recipeName}>{recipe.name}</Text>
      <Text style={styles.recipeDescription}>{recipe.description}</Text>

      <View style={styles.recipeMetaRow}>
        <View style={styles.recipeMeta}>
          <Ionicons name="time-outline" size={14} color={COLORS.accent} />
          <Text style={styles.recipeMetaText}>{recipe.prepTime}</Text>
        </View>
        <View style={styles.tagRow}>
          {recipe.tags?.map((tag, i) => (
            <View key={i} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.recipeSection}>
        <Text style={styles.recipeSectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ing, i) => (
          <Text key={i} style={styles.ingredientItem}>
            {'  \u2022  '}{ing}
          </Text>
        ))}
      </View>

      <View style={styles.recipeSection}>
        <Text style={styles.recipeSectionTitle}>Instructions</Text>
        <Text style={styles.recipeInstructions}>{recipe.instructions}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
            onPress={() => setActiveTab('ai')}
          >
            <Ionicons
              name="sparkles"
              size={16}
              color={activeTab === 'ai' ? '#fff' : COLORS.accent}
            />
            <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
              AI Recommendations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recipes' && styles.tabActive]}
            onPress={() => setActiveTab('recipes')}
          >
            <Ionicons
              name="book-outline"
              size={16}
              color={activeTab === 'recipes' ? '#fff' : COLORS.accent}
            />
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.tabTextActive]}>
              Recipe Search
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'ai' && (
          <View>
            <View style={styles.aiSection}>
              <Text style={styles.aiTitle}>Personalized Recommendations</Text>
              <Text style={styles.aiSubtitle}>
                AI analyzes your meals, symptoms, and moods to suggest the best foods for you
              </Text>

              <TouchableOpacity
                style={[styles.generateButton, loadingRec && styles.buttonDisabled]}
                onPress={getRecommendations}
                disabled={loadingRec}
              >
                <LinearGradient
                  style={styles.gradient}
                  colors={['#3d1bf9', '#826ef5']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                >
                  {loadingRec ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="white" />
                      <Text style={styles.generateButtonText}>Generate Recommendations</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {recommendation ? (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Ionicons name="bulb-outline" size={20} color={COLORS.accent} />
                  <Text style={styles.resultTitle}>Your Recommendations</Text>
                </View>
                <Text style={styles.resultText}>{recommendation}</Text>
              </View>
            ) : null}
          </View>
        )}

        {activeTab === 'recipes' && (
          <View>
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                value={recipeQuery}
                onChangeText={setRecipeQuery}
                placeholder="e.g., healthy lunch, anti-inflammatory..."
                placeholderTextColor="#606060"
                onSubmitEditing={searchRecipes}
              />
              <TouchableOpacity
                style={[styles.searchButton, loadingRecipes && styles.buttonDisabled]}
                onPress={searchRecipes}
                disabled={loadingRecipes}
              >
                {loadingRecipes ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Ionicons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {recipes.length > 0 && (
              <View>
                {recipes.map((recipe, index) => renderRecipeCard(recipe, index))}
              </View>
            )}

            {recipes.length === 0 && !loadingRecipes && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🍽️</Text>
                <Text style={styles.emptyTitle}>Search for recipes</Text>
                <Text style={styles.emptyText}>
                  AI will find recipes that work well with your dietary needs and symptom history
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#fff',
  },
  aiSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  aiSubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  generateButton: {
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  resultText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  searchSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 13,
    color: '#bbb',
    marginBottom: 10,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetaText: {
    fontSize: 12,
    color: COLORS.accent,
    marginLeft: 4,
  },
  tagRow: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: '#3d1bf920',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.accent,
    fontWeight: '600',
  },
  recipeSection: {
    marginTop: 8,
  },
  recipeSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  ingredientItem: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
  recipeInstructions: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
