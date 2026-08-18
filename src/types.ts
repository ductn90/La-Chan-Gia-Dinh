export type RiskLevel = 'Cao' | 'Trung bình' | 'Thấp';

export interface ScamAnalysisResult {
  id: string;
  timestamp: number;
  risk_level: RiskLevel;
  explanation: string;
  red_flags: string[];
  recommended_action: string;
  scam_type?: string;
  emergency_advice?: string;
  source_type: 'image' | 'text' | 'voice';
  familyCode?: string;
}

export interface FamilyRoom {
  code: string;
  createdAt: number;
  lastActive: number;
  elderlyName?: string;
  notes?: string;
}

export type UserRole = 'elderly' | 'guardian' | null;
