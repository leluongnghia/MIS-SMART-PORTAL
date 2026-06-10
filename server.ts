import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with named parameter
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!apiKey });
});

// 1. Summarize Reports API
app.post('/api/gemini/summarize-report', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { reports } = req.body;
  if (!reports || !Array.isArray(reports) || reports.length === 0) {
    return res.status(400).json({ status: 'error', error: 'No reports provided for summarization.' });
  }

  try {
    const prompt = `Bạn là một trợ lý AI phân tích hiệu suất học đường cao cấp tại Trường Đa Trí Tuệ MIS Hà Nội.
Hãy đọc báo cáo/minh chứng thực hiện nhiệm vụ dưới đây của các cán bộ, giáo viên và viết một bản tóm tắt điều hành chuyên nghiệp (Executive Summary) cho Ban Giám hiệu.

Bản tóm tắt cần bằng tiếng Việt, có bố cục cực kỳ mạch lạc và trình bày dạng các thẻ/bullet points tinh giản:
1. ĐÁNH GIÁ TỔNG QUAN (1 câu tóm tắt xu hướng nổi bật của tiến độ hành chính & học vụ).
2. THÀNH TỰU ĐÁNH GIÁ CAO (Các điểm sáng hoàn thành tốt, đúng hạn hoặc chất lượng vượt trội kèm tên người thực hiện).
3. ĐIỂM NGHẼN & TỒN ĐỌNG (Các rủi ro chậm trễ, minh chứng chưa đầy đủ hoặc vướng mắc cần giải quyết).
4. ĐỀ XUẤT CHỈ ĐẠO TIẾP THEO (Tối đa 3 hành động cụ thể, mang tính thực hóa cho Ban Giám hiệu quyết định phê duyệt).

Thông tin báo cáo chi tiết:
${reports
  .map(
    (rep: any, idx) => `
Báo cáo #${idx + 1}:
- Nhiệm vụ: ${rep.title}
- Người thực hiện: ${rep.assignedName} (${rep.assignedRole})
- Phòng ban/Tổ: ${rep.workspaceName}
- Minh chứng thực tế đã nộp: ${rep.evidence}
- Độ ưu tiên: ${rep.priority}
`
  )
  .join('\n')}

Hãy trả về kết quả bằng định dạng văn bản Markdown chuẩn, ngắn gọn nhưng đầy đủ chiều sâu thông tin, văn phong trang trọng, khách quan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ status: 'success', summary: response.text });
  } catch (error: any) {
    console.error('Gemini error in summarize-report:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error communicating with Gemini' });
  }
});

// 2. Early Warning & Task Congestion API
app.post('/api/gemini/early-warning', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ status: 'error', error: 'No tasks provided for bottleneck scanning.' });
  }

  try {
    const prompt = `Bạn là chuyên gia quản trị KPI & OKR học đường tại Trường Đa Trí Tuệ MIS.
Hãy phân tích danh sách các việc chưa hoàn thành sau, phát hiện các điểm nghẽn học vụ (bottlenecks) và đưa ra các cảnh báo sớm kèm giải pháp xử lý.

Cảnh báo cần tóm gọn bằng tiếng Việt, ngắn gọn phù hợp với bảng tin trật tự vận hành (Dashboard warning widget):
- Cảnh báo nhân sự bị quá tải (Ai có nhiều việc CAO đang đọng?).
- Cảnh báo sát hạn chót hoặc đã quá hạn học vụ.
- Đề xuất phân phối lại tài nguyên hoặc giãn hạn cụ thể cho từng bộ phận.

Danh sách việc cần quét:
${tasks
  .map(
    (t: any, idx) => `
Nhiệm vụ #${idx + 1}:
- Tên việc: ${t.title}
- Người phụ trách: ${t.assignedName}
- Phòng ban/Tổ: ${t.workspaceId}
- Tiến trình hiện tại: ${t.status}
- Độ ưu tiên: ${t.priority}
- Hạn chót: ${t.deadline}
`
  )
  .join('\n')}

Hãy trả về kết quả phân tích ngắn gọn, súc tích bằng Markdown (dùng đậm nhạt và các dấu cảnh báo ⚠️, 🚨 một cách tinh tế).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ status: 'success', warning: response.text });
  } catch (error: any) {
    console.error('Gemini error in early-warning:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error communicating with Gemini' });
  }
});

// 3. Voice to Task API (Natural Language to Task Fields Converter)
app.post('/api/gemini/voice-to-task', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { promptText, usersContext, workspacesContext } = req.body;
  if (!promptText || typeof promptText !== 'string') {
    return res.status(400).json({ status: 'error', error: 'Prompt text is required.' });
  }

  try {
    const systemInstruction = `Bạn là Trợ lý phân tích văn bản học thuật thông minh của Hệ thống Đa Trí Tuệ MIS.
Hãy chuyển đoạn văn bản (hoặc lời phiên âm giọng nói) của người dùng thành cấu trúc một công việc hoàn chỉnh theo quy tắc:
- Title: Tiêu đề công việc cô đọng, viết hoa chữ đầu.
- Description: Mô tả chi tiết yêu cầu công việc được gợi ý từ nội dung.
- Priority: Nhận diện 'CAO', 'TRUNG_BINH', hoặc 'THAP' (mặc định 'TRUNG_BINH').
- Tag: Gán phân loại thẻ phù hợp ('Chuyên môn', 'Báo cáo', 'Hội họp', 'Hoạt động', 'Đại hội', 'Đột xuất').
- Deadline: Nhận diện ngày cụ thể (định dạng YYYY-MM-DD). Nếu người dùng nói "trước thứ sáu tuần sau" hoặc "ngày 15 tháng 6", hãy đổi sang ngày dạng YYYY-MM-DD dựa trên năm nay là 2026. Mặc định là '2026-06-15' nếu không nhận diện được.
- WorkspaceId: Dựa trên thông tin workspaces được cung cấp, tìm ID của tổ/phòng ban phù hợp nhất (ví dụ: "Ngữ Văn" -> 'VAN', "Toán Tin" -> 'TOAN_TIN', "Hành chính" -> 'HANH_CHINH', "BGH" -> 'BGH').
- AssignedId: Tên nhân sự được nói tới (ví dụ: "cô Nhàn", "thầy Nam", "cô Liên") hãy ánh xạ chính xác sang ID của người dùng trong dữ liệu nhân sự được cung cấp (ví dụ: "Cô Lê Thị Thanh Nhàn" -> 'user_nhan', "Thầy Trần Hoàng Nam" -> 'user_nam'). Nếu không nhắc ai, hãy chọn ID của tổ trưởng hoặc người phù hợp, hoặc mặc định người đầu tiên trong tổ.

Thông tin nhân sự hợp lệ (Users):
${JSON.stringify(usersContext || [])}

Thông tin tổ/phòng ban hợp lệ (Workspaces):
${JSON.stringify(workspacesContext || [])}

Bạn bắt buộc phải tuân thủ schema JSON đầu ra.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Phân tích câu lệnh giao việc này và gán thuộc tính phù hợp: "${promptText}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'description', 'priority', 'workspaceId', 'assignedId', 'tag', 'deadline'],
          properties: {
            title: {
              type: Type.STRING,
              description: 'Tiêu đề ngắn gọn của công việc học vụ',
            },
            description: {
              type: Type.STRING,
              description: 'Nội dung hướng dẫn chi tiết và yêu cầu tiến trình thực tế',
            },
            priority: {
              type: Type.STRING,
              description: 'Độ ưu tiên cao nhất phù hợp: CAO, TRUNG_BINH, THAP',
            },
            workspaceId: {
              type: Type.STRING,
              description: 'Mã phòng ban tổ chuyên môn phù hợp nhất',
            },
            assignedId: {
              type: Type.STRING,
              description: 'ID người thừa hành nhiệm vụ được phân công',
            },
            tag: {
              type: Type.STRING,
              description: 'Tag phân loại: Chuyên môn, Báo cáo, Hội họp, Hoạt động, Đại hội, Đột xuất',
            },
            deadline: {
              type: Type.STRING,
              description: 'Ngày hạn chót định dạng YYYY-MM-DD',
            },
          },
        },
      },
    });

    const taskResult = JSON.parse(response.text);
    res.json({ status: 'success', task: taskResult });
  } catch (error: any) {
    console.error('Gemini error in voice-to-task:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error processing speech command' });
  }
});

// 4. Summarize Daily Tasks for Teacher API
app.post('/api/gemini/summarize-daily-tasks', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { tasks, teacherName } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ status: 'error', error: 'No tasks provided.' });
  }

  try {
    const prompt = `Bạn là trợ lý AI thông minh điều hành của Trường Đa Trí Tuệ MIS.
Hãy tóm tắt ngắn gọn các công việc chưa hoàn thành của giáo viên ${teacherName || 'này'} vào cuối ngày hôm nay để giúp lên kế hoạch và ưu tiên cho ngày mai.

Danh sách các công việc còn tồn đọng:
${tasks
  .map(
    (t: any, idx) => `
- Việc #${idx + 1}: ${t.title} (Trạng thái: ${t.status}, Hạn chót: ${t.deadline}, Độ ưu tiên: ${t.priority})`
  )
  .join('\n')}

Yêu cầu tóm tắt bằng tiếng Việt thân thiện, khích lệ, chia làm 2 phần nhỏ (tối đa 4-5 dòng):
1. Ưu tiên cao hoặc sát hạn nộp cần xử lý gấp.
2. Gợi ý lịch làm việc tóm tắt hoặc lời động viên cho ngày mai.

Không dùng định dạng quá phức tạp, chỉ cần xuống dòng gọn gàng, có chứa emoji (ví dụ: 🎯, ⏰, ✨).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ status: 'success', summary: response.text });
  } catch (error: any) {
    console.error('Gemini error in summarize-daily-tasks:', error);
    res.status(500).json({ status: 'error', error: error.message || 'Error communicating with Gemini' });
  }
});

// Vite server / Static build setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
