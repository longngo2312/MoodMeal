import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { profileService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import { Profile, ProfileFormData } from '../types';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await profileService.getProfile(user.id);
      setProfile(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveProfile = useCallback(async (profileData: ProfileFormData): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      await profileService.upsertProfile(user.id, profileData);
      await loadProfile();
      return true;
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, refresh: loadProfile, saveProfile };
};
