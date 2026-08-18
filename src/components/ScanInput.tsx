import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Search,
  AlertTriangle,
  Sparkles,
  Camera,
  RotateCcw,
  Check,
} from 'lucide-react';
import { startVietnameseSpeechRecognition, isSpeechRecognitionSupported } from '../services/speech';

interface ScanInputProps {
  onAnalyze: (payload: {
    type: 'text' | 'image';
    content: string;
    image?: { mimeType: string; base64: string };
    sourceType: 'image' | 'text' | 'voice';
  }) => void;
  isLoading: boolean;
}

const SAMPLE_SCAMS = [
  {
    title: 'Giả Công An đe dọa',
    text: 'CỤC CẢNH SÁT ĐIỀU TRA: Bác có lệnh bắt tạm giam vì liên quan đến đường dây rửa tiền 50 tỷ. Yêu cầu chuyển toàn bộ tiền tiết kiệm vào số tài khoản 0987654321 ngân hàng Vietinbank để cơ quan giám định trong 2 giờ.',
  },
  {
    title: 'Bẫy trúng thưởng xe SH',
    text: 'Chúc mừng số điện thoại của Quý khách đã may mắn trúng giải Đặc biệt 01 xe máy SH 150i trị giá 95 triệu đồng. Quý khách vui lòng đóng phí vận chuyển và hồ sơ thuế 1.200.000đ vào tài khoản để nhận xe trong ngày.',
  },
  {
    title: 'Lừa link VNeID giả',
    text: 'BỘ CÔNG AN THÔNG BÁO: Tài khoản định danh điện tử VNeID mức 2 của bạn bị lỗi dữ liệu. Vui lòng truy cập ngay https://dichvucong-vneid-capnhat.com để tải ứng dụng khắc phục, quá hạn sẽ bị khóa tài khoản.',
  },
  {
    title: 'Nhờ chuyển tiền gấp',
    text: 'Bố ơi con đang đi khám bệnh gấp bị mất ví, bố chuyển nhanh cho con 5 triệu vào số tài khoản bạn con tên NGUYEN VAN A này nhé, tí con về con gửi lại ngay.',
  },
];

export const ScanInput: React.FC<ScanInputProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    previewUrl: string;
    base64: string;
    mimeType: string;
  } | null>(null);

  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionController = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionController.current) {
        recognitionController.current.stop();
      }
    };
  }, []);

  const handleToggleMic = () => {
    if (isRecording) {
      if (recognitionController.current) {
        recognitionController.current.stop();
      }
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    setIsRecording(true);

    const controller = startVietnameseSpeechRecognition(
      (transcript, isFinal) => {
        setTextContent((prev) => {
          if (!prev) return transcript;
          return prev + ' ' + transcript;
        });
        if (isFinal) {
          setIsRecording(false);
        }
      },
      (error) => {
        setSpeechError(error);
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    recognitionController.current = controller;
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Bác vui lòng chọn đúng tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage({
        file,
        previewUrl,
        base64,
        mimeType: file.type,
      });
      setActiveTab('image');
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.previewUrl);
      setSelectedImage(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (activeTab === 'image') {
      if (!selectedImage) {
        alert('Bác vui lòng chọn hoặc chụp một bức ảnh tin nhắn trước nhé.');
        return;
      }
      onAnalyze({
        type: 'image',
        content: textContent,
        image: {
          mimeType: selectedImage.mimeType,
          base64: selectedImage.base64,
        },
        sourceType: 'image',
      });
    } else {
      if (!textContent.trim()) {
        alert('Bác vui lòng nhập hoặc nói nội dung tin nhắn/cuộc gọi để kiểm tra nhé.');
        return;
      }
      onAnalyze({
        type: 'text',
        content: textContent.trim(),
        sourceType: isRecording ? 'voice' : 'text',
      });
    }
  };

  const hasInput = activeTab === 'image' ? !!selectedImage : textContent.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* 2-Way Sleek Header */}
      <div className="bg-blue-700 text-white rounded-3xl p-6 sm:p-7 shadow-md mb-6 text-center border border-blue-800">
        <div className="inline-flex items-center gap-2 bg-blue-800/90 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase mb-3 border border-blue-400/50">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Kiểm tra an toàn trong 2 cách đơn giản</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
          Bác nhận được tin nhắn hoặc cuộc gọi lạ?
        </h2>
        <p className="text-base sm:text-lg text-blue-100 font-medium max-w-xl mx-auto opacity-95">
          Hãy dán chữ hoặc gửi ảnh vào đây, Trợ lý AI sẽ đọc và kiểm tra giúp Bác ngay!
        </p>
      </div>

      {/* Main Choice Card with Sleek Design */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-6">
        {/* Choice Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            id="tab-choice-text"
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-3 sm:py-4 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2.5 font-black text-sm sm:text-lg md:text-xl transition-all cursor-pointer text-center min-h-[48px] ${
              activeTab === 'text'
                ? 'bg-blue-600 text-white shadow-md scale-[1.01]'
                : 'text-slate-700 hover:bg-slate-200/80 font-bold'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
            <span className="leading-tight">Dán tin nhắn / Nói</span>
          </button>

          <button
            id="tab-choice-image"
            type="button"
            onClick={() => setActiveTab('image')}
            className={`py-3 sm:py-4 px-2 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2.5 font-black text-sm sm:text-lg md:text-xl transition-all cursor-pointer text-center min-h-[48px] ${
              activeTab === 'image'
                ? 'bg-blue-600 text-white shadow-md scale-[1.01]'
                : 'text-slate-700 hover:bg-slate-200/80 font-bold'
            }`}
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
            <span className="leading-tight">Tải ảnh màn hình</span>
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {activeTab === 'text' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label
                  htmlFor="input-scam-text"
                  className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2"
                >
                  <span>Kiểm tra nội dung nghi ngờ:</span>
                </label>

                {textContent && (
                  <button
                    type="button"
                    onClick={() => setTextContent('')}
                    className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Xóa nhập lại</span>
                  </button>
                )}
              </div>

              {/* Text Area in Sleek Interface style */}
              <div className="space-y-3 sm:space-y-4">
                <textarea
                  id="input-scam-text"
                  rows={4}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Dán tin nhắn hoặc mô tả cuộc gọi tại đây... (Ví dụ: 'Chuc mung ban! Ban da trung thuong xe SH...')"
                  className="w-full p-4 sm:p-5 md:p-6 text-lg sm:text-xl bg-slate-50 border-2 border-slate-200 rounded-2xl resize-none focus:border-blue-500 focus:bg-white focus:outline-none text-slate-800 placeholder:text-slate-400 placeholder:italic transition-all leading-relaxed"
                />

                {/* Sleek Action Buttons Row (Camera & Voice Record) */}
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                  <button
                    id="btn-switch-to-upload"
                    type="button"
                    onClick={() => {
                      setActiveTab('image');
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 bg-white border-2 sm:border-4 border-blue-600 text-blue-600 text-base sm:text-lg md:text-xl font-black py-3.5 sm:py-4 md:py-5 rounded-2xl flex items-center justify-center gap-2 sm:gap-3 active:scale-95 hover:bg-blue-50 transition-all cursor-pointer shadow-xs min-h-[48px]"
                  >
                    <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>Tải ảnh màn hình</span>
                  </button>

                  <button
                    id="btn-voice-record"
                    type="button"
                    onClick={handleToggleMic}
                    className={`w-full sm:w-36 py-3.5 sm:py-4 md:py-5 px-4 border-2 sm:border-4 rounded-2xl flex items-center justify-center gap-2 font-black text-base sm:text-lg md:text-xl active:scale-95 transition-all shadow-xs cursor-pointer min-h-[48px] ${
                      isRecording
                        ? 'bg-rose-500 text-white border-rose-600 animate-mic-active'
                        : 'bg-blue-50 text-blue-600 border-blue-600 hover:bg-blue-100'
                    }`}
                    title={isRecording ? 'Nhấn để dừng ghi âm' : 'Nhấn để nói bằng giọng nói'}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Dừng ghi âm</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Nói bằng mic</span>
                      </>
                    )}
                  </button>
                </div>

                {isRecording && (
                  <p className="text-center text-sm sm:text-base font-bold text-rose-600 animate-pulse bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    🎙️ Đang lắng nghe Bác nói... Bác cứ nói tự nhiên, xong nhấn lại Micro nhé!
                  </p>
                )}

                {speechError && (
                  <p className="text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    {speechError}
                  </p>
                )}
              </div>

              {/* Sample scam cases for testing */}
              <div className="pt-3">
                <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-500 mb-2">
                  Hoặc Bác có thể bấm thử các mẫu tin nhắn lừa đảo phổ biến:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_SCAMS.map((sample, idx) => (
                    <button
                      key={idx}
                      id={`btn-sample-scam-${idx}`}
                      type="button"
                      onClick={() => setTextContent(sample.text)}
                      className="text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-sm font-bold text-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{sample.title}</span>
                      <span className="text-xs text-blue-600 font-extrabold uppercase shrink-0">Thử mẫu</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Screenshot Upload Tab */
            <div className="space-y-4">
              <label className="block text-xl sm:text-2xl font-bold text-slate-800">
                Tải lên ảnh chụp màn hình tin nhắn hoặc Zalo/Facebook:
              </label>

              {!selectedImage ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-3 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 rounded-3xl p-8 text-center transition-all"
                >
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <UploadCloud className="w-10 h-10" />
                  </div>

                  <h3 className="text-xl font-black text-slate-800 mb-2">
                    Bác hãy chọn ảnh chụp màn hình
                  </h3>
                  <p className="text-base text-slate-600 mb-6 max-w-md mx-auto">
                    Kéo thả ảnh vào đây, hoặc nhấn nút bên dưới để chọn ảnh từ máy / chụp ảnh mới
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      id="btn-upload-file"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-6 h-6" />
                      <span>Chọn ảnh từ máy</span>
                    </button>

                    <button
                      id="btn-camera-capture"
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full sm:w-auto px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-lg hover:bg-slate-900 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-6 h-6" />
                      <span>Chụp ảnh màn hình</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              ) : (
                /* Image Preview */
                <div className="bg-slate-50 rounded-3xl p-5 border-2 border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      <span>Đã chọn ảnh thành công:</span>
                    </span>
                    <button
                      id="btn-remove-selected-image"
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl font-bold text-sm flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Đổi ảnh khác</span>
                    </button>
                  </div>

                  <div className="max-h-80 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center p-2">
                    <img
                      src={selectedImage.previewUrl}
                      alt="Ảnh chụp màn hình nghi ngờ"
                      className="max-h-76 w-auto object-contain mx-auto rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Big Sleek Action Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-scan"
              type="submit"
              disabled={isLoading || !hasInput}
              className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-xl sm:text-2xl uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-md ${
                !hasInput
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] shadow-blue-200 cursor-pointer'
              }`}
            >
              <Search className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
              <span>{isLoading ? 'Đang phân tích, xin chờ...' : 'BẮT ĐẦU PHÂN TÍCH'}</span>
            </button>
            <p className="text-center text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Chỉ mất khoảng 3 đến 5 giây để AI phân tích toàn bộ dấu hiệu lừa đảo.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
