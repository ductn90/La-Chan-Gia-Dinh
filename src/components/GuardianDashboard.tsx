import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  Calendar,
  Users,
  Search,
  Filter,
  ArrowLeft,
  Lock,
  Volume2,
} from 'lucide-react';
import { ScamAnalysisResult } from '../types';
import { fetchFamilyHistory } from '../services/storage';
import { speakVietnamese } from '../services/speech';

interface GuardianDashboardProps {
  familyCode: string;
  onChangeCode: () => void;
  onBackToElderlyMode: () => void;
  onEmergencyCall: () => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({
  familyCode,
  onChangeCode,
  onBackToElderlyMode,
  onEmergencyCall,
}) => {
  const [history, setHistory] = useState<ScamAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Cao' | 'Trung bình' | 'Thấp'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const loadHistory = async () => {
    if (!familyCode) return;
    setIsLoading(true);
    try {
      const data = await fetchFamilyHistory(familyCode);
      setHistory(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching family history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto poll every 10 seconds for real-time family updates
  useEffect(() => {
    loadHistory();
    const interval = setInterval(() => {
      loadHistory();
    }, 10000);
    return () => clearInterval(interval);
  }, [familyCode]);

  const highRiskCount = history.filter((s) => s.risk_level === 'Cao').length;
  const mediumRiskCount = history.filter((s) => s.risk_level === 'Trung bình').length;
  const lowRiskCount = history.filter((s) => s.risk_level === 'Thấp').length;

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.risk_level === filter;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Guardian Header in Sleek Theme */}
      <div className="bg-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-800 text-blue-100 border border-blue-400/60 rounded-full text-xs font-black uppercase tracking-wider">
                Chế độ Con Cháu / Người Theo Dõi
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Giám Sát An Toàn Cho Bố Mẹ
            </h2>
            <p className="text-blue-100 text-sm sm:text-base mt-1 font-medium">
              Phòng kết nối: <span className="font-mono font-bold text-amber-300 text-lg bg-blue-800/80 px-2.5 py-0.5 rounded-lg border border-blue-400/40">{familyCode}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-guardian-refresh"
              type="button"
              onClick={loadHistory}
              disabled={isLoading}
              className="px-4 py-2.5 bg-blue-800 hover:bg-blue-900 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-blue-400/60 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>

            <button
              id="btn-guardian-change-code"
              type="button"
              onClick={onChangeCode}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>Đổi mã gia đình</span>
            </button>

            <button
              id="btn-guardian-switch-to-elderly"
              type="button"
              onClick={onBackToElderlyMode}
              className="px-4 py-2.5 bg-blue-800/80 hover:bg-blue-900 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border border-blue-400/50 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Màn hình Ông Bà/ Bố Mẹ quét</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Badge */}
        <div className="mt-4 pt-4 border-t border-blue-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-100 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
            <span>Tự động cập nhật thời gian thực (Lần quét gần nhất: {lastRefreshed.toLocaleTimeString('vi-VN')})</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Chỉ lưu tóm tắt cảnh báo, không lưu nội dung nhạy cảm</span>
          </div>
        </div>
      </div>

      {/* Alert Banner if any High Risk detected */}
      {highRiskCount > 0 && (
        <div className="bg-rose-50 border-4 border-rose-500 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-rose-700">CẢNH BÁO: Phát hiện {highRiskCount} tin nhắn rủi ro CAO!</h3>
              <p className="text-slate-700 text-sm font-bold mt-0.5">
                Bố mẹ vừa quét tin nhắn có dấu hiệu lừa đảo nguy hiểm. Bạn hãy gọi điện kiểm tra ngay nhé!
              </p>
            </div>
          </div>
          <button
            id="btn-guardian-emergency-call"
            type="button"
            onClick={onEmergencyCall}
            className="w-full sm:w-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer transition-all"
          >
            <PhoneCall className="w-5 h-5" />
            <span>Gọi ngay cho bố mẹ</span>
          </button>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Tổng số lượt quét</span>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 font-mono">{history.length}</p>
        </div>

        <div className="bg-rose-50 p-5 rounded-2xl border-2 border-rose-300 shadow-xs">
          <span className="text-xs font-black text-rose-700 uppercase tracking-wider">Nguy cơ Cao (Đỏ)</span>
          <p className="text-3xl sm:text-4xl font-black text-rose-600 mt-1 font-mono">{highRiskCount}</p>
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300 shadow-xs">
          <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Cần chú ý (Vàng)</span>
          <p className="text-3xl sm:text-4xl font-black text-amber-600 mt-1 font-mono">{mediumRiskCount}</p>
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-300 shadow-xs">
          <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">Tạm an toàn (Xanh)</span>
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 mt-1 font-mono">{lowRiskCount}</p>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Lịch sử kiểm tra gần đây</span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {filteredHistory.length} kết quả
            </span>
          </h3>

          {/* Filter tabs with horizontal scroll support on small screens */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold overflow-x-auto max-w-full pb-1 sm:pb-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'all' ? 'bg-white text-blue-900 font-black shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('Cao')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'Cao' ? 'bg-rose-600 text-white font-black shadow-xs' : 'text-rose-700 hover:bg-rose-100'
              }`}
            >
              Nguy cơ Cao ({highRiskCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('Trung bình')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'Trung bình' ? 'bg-amber-500 text-white font-black shadow-xs' : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              Trung bình ({mediumRiskCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('Thấp')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'Thấp' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              An toàn ({lowRiskCount})
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-200">
            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <h4 className="text-lg font-bold text-slate-700 mb-1">Chưa có dữ liệu quét nào trong phòng này</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Khi bố mẹ sử dụng mã <strong className="font-mono text-slate-800">{familyCode}</strong> để kiểm tra tin nhắn, kết quả sẽ lập tức hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((scan) => {
              const isHigh = scan.risk_level === 'Cao';
              const isMed = scan.risk_level === 'Trung bình';

              return (
                <div
                  key={scan.id}
                  className={`p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                    isHigh
                      ? 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
                      : isMed
                      ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                      : 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          isHigh
                            ? 'bg-rose-600 text-white'
                            : isMed
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        Rủi ro: {scan.risk_level}
                      </span>
                      {scan.scam_type && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-white border border-slate-200 text-slate-800">
                          {scan.scam_type}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-semibold">
                        (Quét từ {scan.source_type === 'image' ? 'Ảnh' : scan.source_type === 'voice' ? 'Giọng nói' : 'Văn bản'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatTime(scan.timestamp)}</span>
                    </div>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-900 mb-3 leading-relaxed">
                    {scan.explanation}
                  </p>

                  {/* Red flags */}
                  {scan.red_flags && scan.red_flags.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                        Dấu hiệu phát hiện:
                      </span>
                      <ul className="list-disc list-inside text-sm font-semibold text-slate-700 pl-1 space-y-0.5">
                        {scan.red_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended action */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-800 flex items-center justify-between gap-3 shadow-2xs">
                    <span>👉 Lời khuyên: {scan.recommended_action}</span>
                    <button
                      type="button"
                      onClick={() => speakVietnamese(`${scan.explanation}. ${scan.recommended_action}`)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg shrink-0 cursor-pointer"
                      title="Nghe đọc"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
