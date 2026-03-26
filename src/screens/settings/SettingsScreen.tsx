import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { exportService } from '../../services/exportService';
import { notificationService, NotificationPrefs } from '../../services/notificationService';
import { RootStackParamList } from '../../types';

const COLORS = {
  background: '#111111',
  accent: '#00e6ff',
  text: '#eeeeee',
  surface: '#2c2c2c',
  primary: '#3d1bf9ff',
};

type SettingsNavigationProp = StackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { user, signOut } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    notificationService.getPrefs().then(setNotifPrefs);
  }, []);

  const updateNotifPref = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!notifPrefs) return;
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    await notificationService.savePrefs(updated);
  };

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
            } catch (error: any) {
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
      await authService.updatePassword(newPassword);

      Alert.alert('Success', 'Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await exportService.exportToPDF(user.id);
    } catch (error: any) {
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
              <Ionicons name="person-outline" size={24} color={COLORS.accent} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.accent} />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        {notifPrefs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.accent} />
                <Text style={styles.settingText}>Enable Notifications</Text>
              </View>
              <Switch
                value={notifPrefs.enabled}
                onValueChange={(v) => updateNotifPref('enabled', v)}
                trackColor={{ false: '#555', true: COLORS.accent + '60' }}
                thumbColor={notifPrefs.enabled ? COLORS.accent : '#888'}
              />
            </View>

            {notifPrefs.enabled && (
              <>
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="restaurant-outline" size={24} color="#4caf50" />
                    <View>
                      <Text style={styles.settingText}>Meal Reminders</Text>
                      <Text style={styles.settingSubtext}>8:00, 12:30, 18:30</Text>
                    </View>
                  </View>
                  <Switch
                    value={notifPrefs.mealReminders}
                    onValueChange={(v) => updateNotifPref('mealReminders', v)}
                    trackColor={{ false: '#555', true: '#4caf5060' }}
                    thumbColor={notifPrefs.mealReminders ? '#4caf50' : '#888'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <Ionicons name="happy-outline" size={24} color="#ff9800" />
                    <View>
                      <Text style={styles.settingText}>Mood Check-In</Text>
                      <Text style={styles.settingSubtext}>Daily at 20:00</Text>
                    </View>
                  </View>
                  <Switch
                    value={notifPrefs.moodCheckIn}
                    onValueChange={(v) => updateNotifPref('moodCheckIn', v)}
                    trackColor={{ false: '#555', true: '#ff980060' }}
                    thumbColor={notifPrefs.moodCheckIn ? '#ff9800' : '#888'}
                  />
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={exportToPDF}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.accent} />
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
          <Text style={styles.footerText}>MoodMeal v2.0.0</Text>
          <Text style={styles.footerText}>Track your meals, moods, and symptoms</Text>
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
              <Text style={[styles.modalSaveButton, loading && styles.disabledButton]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Current Password</Text>
            <TextInput
              style={styles.modalInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="Enter current password"
              placeholderTextColor="#606060"
            />

            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password"
              placeholderTextColor="#606060"
            />

            <Text style={styles.modalLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
              placeholderTextColor="#606060"
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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: COLORS.accent,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  settingSubtext: {
    fontSize: 11,
    color: '#999',
    marginLeft: 12,
    marginTop: 2,
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
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cancelButton: {
    fontSize: 16,
    color: '#999',
  },
  modalSaveButton: {
    fontSize: 16,
    color: COLORS.accent,
    fontWeight: 'bold',
  },
  disabledButton: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
});
