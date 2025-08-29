import { create } from 'zustand';
import type { UserProfile, UserProfileState } from '../types/types';

interface UserProfileStore extends UserProfileState {
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setLoading: (isLoading: boolean) => void;
  setEditing: (isEditing: boolean) => void;
  
  // Computed getters
  getFullName: () => string;
  hasEmergencyContact: () => boolean;
}

export const useUserProfileStore = create<UserProfileStore>((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  isEditing: false,

  // Actions
  setProfile: (profile) => set({ profile }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setEditing: (isEditing) => set({ isEditing }),
  
  // Computed getters
  getFullName: () => {
    const { profile } = get();
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`.trim();
  },
  
  hasEmergencyContact: () => {
    const { profile } = get();
    return Boolean(profile?.medicalInfo.emergencyContact);
  },
}));
