import React, { useState } from 'react';
import { X, PhoneCall, ShieldAlert, User, Check, Edit2 } from 'lucide-react';
import { getEmergencyPhone, setEmergencyPhone } from '../services/storage';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [customPhone, setCustomPhone] = useState(getEmergencyPhone());
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [savedPhone, setSavedPhone] = useState(getEmergencyPhone());

  if (!isOpen) return null;

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customPhone.replace(/[^\d+]/g, '').trim();
    if (clean) {
      setEmergencyPhone(clean);
      setSavedPhone(clean);
      setIsEditingPhone(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overscroll-contain animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-2rem)] flex flex-col border border-slate-200 shadow-2xl my-auto overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 shrink-0">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Đường Dây Nóng Khẩn Cấp</h3>
              <p className="text-xs sm:text-sm font-bold text-rose-600">Hỗ trợ khi có nguy cơ bị lừa đảo tài sản</p>
            </div>
          </div>
          <button
            id="btn-close-emergency-modal"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-5 sm:space-y-6">
          {/* Primary Contact: Child / Relative */}
          <div className="bg-slate-50 border-2 border-blue-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-700" />
                <span className="font-black text-slate-900 text-sm sm:text-base">Số điện thoại Con Cháu / Người Thân:</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPhone(!isEditingPhone)}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingPhone ? 'Đóng' : 'Đổi số'}</span>
              </button>
            </div>

            {!isEditingPhone ? (
              <a
                id="btn-call-relative-tel"
                href={`tel:${savedPhone}`}
                className="w-full py-4 px-6 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded-xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-md shadow-blue-200 transition-all cursor-pointer text-center"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Gọi Người Thân ({savedPhone})</span>
              </a>
            ) : (
              <form onSubmit={handleSavePhone} className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Nhập số điện thoại con cháu"
                  className="w-full sm:flex-1 min-w-0 px-3 py-2.5 border-2 border-blue-300 rounded-xl font-bold text-base bg-white focus:outline-none focus:border-blue-600"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-95 cursor-pointer shadow-xs"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPhone(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 active:scale-95 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Official Authorities Hotlines */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Tổng đài cơ quan chức năng Việt Nam (Miễn phí):
            </span>

            {/* Hotline A05 */}
            <a
              id="btn-call-hotline-a05"
              href="tel:0692343640"
              className="w-full p-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border-2 border-rose-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
                <div className="text-left">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">Cục An Ninh Mạng (A05 - Bộ Công An)</h4>
                  <p className="text-xs font-medium text-slate-600">Tiếp nhận báo cáo lừa đảo công nghệ cao</p>
                </div>
              </div>
              <span className="font-mono font-black text-base sm:text-lg text-rose-700 bg-white px-3 py-1 rounded-xl border border-rose-200 shadow-2xs">
                069.234.3640
              </span>
            </a>

            {/* Hotline 113 */}
            <a
              id="btn-call-hotline-113"
              href="tel:113"
              className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <PhoneCall className="w-6 h-6 text-slate-700" />
                <div className="text-left">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">Cảnh Sát 113</h4>
                  <p className="text-xs font-medium text-slate-600">Báo án & hỗ trợ an ninh trật tự</p>
                </div>
              </div>
              <span className="font-mono font-black text-lg sm:text-xl text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-2xs">
                113
              </span>
            </a>
          </div>

          {/* Advice */}
          <p className="text-xs text-center text-slate-500 font-medium leading-relaxed">
            💡 Khi nghi ngờ bị lừa, Bác hãy giữ bình tĩnh, cúp máy hoặc dừng nhắn tin và gọi ngay cho người thân hoặc cơ quan chức năng để kiểm tra.
          </p>
        </div>
      </div>
    </div>
  );
};
