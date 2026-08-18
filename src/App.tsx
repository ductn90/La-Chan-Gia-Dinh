import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoleSelector } from './components/RoleSelector';
import { ScanInput } from './components/ScanInput';
import { ResultCard } from './components/ResultCard';
import { GuardianDashboard } from './components/GuardianDashboard';
import { FamilyCodeModal } from './components/FamilyCodeModal';
import { EmergencyModal } from './components/EmergencyModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LoadingOverlay } from './components/LoadingOverlay';
import { UserRole, ScamAnalysisResult } from './types';
import {
  getLocalRole,
  setLocalRole,
  getLocalFamilyCode,
  setLocalFamilyCode,
  getLocalHistory,
  saveScanResult,
  getFontSizePreference,
  setFontSizePreference,
} from './services/storage';
import { History, Shield, Users, PhoneCall, Sparkles } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [familyCode, setFamilyCode] = useState<string>('');
  const [currentScan, setCurrentScan] = useState<ScamAnalysisResult | null>(null);
  const [history, setHistory] = useState<ScamAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Font size
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');

  // Modals
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // Initialize
  useEffect(() => {
    const savedRole = getLocalRole();
    const savedCode = getLocalFamilyCode();
    const savedHistory = getLocalHistory();
    const savedFontSize = getFontSizePreference();

    setRole(savedRole);
    setFamilyCode(savedCode);
    setHistory(savedHistory);
    setFontSize(savedFontSize);
  }, []);

  // Dynamically update root html font-size to scale all rem units application-wide
  useEffect(() => {
    if (fontSize === 'huge') {
      document.documentElement.style.fontSize = '23.5px';
    } else if (fontSize === 'large') {
      document.documentElement.style.fontSize = '19.5px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [fontSize]);

  const handleSelectRole = (newRole: 'elderly' | 'guardian', inputCode?: string) => {
    setLocalRole(newRole);
    setRole(newRole);
    if (inputCode) {
      setLocalFamilyCode(inputCode);
      setFamilyCode(inputCode);
    }
  };

  const handleSwitchRole = () => {
    const nextRole: 'elderly' | 'guardian' = role === 'guardian' ? 'elderly' : 'guardian';
    setLocalRole(nextRole);
    setRole(nextRole);
  };

  const handleUpdateFamilyCode = (newCode: string) => {
    setFamilyCode(newCode);
    setLocalFamilyCode(newCode);
  };

  const handleChangeFontSize = (size: 'normal' | 'large' | 'huge') => {
    setFontSize(size);
    setFontSizePreference(size);
  };

  // Perform Gemini AI Scam Analysis
  const handleAnalyze = async (payload: {
    type: 'text' | 'image';
    content: string;
    image?: { mimeType: string; base64: string };
    sourceType: 'image' | 'text' | 'voice';
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          familyCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Có lỗi khi phân tích nội dung. Bác hãy thử lại sau ít giây nhé.');
      }

      const scanResult: ScamAnalysisResult = await response.json();
      setCurrentScan(scanResult);

      // Save to local storage & family server
      await saveScanResult(scanResult, familyCode);
      setHistory(getLocalHistory());
    } catch (err: any) {
      console.error('Scan failed:', err);
      setErrorMessage(err.message || 'Không thể kết nối với máy chủ AI. Bác vui lòng kiểm tra mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Bác có chắc chắn muốn xóa toàn bộ lịch sử đã lưu trên máy không?')) {
      localStorage.removeItem('la_chan_history_v1');
      setHistory([]);
      setIsHistoryDrawerOpen(false);
    }
  };

  // Dynamic font sizing wrapper class
  const fontClass =
    fontSize === 'huge' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col justify-between ${fontClass}`}>
      {/* Top App Header */}
      <Header
        currentRole={role}
        familyCode={familyCode}
        onOpenFamilyModal={() => setIsFamilyModalOpen(true)}
        onSelectRole={handleSelectRole}
        onEmergencyCall={() => setIsEmergencyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto mt-4 px-4">
            <div className="bg-red-100 border-2 border-red-400 text-red-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
              <span className="font-bold">{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-700 font-bold hover:underline ml-3 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* 1. Initial Role Selection View if role is not chosen */}
        {role === null ? (
          <RoleSelector
            onSelectRole={handleSelectRole}
            defaultCode={familyCode}
          />
        ) : role === 'guardian' ? (
          /* 2. Guardian / Child Dashboard View */
          <GuardianDashboard
            familyCode={familyCode}
            onChangeCode={() => setIsFamilyModalOpen(true)}
            onBackToElderlyMode={() => handleSelectRole('elderly')}
            onEmergencyCall={() => setIsEmergencyModalOpen(true)}
          />
        ) : currentScan ? (
          /* 3. Result Screen (After scan submission) */
          <ResultCard
            result={currentScan}
            onReset={() => setCurrentScan(null)}
            onEmergencyCall={() => setIsEmergencyModalOpen(true)}
            familyCode={familyCode}
          />
        ) : (
          /* 4. Main Elderly Scan Input View */
          <ScanInput
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Sticky Bottom Utility Bar for Elderly Users */}
      {role === 'elderly' && (
        <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-3 sm:px-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <button
              id="btn-open-history-drawer"
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300 min-h-[44px]"
            >
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0" />
              <span>Lịch sử đã quét ({history.length})</span>
            </button>

            <button
              id="btn-bottom-family-code"
              type="button"
              onClick={() => setIsFamilyModalOpen(true)}
              className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-800 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer border border-blue-200 min-h-[44px]"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-700 shrink-0" />
              <span>Mã gia đình</span>
            </button>
          </div>
        </div>
      )}

      {/* Universal Sleek Minimal Footer with Bottom Font Controls */}
      <footer className="py-3 sm:py-4 px-4 bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              Chế độ:{' '}
              <strong className="text-slate-700">
                {role === 'guardian' ? 'Con cháu (Người theo dõi)' : 'Ông Bà/ Bố Mẹ (Kiểm tra tin nhắn)'}
              </strong>
            </span>
          </div>

          {/* Universal Font Size Selector in Footer */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-slate-600 font-bold">Cỡ chữ:</span>
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm shadow-inner">
              <button
                id="btn-footer-font-normal"
                type="button"
                onClick={() => handleChangeFontSize('normal')}
                className={`min-w-[34px] min-h-[30px] px-2.5 py-1 rounded-lg transition-all font-black cursor-pointer flex items-center justify-center ${
                  fontSize === 'normal'
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.03]'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title="Cỡ chữ vừa (16px)"
              >
                A
              </button>
              <button
                id="btn-footer-font-large"
                type="button"
                onClick={() => handleChangeFontSize('large')}
                className={`min-w-[34px] min-h-[30px] px-2.5 py-1 rounded-lg transition-all font-black cursor-pointer flex items-center justify-center ${
                  fontSize === 'large'
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.03]'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title="Cỡ chữ to (19.5px)"
              >
                A+
              </button>
              <button
                id="btn-footer-font-huge"
                type="button"
                onClick={() => handleChangeFontSize('huge')}
                className={`min-w-[34px] min-h-[30px] px-2.5 py-1 rounded-lg transition-all font-black cursor-pointer flex items-center justify-center ${
                  fontSize === 'huge'
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.03]'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
                title="Cỡ chữ siêu to (23.5px)"
              >
                A++
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <FamilyCodeModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        currentCode={familyCode}
        onUpdateCode={handleUpdateFamilyCode}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onSelectScan={(scan) => setCurrentScan(scan)}
        onClearHistory={handleClearHistory}
      />

      {/* Fullscreen Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} />
    </div>
  );
}
