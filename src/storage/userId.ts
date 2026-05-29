import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const KEY = '@react-chat-ui/userId/v1';

/**
 * Returns a stable user ID that persists across app restarts and conversations.
 * Generated once on first launch, then reused forever.
 */
export async function getUserId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored) return stored;
    const fresh = uuid.v4() as string;
    await AsyncStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Fallback: non-persistent ID for this session
    return uuid.v4() as string;
  }
}
