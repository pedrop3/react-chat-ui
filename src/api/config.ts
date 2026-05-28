import Constants from 'expo-constants';

const extra =
  (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ?? {};

function readBoolEnv(name: string, fallback: boolean): boolean {
  const v = process.env[name];
  if (v == null) return fallback;
  return v === 'true' || v === '1';
}

export const API_BASE_URL: string =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined) ??
  (extra.apiBaseUrl as string | undefined) ??
  'http://localhost:8000';

export const STREAMING_ENABLED: boolean = readBoolEnv(
  'EXPO_PUBLIC_STREAMING_ENABLED',
  (extra.streamingEnabled as boolean | undefined) ?? true,
);


export const ENDPOINTS = {
  chat: '/chat',
  chatStream: '/chat/stream',
  chatResume: '/chat/resume',
  upload: '/upload',
};
