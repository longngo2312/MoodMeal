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
import Slider from '@react-native-community/slider';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { RootStackParamList, SymptomFormData } from '../types';

type SymptomFormRouteProp = RouteProp<RootStackParamList, 'SymptomForm'>;

export const SymptomFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<SymptomFormRouteProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SymptomFormData>({
    symptom_type: '',
    severity: 5,
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
  });

  useEffect(() => {
    if (route.params?.symptom) {
      const symptom = route.params.symptom;
      setFormData({
        symptom_type: symptom.symptom_type,
        severity: symptom.severity,
        description: symptom.description,
        date: symptom.date,
        time: symptom.time,
      });
    }
  }, [route.params]);

  const saveSymptom = async () => {
    if (!formData.symptom_type) {
      Alert.alert('Error', 'Please enter a symptom type');
      return;
    }

    setLoading(true);
    try {
      const symptomData = {
        user_id: user!.id,
        symptom_type: formData.symptom_type,
        severity: formData.severity,
        description: formData.description,
        date: formData.date,
        time: formData.time,
      };

      if (route.params?.symptom && route.params.symptom.id) {
        // Update existing symptom
        const { error } = await supabase
          .from('symptoms')
          .update(symptomData)
          .eq('id', route.params.symptom.id);
        
        if (error) throw error;
        Alert.alert('Success', 'Symptom updated successfully!');
      } else {
        // Create new symptom
        const { error } = await supabase
          .from('symptoms')
          .insert([symptomData]);
        
        if (error) throw error;
        Alert.alert('Success', 'Symptom logged successfully!');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return '#4caf50';
    if (severity <= 6) return '#ff9800';
    return '#f44336';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 2) return 'Very Mild';
    if (severity <= 4) return 'Mild';
    if (severity <= 6) return 'Moderate';
    if (severity <= 8) return 'Severe';
    return 'Very Severe';
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>Symptom Type *</Text>
            <TextInput
              style={styles.input}
              value={formData.symptom_type}
              onChangeText={(text) => setFormData(prev => ({ ...prev, symptom_type: text }))}
              placeholder="e.g., Headache, Nausea, Stomach Pain"
            />

            <Text style={styles.label}>Severity (1-10)</Text>
            <View style={styles.severityContainer}>
              <View style={styles.severityHeader}>
                <Text style={[styles.severityValue, { color: getSeverityColor(formData.severity) }]}>
                  {formData.severity}/10
                </Text>
                <Text style={[styles.severityLabel, { color: getSeverityColor(formData.severity) }]}>
                  {getSeverityLabel(formData.severity)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={formData.severity}
                onValueChange={(value: number) => setFormData(prev => ({ ...prev, severity: value }))}
                minimumTrackTintColor={getSeverityColor(formData.severity)}
                maximumTrackTintColor="#ddd"
                thumbTintColor={getSeverityColor(formData.severity)}
              />
              <View style={styles.severityScale}>
                <Text style={styles.scaleText}>1 (Mild)</Text>
                <Text style={styles.scaleText}>10 (Severe)</Text>
              </View>
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your symptom in detail"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={formData.time}
              onChangeText={(text) => setFormData(prev => ({ ...prev, time: text }))}
              placeholder="HH:MM:SS"
            />

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={saveSymptom}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : route.params?.symptom?.id ? 'Update Symptom' : 'Save Symptom'}
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
    height: 100,
    textAlignVertical: 'top',
  },
  severityContainer: {
    marginBottom: 16,
  },
  severityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  severityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleText: {
    fontSize: 12,
    color: '#666',
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
