// Web Speech API wrapper (100% Free, zero third-party fees)

// Check if Speech Recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

// Start Speech-to-Text in Vietnamese
export function startVietnameseSpeechRecognition(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    onError('Trình duyệt không hỗ trợ nhận diện giọng nói. Bác vui lòng gõ phím hoặc thử trên trình duyệt Chrome.');
    return null;
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.lang = 'vi-VN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    onResult(transcript, !!finalTranscript);
  };

  recognition.onerror = (event: any) => {
    let message = 'Có lỗi khi nhận diện giọng nói.';
    if (event.error === 'no-speech') {
      message = 'Chưa nghe thấy bác nói gì. Bác vui lòng nhấn nút Micro và nói lại nhé.';
    } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      message = 'Bác vui lòng cho phép ứng dụng sử dụng Micro trên điện thoại/máy tính.';
    }
    onError(message);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (err: any) {
    onError('Không thể mở micro: ' + err.message);
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {}
    },
  };
}

// Text-to-Speech in Vietnamese
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}

export function speakVietnamese(
  text: string,
  rate: number = 0.9,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Trình duyệt không hỗ trợ đọc bằng giọng nói.');
    return;
  }

  stopSpeaking();

  const cleanText = text
    .replace(/[#*`_\[\]]/g, ' ')
    .replace(/http[s]?:\/\/\S+/g, 'đường liên kết lạ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = rate; // Slightly slower for elderly listeners
  utterance.pitch = 1.0;

  // Try to pick a Vietnamese voice if available
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find((v) => v.lang.includes('vi') || v.lang.includes('VI'));
  if (viVoice) {
    utterance.voice = viVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    onError?.(e);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}
