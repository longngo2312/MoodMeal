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
import { Dropdown } from 'react-native-element-dropdown';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { ProfileFormData } from '../../types';

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9ff',
};

const genderData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' },
];

export const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [profile, setProfile] = useState<ProfileFormData>({
    name: '',
    age: 0,
    gender: 'Others',
    medical_history: [],
  });
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          name: data.name,
          age: data.age,
          gender: data.gender,
          medical_history: data.medical_history || [],
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const addMedicalHistory = () => {
    if (medicalHistoryInput.trim()) {
      setProfile(prev => ({
        ...prev,
        medical_history: [...prev.medical_history, medicalHistoryInput.trim()],
      }));
      setMedicalHistoryInput('');
    }
  };

  const removeMedicalHistory = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medical_history: prev.medical_history.filter((_, i) => i !== index),
    }));
  };

  const saveProfile = async () => {
    if (!profile.name || !profile.age) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user!.id,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          medical_history: profile.medical_history,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile saved successfully!');
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
          <Text style={styles.title}>Create Your Profile</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              placeholderTextColor="#606060ff"
            />

            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={profile.age.toString()}
              onChangeText={(text) => setProfile(prev => ({ ...prev, age: parseInt(text) || 0 }))}
              placeholder="Enter your age"
              placeholderTextColor="#606060ff"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: COLORS.accent }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                iconStyle={styles.iconStyle}
                data={genderData}
                search
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select gender' : '...'}
                searchPlaceholder="Search..."
                value={profile.gender}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setProfile(prev => ({ ...prev, gender: item.value }));
                  setIsFocus(false);
                }}
              />
            </View>

            <Text style={styles.label}>Medical History</Text>
            <View style={styles.medicalHistoryContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={medicalHistoryInput}
                onChangeText={setMedicalHistoryInput}
                placeholder="Add allergies, conditions, etc."
                placeholderTextColor="#606060ff"
              />
              <TouchableOpacity style={styles.addButton} onPress={addMedicalHistory}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {profile.medical_history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>{item}</Text>
                <TouchableOpacity onPress={() => removeMedicalHistory(index)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={saveProfile}
              disabled={loading}
            >
              <LinearGradient
                style={styles.linearGradient}
                colors={['#3d1bf9ff', '#826ef5ff']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Profile'}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 20,
    textAlign: 'center',
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
    borderColor: '#555',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: COLORS.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    height: 50,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: COLORS.text,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  medicalHistoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
  },
  addButtonText: {
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  removeText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  saveButton: {
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linearGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
