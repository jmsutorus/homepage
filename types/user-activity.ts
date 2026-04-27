export interface LocationState {
  country: string;
  timezone: string;
}

export interface UserActivityState {
  id: string;
  lastLoginAt: Date | string;
  lastActiveAt: Date | string;
  location: LocationState;
  preferredLanguage: string;
  activityStreak?: number;
}

export interface UserActivityUpdatePayload {
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
  isLogin?: boolean;
}
