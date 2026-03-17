import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/AuthContext';
import { mealService } from '../../services/mealService';
import { RootStackParamList, MealFormData } from '../../types';

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9ff',
};

type MealFormRouteProp = RouteProp<RootStackParamList, 'MealForm'>;
type MealFormNavigationProp = StackNavigationProp<RootStackParamList>;

const mealTimeData = [
  { label: 'Breakfast', value: 'Breakfast' },
  { label: 'Lunch', value: 'Lunch' },
  { label: 'Dinner', value: 'Dinner' },
  { label: 'Snack', value: 'Snack' },
];

export const MealFormScreen: React.FC = () => {
  const navigation = useNavigation<MealFormNavigationProp>();
  const route = useRoute<MealFormRouteProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);

  const [formData, setFormData] = useState<MealFormData>({
    name: '',
    description: '',
    ingredients: [],
    meal_time: 'Select Item',
    date: new Date().toISOString().split('T')[0],
  });

  const [ingredientInput, setIngredientInput] = useState('');

  useEffect(() => {
    if (route.params?.meal) {
      const meal = route.params.meal;
      setFormData({
        name: meal.name,
        description: meal.description,
        ingredients: meal.ingredients,
        meal_time: meal.meal_time,
        date: meal.date,
      });
    }
  }, [route.params]);

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()],
      }));
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const saveMeal = async () => {
    if (!formData.name || formData.ingredients.length === 0) {
      Alert.alert('Error', 'Please fill in meal name and add at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      if (route.params?.meal) {
        await mealService.updateMeal(route.params.meal.id, user!.id, formData);
        Alert.alert('Success', 'Meal updated successfully!');
      } else {
        await mealService.createMeal(user!.id, formData);
        Alert.alert('Success', 'Meal logged successfully!');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>Meal Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter meal name"
              placeholderTextColor="#606060ff"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your meal"
              placeholderTextColor="#606060ff"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Meal Time</Text>
            <View style={styles.pickerContainer}>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'green' }]}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={mealTimeData}
                search
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? '' : '...'}
                searchPlaceholder="Search..."
                value={formData.meal_time}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setFormData(prev => ({ ...prev, meal_time: item.value }));
                  setIsFocus(false);
                }}
              />
            </View>

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Ingredients *</Text>
            <View style={styles.ingredientContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={ingredientInput}
                onChangeText={setIngredientInput}
                placeholder="Add ingredient"
                placeholderTextColor="#606060ff"
              />
              <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {formData.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>{ingredient}</Text>
                <TouchableOpacity onPress={() => removeIngredient(index)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={saveMeal}
              disabled={loading}
            >
              <LinearGradient
                style={styles.linearGradient}
                colors={['#3d1bf9ff', '#826ef5ff']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : route.params?.meal ? 'Update Meal' : 'Save Meal'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    height: 50,
  },
  dropdown: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    height: 50,
  },
  selectedTextStyle: {
    color: COLORS.text,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    marginTop: -16,
  },
  addButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
  },
  removeText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  saveButton: {
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  linearGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
