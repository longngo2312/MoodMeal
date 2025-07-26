import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Success', 'Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get all meals
      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Get all symptoms
      const { data: symptoms } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #2e7d32; text-align: center; }
              h2 { color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 5px; }
              .profile { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .entry { background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
              .date { font-weight: bold; color: #666; }
              .severity { color: #f44336; font-weight: bold; }
              .meal-time { color: #4caf50; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>MoodMeal Health Report</h1>
            
            <div class="profile">
              <h2>Profile Information</h2>
              <p><strong>Name:</strong> ${profile?.name || 'N/A'}</p>
              <p><strong>Age:</strong> ${profile?.age || 'N/A'}</p>
              <p><strong>Gender:</strong> ${profile?.gender || 'N/A'}</p>
              <p><strong>Medical History:</strong> ${profile?.medical_history?.join(', ') || 'None'}</p>
            </div>

            <h2>Meal History (${meals?.length || 0} entries)</h2>
            ${meals?.map(meal => `
              <div class="entry">
                <div class="date">${meal.date} - <span class="meal-time">${meal.meal_time}</span></div>
                <h3>${meal.name}</h3>
                <p>${meal.description}</p>
                <p><strong>Ingredients:</strong> ${meal.ingredients.join(', ')}</p>
              </div>
            `).join('') || '<p>No meals recorded</p>'}

            <h2>Symptom History (${symptoms?.length || 0} entries)</h2>
            ${symptoms?.map(symptom => `
              <div class="entry">
                <div class="date">${symptom.date} ${symptom.time}</div>
                <h3>${symptom.symptom_type} - <span class="severity">Severity: ${symptom.severity}/10</span></h3>
                <p>${symptom.description}</p>
              </div>
            `).join('') || '<p>No symptoms recorded</p>'}

            <p style="text-align: center; margin-top: 30px; color: #666;">
              Generated on ${new Date().toLocaleDateString()}
            </p>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share your MoodMeal report',
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={24} color="#2e7d32" />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color="#2e7d32" />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={exportToPDF}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color="#2e7d32" />
              <Text style={styles.settingText}>
                {loading ? 'Generating PDF...' : 'Export Data as PDF'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={24} color="#f44336" />
              <Text style={[styles.settingText, { color: '#f44336' }]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MoodMeal v1.0.0</Text>
          <Text style={styles.footerText}>Track your meals and symptoms</Text>
        </View>
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={changePassword} disabled={loading}>
              <Text style={[styles.saveButton, loading && styles.disabledButton]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
            />

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  disabledButton: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
