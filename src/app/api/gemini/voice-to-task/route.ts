import { NextResponse } from 'next/server';
import { getGeminiClient, Type } from '../../../../libs/server/gemini';

export async function POST(request: Request) {
  const ai = getGeminiClient();
  if (!ai) {
    return NextResponse.json({ status: 'error', error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
  }

  const { promptText, usersContext, workspacesContext } = await request.json();
  if (!promptText || typeof promptText !== 'string') {
    return NextResponse.json({ status: 'error', error: 'Prompt text is required.' }, { status: 400 });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Chuyển câu lệnh giao việc thành JSON task: ${promptText}\nUsers:${JSON.stringify(usersContext || [])}\nWorkspaces:${JSON.stringify(workspacesContext || [])}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'description', 'priority', 'workspaceId', 'assignedId', 'tag', 'deadline'],
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING },
            workspaceId: { type: Type.STRING },
            assignedId: { type: Type.STRING },
            tag: { type: Type.STRING },
            deadline: { type: Type.STRING },
          },
        },
      },
    });
    return NextResponse.json({ status: 'success', task: JSON.parse(response.text) });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message || 'Error processing speech command' }, { status: 500 });
  }
}
