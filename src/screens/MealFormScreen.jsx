import React, { useState, useEffect, useRef } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown'

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export const MealFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const data = [
    {label: 'Breakfast', value: 'Breakfast'},
    {label: 'Lunch', value: 'Lunch'},
    {label: 'Dinner', value: 'Dinner'},
    {label: 'Snack', value: 'Snack'},
  ]
  const [isFocus, setIsFocus] = useState(false);
  
  const [formData, setFormData] = useState({
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

  const removeIngredient = (index) => {
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
      const mealData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        meal_time: formData.meal_time,
        date: formData.date,
      };

      if (route.params?.meal) {
        // Update existing meal
        const { error } = await supabase
          .from('meals')
          .update(mealData)
          .eq('id', route.params.meal.id);
        
        if (error) throw error;
        Alert.alert('Success', 'Meal updated successfully!');
      } else {
        // Create new meal
        const { error } = await supabase
          .from('meals')
          .insert([mealData]);
        
        if (error) throw error;
        Alert.alert('Success', 'Meal logged successfully!');
      }

      navigation.goBack();
    } catch (error) {
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
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your meal"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Meal Time</Text>
            <View style={styles.pickerContainer}>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'green' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={data}
                search
                height= {50}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select item' : '...'}
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
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : route.params?.meal ? 'Update Meal' : 'Save Meal'}
              </Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
    maxHeight: 350,
    position: 'right',
    backgroundColor: 'White',
    paddingHorizontal: 8,
    height: 50,
  },
  iconStyle:{
    width: 20,
    height: 20,
  },
  ingredientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  addButtonText: {
    color: 'white',
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
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
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
