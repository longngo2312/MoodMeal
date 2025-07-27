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
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
export const ProfileScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    age: 0,
    gender: 'other',
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
        .eq('user_id', user.id)
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
    } catch (error) {
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

  const removeMedicalHistory = (index) => {
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
          user_id: user.id,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          medical_history: profile.medical_history,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
  {/* Rendering the setting screens */}
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
            />

            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={profile.age.toString()}
              onChangeText={(text) => setProfile(prev => ({ ...prev, age: parseInt(text) || 0 }))}
              placeholder="Enter your age"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={profile.gender}
                onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

            <Text style={styles.label}>Medical History</Text>
            <View style={styles.medicalHistoryContainer}>
              <TextInput
                style={styles.input}
                value={medicalHistoryInput}
                onChangeText={setMedicalHistoryInput}
                placeholder="Add allergies, conditions, etc."
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
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Profile'}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
    textAlign: 'center',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  medicalHistoryContainer: {
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
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyText: {
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
