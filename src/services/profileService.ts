import { api } from './api';
import { Profile, ProfileFormData } from '../types';

export const profileService = {
  async getProfile(_userId: string): Promise<Profile | null> {
    const { data, error } = await api.get<Profile>('/profiles');
    if (error) throw new Error(error);
    return data ?? null;
  },

  async upsertProfile(_userId: string, profileData: ProfileFormData): Promise<void> {
    const { error } = await api.put('/profiles', profileData);
    if (error) throw new Error(error);
  },
};
