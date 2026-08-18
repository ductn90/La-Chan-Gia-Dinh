import React, { useState } from 'react';
import { ShieldCheck, Eye, ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: 'elderly' | 'guardian', inputCode?: string) => void;
  defaultCode: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, defaultCode }) => {
  const [guardianCode, setGuardianCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeError, setCodeError] = useState('');

  const handleGuardianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = guardianCode.trim();
    if (!clean || clean.length < 4) {
      setCodeError('Vui lòng nhập mã 6 số do bố mẹ hoặc người thân cung cấp');
      return;
    }
    setCodeError('');
    onSelectRole('guardian', clean);
  };

  return (
    <div className="max-w-3xl mx-auto my-6 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        {/* Welcome badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-800 text-sm font-black uppercase tracking-wider mb-4 border border-blue-200">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Chào mừng đến với Lá Chắn Gia Đình</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
          Xin chào! Bác hoặc Anh/Chị muốn sử dụng ứng dụng với vai trò nào?
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-xl mx-auto font-medium">
          Ứng dụng hoàn toàn miễn phí, không thu thập mật khẩu hay thông tin nhạy cảm của gia đình.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left mb-6">
          {/* Elderly / Primary user card */}
          <div
            id="role-card-elderly"
            onClick={() => onSelectRole('elderly')}
            className="group relative bg-slate-50 rounded-2xl p-6 border-2 border-blue-300 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md text-xs font-black uppercase tracking-wider mb-2">
                Dành cho Bác / Bố Mẹ
              </span>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Tôi là người kiểm tra tin nhắn
              </h3>
              <p className="text-base text-slate-600 leading-relaxed mb-4 font-medium">
                Chụp ảnh màn hình hoặc đọc tin nhắn nghi ngờ để AI phân tích và cảnh báo lừa đảo ngay lập tức.
              </p>
            </div>
            <button
              type="button"
              className="w-full mt-2 py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 group-hover:bg-blue-700 shadow-sm transition-all"
            >
              <span>Vào kiểm tra ngay</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Guardian / Child card */}
          <div
            id="role-card-guardian"
            className="group relative bg-slate-50 rounded-2xl p-6 border-2 border-slate-300 hover:border-slate-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform">
                <Eye className="w-8 h-8 stroke-[2.5]" />
              </div>
              <span className="inline-block px-2.5 py-1 bg-slate-200 text-slate-800 rounded-md text-xs font-black uppercase tracking-wider mb-2">
                Dành cho Con Cháu
              </span>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Tôi là người theo dõi
              </h3>
              <p className="text-base text-slate-600 leading-relaxed mb-4 font-medium">
                Nhập mã gia đình để theo dõi từ xa lịch sử các tin nhắn bố mẹ đã quét và nhận cảnh báo rủi ro cao.
              </p>
            </div>

            {!showCodeInput ? (
              <button
                id="btn-show-code-input"
                type="button"
                onClick={() => setShowCodeInput(true)}
                className="w-full mt-2 py-3.5 px-4 bg-slate-800 text-white rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-slate-900 shadow-sm cursor-pointer transition-all"
              >
                <span>Nhập mã liên kết gia đình</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <form onSubmit={handleGuardianSubmit} className="mt-2 space-y-3">
                <div>
                  <label htmlFor="input-guardian-code" className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Nhập mã 6 chữ số:
                  </label>
                  <input
                    id="input-guardian-code"
                    type="text"
                    maxLength={6}
                    placeholder="Ví dụ: 123456"
                    value={guardianCode}
                    onChange={(e) => setGuardianCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-widest text-2xl font-mono font-bold py-2.5 px-3 border-2 border-slate-400 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
                    autoFocus
                  />
                  {codeError && <p className="text-sm font-bold text-rose-600 mt-1">{codeError}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    id="btn-submit-guardian-code"
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors cursor-pointer"
                  >
                    Xác nhận kết nối
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(false)}
                    className="px-3 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200 font-medium">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Cam kết bảo mật 100%: Tuyệt đối không lưu lại hình ảnh hay tin nhắn gốc của người dùng.</span>
        </div>
      </div>
    </div>
  );
};
