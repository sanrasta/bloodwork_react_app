export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatar?: string;
  preferences: UserPreferences;
  medicalInfo: MedicalInfo;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
  units: 'metric' | 'imperial';
}

export interface MedicalInfo {
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isEditing: boolean;
}
