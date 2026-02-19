import * as SecureStore from 'expo-secure-store';

const OPENAI_KEY_STORAGE_KEY = 'openai_api_key';

export async function saveOpenAIKey(key: string) {
  const trimmed = key.trim();
  if (!trimmed) return;
  await SecureStore.setItemAsync(OPENAI_KEY_STORAGE_KEY, trimmed);
}

export async function getOpenAIKey() {
  const key = await SecureStore.getItemAsync(OPENAI_KEY_STORAGE_KEY);
  return key?.trim() || null;
}

export async function clearOpenAIKey() {
  await SecureStore.deleteItemAsync(OPENAI_KEY_STORAGE_KEY);
}

export async function hasOpenAIKey() {
  const key = await getOpenAIKey();
  return Boolean(key);
}

