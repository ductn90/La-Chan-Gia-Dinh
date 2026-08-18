import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-slate-200 shadow-2xl space-y-5">
        {/* Animated Shield Spinner */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin"></div>
          <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-lg animate-soft-pulse">
            <Shield className="w-9 h-9 stroke-[2.5]" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Đang Phân Tích</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Đang phân tích, xin chờ...
          </h3>
          <p className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed">
            Hệ thống đang quét các thủ đoạn lừa đảo và kiểm tra an toàn cho Bác. Chỉ mất vài giây thôi ạ.
          </p>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className="bg-blue-700 h-full w-2/3 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
