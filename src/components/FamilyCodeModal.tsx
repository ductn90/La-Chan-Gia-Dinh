import React, { useState } from 'react';
import { X, Copy, Check, Share2, Users, RefreshCw, Lock, ShieldCheck } from 'lucide-react';
import { generateFamilyCode, setLocalFamilyCode } from '../services/storage';

interface FamilyCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  onUpdateCode: (newCode: string) => void;
}

export const FamilyCodeModal: React.FC<FamilyCodeModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  onUpdateCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorNotice(msg);
      setSuccessNotice(null);
      setTimeout(() => setErrorNotice(null), 3000);
    } else {
      setSuccessNotice(msg);
      setErrorNotice(null);
      setTimeout(() => setSuccessNotice(null), 2500);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    showToast('Đã sao chép mã kết nối!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `Bố/Mẹ đang dùng ứng dụng Lá Chắn Gia Đình để kiểm tra tin nhắn lừa đảo. Mã kết nối gia đình là: ${currentCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mã kết nối Lá Chắn Gia Đình',
          text,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const handleRegenerateCode = () => {
    setIsRegenerating(true);
    const newCode = generateFamilyCode();
    setLocalFamilyCode(newCode);
    onUpdateCode(newCode);
    showToast(`Đã đổi sang mã mới: ${newCode}`);
    setTimeout(() => setIsRegenerating(false), 500);
  };

  const handleSaveInputCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.replace(/\D/g, '').trim();
    if (clean.length < 4) {
      showToast('Vui lòng nhập mã từ 4 đến 6 chữ số hợp lệ.', true);
      return;
    }
    setLocalFamilyCode(clean);
    onUpdateCode(clean);
    setIsEditing(false);
    setInputCode('');
    showToast(`Đã liên kết mã gia đình: ${clean}`);
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
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">Mã Liên Kết Gia Đình</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">Kết nối bảo vệ giữa Bác và Con Cháu</p>
            </div>
          </div>
          <button
            id="btn-close-family-modal"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 space-y-4 sm:space-y-6 w-full max-w-full">
          {/* Notification Banners */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {errorNotice && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
              <X className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Big Code Card */}
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 text-center space-y-3 w-full">
            <span className="text-xs font-black text-blue-800 uppercase tracking-wider block">
              Mã kết nối hiện tại của Bác
            </span>

            <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-blue-800 bg-white py-3 px-4 sm:px-6 rounded-xl border border-blue-200 shadow-inner select-all w-full max-w-xs mx-auto transition-all">
              {currentCode || '123456'}
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
              Con cháu chỉ cần nhập mã này ở chế độ <strong>"Tôi là người theo dõi"</strong> để xem lịch sử quét.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1 sm:pt-2 w-full">
              <button
                id="btn-copy-family-code"
                type="button"
                onClick={handleCopy}
                className="w-full sm:flex-1 px-4 py-3 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Đã sao chép mã!' : 'Sao chép mã'}</span>
              </button>

              <button
                id="btn-share-family-code"
                type="button"
                onClick={handleShare}
                className="w-full sm:flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Gửi cho con cháu</span>
              </button>
            </div>
          </div>

          {/* Change or Join another code */}
          {!isEditing ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer text-left py-1"
              >
                + Nhập mã gia đình khác
              </button>

              <button
                id="btn-regenerate-family-code"
                type="button"
                onClick={handleRegenerateCode}
                className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-blue-700 active:scale-95 cursor-pointer py-1 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-blue-700' : ''}`} />
                <span>Tạo mã mới ngẫu nhiên</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveInputCode} className="space-y-3 pt-1 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Nhập mã 6 chữ số bạn muốn tham gia:
              </label>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full sm:flex-1 min-w-0 text-center font-mono font-bold text-xl py-2.5 px-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
                  autoFocus
                />
                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 active:scale-95 cursor-pointer shadow-xs"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setInputCode('');
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 active:scale-95 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Privacy badge */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5 font-medium leading-relaxed">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Bảo mật tối đa:</strong> Hệ thống chỉ đồng bộ kết quả đánh giá (Đỏ / Vàng / Xanh) và lời khuyên an toàn. Toàn bộ hình ảnh, số điện thoại hoặc tin nhắn gốc đều <u>KHÔNG</u> lưu trữ.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
