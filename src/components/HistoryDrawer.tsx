import React from 'react';
import { X, History, Trash2, Calendar, AlertOctagon, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScamAnalysisResult } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScamAnalysisResult[];
  onSelectScan: (scan: ScamAnalysisResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectScan,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md h-[100dvh] max-h-screen flex flex-col shadow-2xl border-l border-slate-200 overscroll-contain">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Lịch Sử Đã Kiểm Tra</h3>
              <p className="text-xs text-slate-500 font-medium">Bấm vào để xem lại chi tiết</p>
            </div>
          </div>
          <button
            id="btn-close-history-drawer"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16 px-4">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-black text-slate-700">Bác chưa kiểm tra tin nào gần đây.</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Kết quả kiểm tra sẽ lưu tại đây để xem lại bất cứ lúc nào.</p>
            </div>
          ) : (
            history.map((scan) => {
              const isHigh = scan.risk_level === 'Cao';
              const isMed = scan.risk_level === 'Trung bình';

              return (
                <div
                  key={scan.id}
                  onClick={() => {
                    onSelectScan(scan);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${
                    isHigh
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                      : isMed
                      ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                      : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-600 text-white'
                          : isMed
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {scan.risk_level}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTime(scan.timestamp)}</span>
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-relaxed">
                    {scan.explanation}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <button
              id="btn-clear-local-history"
              type="button"
              onClick={onClearHistory}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa lịch sử trên máy</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
