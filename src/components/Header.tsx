import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  PhoneCall,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  familyCode: string;
  onOpenFamilyModal: () => void;
  onSelectRole: (role: 'elderly' | 'guardian') => void;
  onEmergencyCall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  familyCode,
  onOpenFamilyModal,
  onSelectRole,
  onEmergencyCall,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-blue-700 text-white border-b border-blue-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white text-blue-700 flex items-center justify-center shadow-md shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight uppercase text-white truncate">
                  LÁ CHẮN GIA ĐÌNH
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-800 text-blue-100 border border-blue-400 uppercase tracking-wider shrink-0">
                  AI Trợ Lý
                </span>
              </div>
              <p className="hidden sm:block text-xs font-semibold text-blue-100/90 truncate">
                Nhận diện tin nhắn, cuộc gọi & ảnh lừa đảo cho Người Lớn Tuổi
              </p>
            </div>
          </div>

          {/* Desktop Navigation (Visible on lg screens) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Segmented Role Switcher (Style giống bộ chọn cỡ chữ) */}
            <div className="flex items-center bg-blue-800/90 p-1 rounded-xl border border-blue-500/60 text-xs font-bold shadow-inner">
              <button
                id="btn-role-elderly"
                type="button"
                onClick={() => onSelectRole('elderly')}
                className={`min-h-[32px] px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentRole === 'elderly'
                    ? 'bg-white text-blue-900 shadow-xs font-black'
                    : 'text-blue-100 hover:text-white'
                }`}
                title="Chế độ Ông Bà/ Bố Mẹ kiểm tra tin nhắn"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ông Bà/ Bố Mẹ</span>
              </button>

              <button
                id="btn-role-guardian"
                type="button"
                onClick={() => onSelectRole('guardian')}
                className={`min-h-[32px] px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentRole === 'guardian'
                    ? 'bg-white text-blue-900 shadow-xs font-black'
                    : 'text-blue-100 hover:text-white'
                }`}
                title="Chế độ Con cháu theo dõi"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Con cháu</span>
              </button>
            </div>

            {/* Family Code Pill */}
            <button
              id="btn-family-code-header"
              type="button"
              onClick={onOpenFamilyModal}
              className="bg-blue-800 hover:bg-blue-900 active:scale-95 px-3.5 py-1 rounded-xl border border-blue-400 flex flex-col items-center justify-center transition-all shadow-xs cursor-pointer text-left shrink-0 min-h-[38px]"
            >
              <span className="text-[9px] uppercase font-bold tracking-widest text-blue-200">Mã Gia Đình</span>
              <span className="text-sm font-mono font-bold text-white tracking-wider">
                {familyCode || 'Chưa tạo'}
              </span>
            </button>

            {/* Emergency Hotline */}
            <button
              id="btn-emergency-hotline"
              type="button"
              onClick={onEmergencyCall}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl active:scale-95 transition-all text-xs font-black shadow-md cursor-pointer min-h-[38px]"
              title="Gọi người thân hoặc 113 khẩn cấp"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Gọi khẩn cấp</span>
            </button>
          </div>

          {/* Mobile Right Controls: Compact Call + Hamburger Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick Emergency Button on Mobile */}
            <button
              id="btn-mobile-emergency-call"
              type="button"
              onClick={onEmergencyCall}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md cursor-pointer shrink-0"
              title="Gọi khẩn cấp"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Khẩn cấp</span>
            </button>

            {/* Hamburger Toggle Button */}
            <button
              id="btn-hamburger-menu"
              type="button"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu tùy chọn'}
              className="w-10 h-10 rounded-xl bg-blue-800 hover:bg-blue-900 border border-blue-500/70 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              {isMenuOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
            onClick={closeMenu}
          />

          {/* Slide-down Menu Panel */}
          <div className="absolute top-full left-0 w-full bg-blue-800 text-white border-b-4 border-blue-900 shadow-2xl z-50 lg:hidden animate-slide-down max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain pb-8">
            <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
              {/* 1. Segmented Role Selector in Mobile Menu */}
              <div className="bg-blue-900/70 p-3.5 rounded-2xl border border-blue-500/40">
                <span className="text-xs font-black uppercase tracking-wider text-blue-200 block mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-300" />
                  <span>Vai trò sử dụng:</span>
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-blue-950/60 rounded-xl border border-blue-500/40">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole('elderly');
                      closeMenu();
                    }}
                    className={`py-2.5 px-2 rounded-lg text-center font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentRole === 'elderly'
                        ? 'bg-white text-blue-950 shadow-md font-black'
                        : 'text-blue-100 hover:bg-blue-800/80'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ông Bà/ Bố Mẹ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectRole('guardian');
                      closeMenu();
                    }}
                    className={`py-2.5 px-2 rounded-lg text-center font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      currentRole === 'guardian'
                        ? 'bg-white text-blue-950 shadow-md font-black'
                        : 'text-blue-100 hover:bg-blue-800/80'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Con cháu</span>
                  </button>
                </div>
              </div>

              {/* 2. Family Connection Code */}
              <div className="bg-blue-900/70 p-3.5 rounded-2xl border border-blue-500/40 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-200 block">
                    Mã liên kết gia đình:
                  </span>
                  <span className="text-xl font-mono font-black text-amber-300 tracking-wider">
                    {familyCode || 'Chưa thiết lập'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onOpenFamilyModal();
                  }}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold border border-blue-400 shadow-xs cursor-pointer"
                >
                  Đổi / Xem mã
                </button>
              </div>

              {/* 3. Action Menu Buttons */}
              <div className="space-y-2 pt-1">
                {/* Emergency Call Modal */}
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onEmergencyCall();
                  }}
                  className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-2xl text-left font-black text-base flex items-center justify-between shadow-md transition-all cursor-pointer text-white"
                >
                  <div className="flex items-center gap-3">
                    <PhoneCall className="w-5 h-5" />
                    <span>Danh bạ gọi khẩn cấp (113 / Người thân)</span>
                  </div>
                  <span className="text-xs bg-rose-800 px-2.5 py-1 rounded-lg">SOS</span>
                </button>
              </div>

              {/* Privacy Footer */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-blue-200/80 font-medium">
                <Lock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Bảo mật 100% • Không lưu hình ảnh & tin nhắn riêng tư</span>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};


