import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../../libs/server/gemini';

export async function POST(request: Request) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  const { tasks, teacherName } = await request.json();
  if (!tasks || !Array.isArray(tasks)) {
    return NextResponse.json({ status: 'error', error: 'No tasks provided.' }, { status: 400 });
  }

  try {
    const prompt = `Tóm tắt ngắn gọn các việc còn tồn của ${teacherName || 'giáo viên'} và gợi ý ưu tiên ngày mai:\n${JSON.stringify(tasks)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: prompt });
    return NextResponse.json({ status: 'success', summary: response.text });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error communicating with Gemini' }, { status: 500 });
  }
}
