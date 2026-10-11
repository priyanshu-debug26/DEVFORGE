'use client';

import { UserApiKeys } from './types';

const STORAGE_KEY = 'devforge_user_api_keys';

export function getClientUserKeys(): UserApiKeys {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveClientUserKeys(keys: UserApiKeys): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    window.dispatchEvent(new Event('devforge_keys_updated'));
  } catch (err) {
    console.error("Failed to save keys to localStorage", err);
  }
}

export function clearClientUserKeys(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('devforge_keys_updated'));
  } catch (err) {
    console.error("Failed to clear keys", err);
  }
}

export function countActiveUserKeys(keys: UserApiKeys): number {
  let count = 0;
  if (keys.geminiKey?.trim()) count++;
  if (keys.groqKey?.trim()) count++;
  if (keys.cerebrasKey?.trim()) count++;
  if (keys.githubToken?.trim()) count++;
  return count;
}
