import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../../libs/server/gemini';

export async function POST(request: Request) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  const { tasks } = await request.json();
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ status: 'error', error: 'No tasks provided for bottleneck scanning.' }, { status: 400 });
  }

  try {
    const prompt = `Phân tích cảnh báo sớm, nghẽn việc, quá tải và đề xuất xử lý cho danh sách nhiệm vụ MIS sau:\n${JSON.stringify(tasks)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: prompt });
    return NextResponse.json({ status: 'success', warning: response.text });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error communicating with Gemini' }, { status: 500 });
  }
}
