import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  PhoneCall,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Check,
  UserCheck,
} from 'lucide-react';
import { ScamAnalysisResult } from '../types';
import { speakVietnamese, stopSpeaking, isSpeechSynthesisSupported } from '../services/speech';

interface ResultCardProps {
  result: ScamAnalysisResult;
  onReset: () => void;
  onEmergencyCall: () => void;
  familyCode: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onReset,
  onEmergencyCall,
  familyCode,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto clean audio on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const speechText = `Kết quả phân tích mức độ rủi ro: ${result.risk_level}. ${result.explanation}. Lời khuyên dành cho bác: ${result.recommended_action}. ${result.emergency_advice || ''}`;

    setIsPlayingAudio(true);
    speakVietnamese(
      speechText,
      0.88, // Gentle pace for seniors
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      (err) => {
        console.error('Speech error:', err);
        setIsPlayingAudio(false);
      }
    );
  };

  const handleShareResult = async () => {
    const textToShare = `[Lá Chắn Gia Đình] Kết quả kiểm tra tin nhắn:\n- Mức độ: ${result.risk_level}\n- Giải thích: ${result.explanation}\n- Khuyên làm: ${result.recommended_action}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kết quả kiểm tra lừa đảo',
          text: textToShare,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Determine styles by risk level
  const isHighRisk = result.risk_level === 'Cao';
  const isMediumRisk = result.risk_level === 'Trung bình';
  const isLowRisk = result.risk_level === 'Thấp';

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-6">
      {/* 1. Main Risk Card in Sleek Interface Design */}
      <div
        className={`w-full rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden border-4 transition-all ${
          isHighRisk
            ? 'bg-rose-50 border-rose-500'
            : isMediumRisk
            ? 'bg-amber-50 border-amber-500'
            : 'bg-emerald-50 border-emerald-500'
        }`}
      >
        {/* Top Accent Bar */}
        <div
          className={`absolute top-0 left-0 w-full h-2.5 ${
            isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />

        {/* Circular Highlight Badge */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-4 shadow-lg text-white shrink-0 ${
            isHighRisk
              ? 'bg-rose-500 shadow-rose-200 animate-soft-pulse'
              : isMediumRisk
              ? 'bg-amber-500 shadow-amber-200'
              : 'bg-emerald-500 shadow-emerald-200'
          }`}
        >
          {isHighRisk && <AlertOctagon className="w-12 h-12 stroke-[2.5]" />}
          {isMediumRisk && <AlertTriangle className="w-12 h-12 stroke-[2.5]" />}
          {isLowRisk && <CheckCircle className="w-12 h-12 stroke-[2.5]" />}
        </div>

        {/* Risk Level Title */}
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-black uppercase tracking-widest mb-2 ${
            isHighRisk
              ? 'bg-rose-200 text-rose-900'
              : isMediumRisk
              ? 'bg-amber-200 text-amber-900'
              : 'bg-emerald-200 text-emerald-900'
          }`}
        >
          {result.scam_type || 'ĐÁNH GIÁ AN TOÀN'}
        </span>

        <h3
          className={`text-3xl sm:text-4xl font-black mb-3 tracking-tight ${
            isHighRisk ? 'text-rose-600' : isMediumRisk ? 'text-amber-600' : 'text-emerald-600'
          }`}
        >
          {isHighRisk ? 'RỦI RO CAO' : isMediumRisk ? 'RỦI RO TRUNG BÌNH' : 'AN TOÀN / RỦI RO THẤP'}
        </h3>

        {/* Explanation Text */}
        <p className="text-slate-800 text-lg sm:text-xl font-semibold leading-relaxed mb-6 max-w-xl">
          {result.explanation}
        </p>

        {/* Red Flags / Suspicious signs box */}
        {result.red_flags && result.red_flags.length > 0 && (
          <div
            className={`w-full rounded-2xl p-5 text-left border-2 mb-6 shadow-xs ${
              isHighRisk
                ? 'bg-white border-rose-200'
                : isMediumRisk
                ? 'bg-white border-amber-200'
                : 'bg-white border-emerald-200'
            }`}
          >
            <span
              className={`font-black uppercase text-xs sm:text-sm tracking-wider flex items-center gap-1.5 ${
                isHighRisk ? 'text-rose-600' : isMediumRisk ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Dấu hiệu nghi vấn:</span>
            </span>
            <ul className="text-slate-700 mt-2.5 space-y-2 text-base sm:text-lg font-bold">
              {result.red_flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className={isHighRisk ? 'text-rose-500' : 'text-amber-500'}>•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Action Alert Box */}
        <div className="w-full space-y-3">
          <div
            className={`p-4 sm:p-5 rounded-2xl text-lg sm:text-xl font-black shadow-md uppercase tracking-wider text-white ${
              isHighRisk ? 'bg-rose-600' : isMediumRisk ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          >
            👉 {result.recommended_action}
          </div>

          {/* Sleek Voice Audio Playback */}
          {isSpeechSynthesisSupported() && (
            <button
              id="btn-speak-result"
              type="button"
              onClick={handleToggleAudio}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-base sm:text-lg font-bold transition-all border-2 active:scale-98 cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-100 text-rose-800 border-rose-400 animate-pulse'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-5 h-5 text-rose-600" />
                  <span>Dừng nghe giọng nói</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span>Nghe giải thích</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Sleek Action Row */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Emergency Call */}
          <button
            id="btn-result-call-family"
            type="button"
            onClick={onEmergencyCall}
            className="py-4 px-5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-md shadow-rose-200 cursor-pointer transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Gọi ngay cho người thân</span>
          </button>

          {/* Share with Family */}
          <button
            id="btn-share-result"
            type="button"
            onClick={handleShareResult}
            className="py-4 px-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-md shadow-blue-200 cursor-pointer transition-all"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>Đã sao chép kết quả!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span>Gửi kết quả cho con cháu</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Another */}
        <button
          id="btn-check-another-scam"
          type="button"
          onClick={onReset}
          className="w-full py-4 px-5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-slate-300 transition-all cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Kiểm tra tin nhắn / cuộc gọi khác</span>
        </button>

        <p className="text-center text-xs font-semibold text-slate-400 pt-1">
          Mã liên kết gia đình: <span className="font-mono text-slate-700 font-bold">{familyCode}</span>
        </p>
      </div>
    </div>
  );
};
