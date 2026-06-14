import { NextResponse } from 'next/server';
import { getGeminiClient } from '../../../../libs/server/gemini';

export async function POST(request: Request) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  const { reports } = await request.json();
  if (!reports || !Array.isArray(reports) || reports.length === 0) {
    return NextResponse.json({ status: 'error', error: 'No reports provided for summarization.' }, { status: 400 });
  }

  try {
    const prompt = `Tóm tắt điều hành bằng tiếng Việt cho Ban Giám hiệu từ các báo cáo sau, gồm: tổng quan, thành tựu, điểm nghẽn, đề xuất chỉ đạo.\n\n${JSON.stringify(reports)}`;
    const response = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: prompt });
    return NextResponse.json({ status: 'success', summary: response.text });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error communicating with Gemini' }, { status: 500 });
  }
}
