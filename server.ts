import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Support larger payloads for screenshot base64 images
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// In-memory family scans store (synced across family members)
interface StoredScan {
  id: string;
  timestamp: number;
  risk_level: "Cao" | "Trung bình" | "Thấp";
  explanation: string;
  red_flags: string[];
  recommended_action: string;
  scam_type?: string;
  emergency_advice?: string;
  source_type: "image" | "text" | "voice";
  familyCode: string;
}

const familyScansStore: Record<string, StoredScan[]> = {};

// Initialize Gemini Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Download project zip endpoint
app.get("/api/download-zip", (_req: Request, res: Response) => {
  const filePath = path.join(process.cwd(), "la-chan-gia-dinh.zip");
  res.download(filePath, "la-chan-gia-dinh.zip");
});

// Analyze endpoint
app.post("/api/analyze", async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, image, sourceType, familyCode } = req.body;

    if (!content && !image) {
      res.status(400).json({ error: "Vui lòng cung cấp nội dung văn bản hoặc ảnh chụp màn hình." });
      return;
    }

    const ai = getGenAI();
    const systemInstruction = `Bạn là trợ lý phân tích lừa đảo chuyên biệt cho người cao tuổi Việt Nam mang tên "Lá Chắn Gia Đình".
Nhiệm vụ của bạn là xem xét nội dung tin nhắn, thông báo, cuộc gọi hoặc hình ảnh chụp màn hình và xác định mức độ nguy cơ lừa đảo.

Kiến thức trọng tâm về lừa đảo tại Việt Nam:
1. Giả danh cơ quan công quyền: Công an, Tòa án, Viện kiểm sát đe dọa có liên quan đến đường dây ma túy/rửa tiền, yêu cầu chuyển tiền "chứng minh vô tội" vào tài khoản cá nhân.
2. Giả danh cơ quan Thuế, Dịch vụ công, Bộ Công An: Kêu gọi cài app .apk VNeID giả, cập nhật sinh trắc học ngân hàng, cập nhật định danh mức 2 qua link lạ.
3. Giả danh con cháu, bạn bè: Nhắn tin mượn tiền gấp do cấp cứu, tai nạn, mua vé máy bay, hoặc gửi mã OTP nhờ đăng nhập hộ.
4. Lừa đảo trúng thưởng, tri ân: Nhận quà xe SH, điện thoại iPhone, tiền mặt... nhưng bắt nộp phí vận chuyển/thuế 500k-5tr trước.
5. Bẫy việc làm online & đầu tư: Làm nhiệm vụ giật đơn Shopee, nạp tiền đầu tư sinh lời 30%/ngày.
6. Lừa đảo ngân hàng: Tin nhắn Brandname ngân hàng giả mạo (SMS Spoofing) báo tài khoản bị đăng nhập nơi khác, yêu cầu bấm link để đổi mật khẩu.

NGUYÊN TẮC TRẢ LỜI:
- Sử dụng tiếng Việt ấm áp, kính trọng, đơn giản, dễ hiểu nhất cho các bác lớn tuổi.
- Không dùng từ ngữ chuyên môn phức tạp.
- Đưa ra lời khuyên rõ ràng, dứt khoát nếu có nguy hiểm.

BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU (không kèm markdown \`\`\`json ngoài):
{
  "risk_level": "Cao" hoặc "Trung bình" hoặc "Thấp",
  "explanation": "2-3 câu giải thích ngắn gọn, rõ ràng tại sao nội dung này nguy hiểm hoặc an toàn.",
  "red_flags": ["Dấu hiệu đáng ngờ 1", "Dấu hiệu đáng ngờ 2"],
  "recommended_action": "Hành động cụ thể bác nên làm ngay (Ví dụ: Tuyệt đối không bấm vào đường link, không chuyển tiền, hãy gọi ngay cho con cháu).",
  "scam_type": "Tên loại lừa đảo ngắn gọn (Ví dụ: Giả danh Công an, Lừa cài app VNeID giả, v.v...)",
  "emergency_advice": "Lời dặn dò ngắn gọn để bảo vệ tài sản"
}`;

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    if (image && image.base64) {
      // Clean base64 header if present
      const cleanBase64 = image.base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: image.mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }

    const textPrompt = content
      ? `Hãy phân tích nội dung sau đây:\n\n"""\n${content}\n"""`
      : "Hãy phân tích hình ảnh chụp màn hình này để phát hiện các dấu hiệu lừa đảo nhắm vào người lớn tuổi.";

    parts.push({ text: textPrompt });

    let rawText = "{}";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              risk_level: {
                type: Type.STRING,
                description: "Mức độ rủi ro: 'Cao', 'Trung bình', hoặc 'Thấp'",
              },
              explanation: {
                type: Type.STRING,
                description: "Giải thích ngắn gọn 2-3 câu bằng tiếng Việt ấm áp, dễ hiểu",
              },
              red_flags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Các dấu hiệu lừa đảo đáng ngờ",
              },
              recommended_action: {
                type: Type.STRING,
                description: "Hành động khuyên làm ngay cho người lớn tuổi",
              },
              scam_type: {
                type: Type.STRING,
                description: "Tên loại hình lừa đảo",
              },
              emergency_advice: {
                type: Type.STRING,
                description: "Lời khuyên an toàn dứt khoát",
              },
            },
            required: ["risk_level", "explanation", "red_flags", "recommended_action"],
          },
          temperature: 0.2,
        },
      });
      rawText = response.text || "{}";
    } catch (aiErr: any) {
      console.warn("Primary Gemini call failed, trying gemini-flash-latest fallback:", aiErr?.message);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: { parts },
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });
        rawText = fallbackResponse.text || "{}";
      } catch (fallbackErr: any) {
        console.error("All Gemini API attempts failed, activating smart local rules engine:", fallbackErr?.message);
        
        // Intelligent local rules engine fallback for Vietnamese scam patterns
        const lower = (content || "").toLowerCase();
        let fallbackRisk: "Cao" | "Trung bình" | "Thấp" = "Trung bình";
        let fallbackExplanation = "Hệ thống phát hiện nội dung có một số dấu hiệu bất thường. Bác hãy tạm dừng và hỏi ý kiến con cháu trước khi làm theo.";
        let fallbackFlags = ["Có yếu tố giục giã hoặc yêu cầu thao tác nhạy cảm", "Cần xác minh lại với người thân"];
        let fallbackAction = "Không chuyển tiền, không cung cấp mã OTP hay thông tin cá nhân.";
        let fallbackType = "Nghi vấn lừa đảo mạo danh";
        let fallbackEmergency = "Nếu đối tượng liên tục gọi điện ép buộc, bác hãy dập máy và gọi ngay cho người thân.";

        if (
          lower.includes("công an") ||
          lower.includes("rửa tiền") ||
          lower.includes("viện kiểm sát") ||
          lower.includes("bắt tạm giam") ||
          lower.includes("tài khoản ngân hàng") && lower.includes("chuyển")
        ) {
          fallbackRisk = "Cao";
          fallbackType = "Giả danh Công an / Cơ quan Pháp luật";
          fallbackExplanation = "CẢNH BÁO NGUY HIỂM: Công an và Viện kiểm sát KHÔNG BAO GIỜ làm việc qua điện thoại hay yêu cầu người dân chuyển tiền vào tài khoản để điều tra!";
          fallbackFlags = [
            "Đe dọa bắt tạm giam qua điện thoại/tin nhắn",
            "Yêu cầu chuyển toàn bộ tiền tiết kiệm vào tài khoản lạ",
            "Ép buộc giữ bí mật không cho gia đình biết",
          ];
          fallbackAction = "Dập máy ngay lập tức! Tuyệt đối không chuyển bất kỳ khoản tiền nào và gọi ngay cho con cháu hoặc Cảnh sát 113.";
          fallbackEmergency = "Hãy gọi ngay cho con cháu để được hỗ trợ.";
        } else if (
          lower.includes("vneid") ||
          lower.includes("định danh") ||
          lower.includes(".apk") ||
          lower.includes("cài đặt ứng dụng") ||
          lower.includes("dichvucong") ||
          lower.includes("cập nhật sinh trắc học")
        ) {
          fallbackRisk = "Cao";
          fallbackType = "Bẫy cài đặt mã độc / VNeID giả mạo";
          fallbackExplanation = "CẢNH BÁO NGUY HIỂM: Kẻ gian đang dụ dỗ Bác cài phần mềm giả mạo để chiếm quyền điều khiển điện thoại và rút sạch tiền trong tài khoản ngân hàng!";
          fallbackFlags = [
            "Gửi đường link lạ yêu cầu tải ứng dụng (.apk)",
            "Giả danh cán bộ Công an / Thuế hỗ trợ cập nhật định danh",
            "Yêu cầu cấp quyền trợ năng (Accessibility) trên điện thoại",
          ];
          fallbackAction = "Tuyệt đối không bấm vào link và không cài đặt bất kỳ file lạ nào. Hãy nhờ con cháu kiểm tra trực tiếp.";
          fallbackEmergency = "Nếu đã lỡ bấm vào link hoặc cài đặt, hãy tắt ngay Wifi/4G và mang ra cơ sở uy tín.";
        } else if (
          lower.includes("trúng thưởng") ||
          lower.includes("quà tặng") ||
          lower.includes("xe sh") ||
          lower.includes("iphone") ||
          lower.includes("phí vận chuyển")
        ) {
          fallbackRisk = "Cao";
          fallbackType = "Lừa đảo trúng thưởng / Tri ân khách hàng";
          fallbackExplanation = "CẢNH BÁO: Đây là chiêu trò lừa đảo trúng thưởng quen thuộc. Bác không tham gia dự thưởng nhưng lại báo trúng quà và bắt đóng phí trước!";
          fallbackFlags = [
            "Báo trúng thưởng hiện vật giá trị lớn bất ngờ",
            "Bắt nộp tiền thuế, phí vận chuyển hoặc tiền cọc trước",
            "Thúc ép nhận thưởng trong ngày nếu không sẽ mất lượt",
          ];
          fallbackAction = "Bác hãy bỏ qua tin nhắn này, tuyệt đối không gửi tiền phí cọc hay tiền ship.";
          fallbackEmergency = "Không có cơ quan hay doanh nghiệp nào bắt nộp tiền trước để nhận quà trúng thưởng.";
        } else if (
          lower.includes("bố ơi") ||
          lower.includes("mẹ ơi") ||
          lower.includes("con đang") ||
          lower.includes("mượn tiền") ||
          lower.includes("chuyển nhanh") ||
          lower.includes("cấp cứu")
        ) {
          fallbackRisk = "Cao";
          fallbackType = "Giả danh con cháu nhờ chuyển tiền gấp";
          fallbackExplanation = "CẢNH BÁO: Kẻ gian có thể đã hack tài khoản Facebook/Zalo của con cháu hoặc giả mạo số lạ để nhắn tin nhờ chuyển tiền gấp.";
          fallbackFlags = [
            "Tạo tình huống cấp bách (tai nạn, mất ví, cấp cứu) để Bác hoảng loạn",
            "Yêu cầu chuyển vào số tài khoản mang tên người khác (bạn bè, đối tác)",
            "Né tránh gọi điện video trực tiếp để xác nhận",
          ];
          fallbackAction = "Bác hãy bấm dừng lại, gọi ngay số điện thoại thường ngày của con cháu để hỏi trực tiếp.";
          fallbackEmergency = "Chỉ chuyển tiền khi đã nghe giọng nói hoặc nhìn thấy mặt con cháu qua cuộc gọi video.";
        }

        rawText = JSON.stringify({
          risk_level: fallbackRisk,
          explanation: fallbackExplanation,
          red_flags: fallbackFlags,
          recommended_action: fallbackAction,
          scam_type: fallbackType,
          emergency_advice: fallbackEmergency,
        });
      }
    }
    rawText = rawText.trim();
    // In case model wraps in markdown fence
    if (rawText.startsWith("```json")) {
      rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      parsedResult = {
        risk_level: "Trung bình",
        explanation: "Hệ thống phát hiện nội dung có một số điểm đáng ngờ. Bác hãy cẩn thận và hỏi ý kiến con cháu trước khi làm theo bất kỳ yêu cầu nào.",
        red_flags: ["Cần xác minh danh tính người gửi", "Không cung cấp mã OTP hoặc thông tin cá nhân"],
        recommended_action: "Không làm theo hướng dẫn, liên hệ con cháu ngay để kiểm tra lại.",
        scam_type: "Cần xác minh thêm",
        emergency_advice: "Tuyệt đối không chuyển tiền và không bấm link lạ.",
      };
    }

    // Standardize risk_level
    let level: "Cao" | "Trung bình" | "Thấp" = "Trung bình";
    const rawLevel = String(parsedResult.risk_level || "").toLowerCase();
    if (rawLevel.includes("cao") || rawLevel.includes("high") || rawLevel.includes("nguy hiểm")) {
      level = "Cao";
    } else if (rawLevel.includes("thấp") || rawLevel.includes("low") || rawLevel.includes("an toàn")) {
      level = "Thấp";
    } else {
      level = "Trung bình";
    }

    const scanRecord: StoredScan = {
      id: "scan_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      risk_level: level,
      explanation: parsedResult.explanation || "Nội dung đang được kiểm tra cẩn thận.",
      red_flags: Array.isArray(parsedResult.red_flags) ? parsedResult.red_flags : [],
      recommended_action: parsedResult.recommended_action || "Hãy hỏi ý kiến người thân trước khi thao tác.",
      scam_type: parsedResult.scam_type || "Nghi vấn lừa đảo trực tuyến",
      emergency_advice: parsedResult.emergency_advice || "Không chuyển tiền cho bất kỳ ai chưa rõ danh tính.",
      source_type: sourceType || (image ? "image" : "text"),
      familyCode: familyCode || "",
    };

    // If familyCode provided, record to family store (Without saving raw text or sensitive user images!)
    if (familyCode && familyCode.trim()) {
      const code = familyCode.trim();
      if (!familyScansStore[code]) {
        familyScansStore[code] = [];
      }
      familyScansStore[code].unshift(scanRecord);
      // Keep up to 50 latest scans per family room
      if (familyScansStore[code].length > 50) {
        familyScansStore[code] = familyScansStore[code].slice(0, 50);
      }
    }

    res.json(scanRecord);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "Không thể phân tích nội dung lúc này. Bác hãy thử lại sau ít giây hoặc kiểm tra kết nối mạng.",
      details: error.message,
    });
  }
});

// Family API endpoints (Spark/Zero-cost compatible)
app.get("/api/family/:code/history", (req: Request, res: Response) => {
  const code = req.params.code;
  const history = familyScansStore[code] || [];
  res.json({ code, count: history.length, history });
});

app.post("/api/family/save", (req: Request, res: Response) => {
  const { familyCode, scan } = req.body;
  if (!familyCode || !scan) {
    res.status(400).json({ error: "Thiếu mã gia đình hoặc dữ liệu quét." });
    return;
  }
  const code = familyCode.trim();
  if (!familyScansStore[code]) {
    familyScansStore[code] = [];
  }
  // Avoid duplicates
  if (!familyScansStore[code].some((s) => s.id === scan.id)) {
    familyScansStore[code].unshift(scan);
  }
  res.json({ success: true, count: familyScansStore[code].length });
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lá Chắn Gia Đình server running on port ${PORT}`);
  });
}

startServer();
