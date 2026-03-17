import { supabase } from './supabase';
import { Profile, ProfileFormData } from '../types';

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return (data as Profile) || null;
  },

  async upsertProfile(userId: string, profileData: ProfileFormData): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        name: profileData.name,
        age: profileData.age,
        gender: profileData.gender,
        medical_history: profileData.medical_history,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  },
};
