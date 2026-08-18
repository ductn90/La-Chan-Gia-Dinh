import { ScamAnalysisResult, FamilyRoom } from '../types';

const STORAGE_KEY_HISTORY = 'la_chan_history_v1';
const STORAGE_KEY_FAMILY_CODE = 'la_chan_family_code';
const STORAGE_KEY_USER_ROLE = 'la_chan_user_role';
const STORAGE_KEY_EMERGENCY_PHONE = 'la_chan_emergency_phone';
const STORAGE_KEY_FONT_SIZE = 'la_chan_font_size';

// Generate a memorable 6-digit code
export function generateFamilyCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export function getLocalFamilyCode(): string {
  let code = localStorage.getItem(STORAGE_KEY_FAMILY_CODE);
  if (!code) {
    code = generateFamilyCode();
    localStorage.setItem(STORAGE_KEY_FAMILY_CODE, code);
  }
  return code;
}

export function setLocalFamilyCode(code: string): void {
  localStorage.setItem(STORAGE_KEY_FAMILY_CODE, code.trim());
}

export function getLocalRole(): 'elderly' | 'guardian' | null {
  return (localStorage.getItem(STORAGE_KEY_USER_ROLE) as 'elderly' | 'guardian') || null;
}

export function setLocalRole(role: 'elderly' | 'guardian'): void {
  localStorage.setItem(STORAGE_KEY_USER_ROLE, role);
}

export function getEmergencyPhone(): string {
  return localStorage.getItem(STORAGE_KEY_EMERGENCY_PHONE) || '113';
}

export function setEmergencyPhone(phone: string): void {
  localStorage.setItem(STORAGE_KEY_EMERGENCY_PHONE, phone.trim());
}

export function getFontSizePreference(): 'normal' | 'large' | 'huge' {
  return (localStorage.getItem(STORAGE_KEY_FONT_SIZE) as 'normal' | 'large' | 'huge') || 'large';
}

export function setFontSizePreference(size: 'normal' | 'large' | 'huge'): void {
  localStorage.setItem(STORAGE_KEY_FONT_SIZE, size);
}

// Get locally saved scan history (strictly privacy preserved - NO raw texts or images)
export function getLocalHistory(): ScamAnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Save scan result to local storage and sync with server-side Family store
export async function saveScanResult(scan: ScamAnalysisResult, familyCode?: string): Promise<void> {
  try {
    // 1. Save to local storage
    const current = getLocalHistory();
    const updated = [scan, ...current.filter((item) => item.id !== scan.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));

    // 2. Sync to Server Family Room if code exists
    const code = familyCode || getLocalFamilyCode();
    if (code) {
      fetch('/api/family/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyCode: code,
          scan: {
            ...scan,
            familyCode: code,
          },
        }),
      }).catch((err) => console.warn('Could not sync with family server:', err));
    }
  } catch (err) {
    console.error('Error saving scan result:', err);
  }
}

// Fetch family history from server
export async function fetchFamilyHistory(code: string): Promise<ScamAnalysisResult[]> {
  try {
    const res = await fetch(`/api/family/${encodeURIComponent(code.trim())}/history`);
    if (!res.ok) throw new Error('Không thể tải lịch sử gia đình');
    const data = await res.json();
    return data.history || [];
  } catch (err) {
    console.warn('Fallback to local history on error:', err);
    return getLocalHistory();
  }
}
