import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, subject, teacher, time } = body;

    // Simulate Zoom API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, this would call Zoom's Server-to-Server OAuth API
    // const zoomResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', { ... })

    // Simulate Zoom API response
    const meetingId = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const joinUrl = `https://zoom.us/j/${meetingId}?pwd=${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      success: true,
      data: {
        id: `ZM_${meetingId}`,
        title,
        subject,
        teacher,
        time,
        classStatus: 'SCHEDULED',
        joinUrl,
        meetingId,
        studentsPresent: 0,
        totalStudents: 30
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
