import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { tasks = [] } = await request.json();
  return NextResponse.json({
    status: 'success',
    todayStr: new Date().toISOString().slice(0, 10),
    scanned: Array.isArray(tasks) ? tasks.length : 0,
    candidates: 0,
    processed: 0,
    remaining: 0,
    sent: [],
    failed: [],
  });
}
