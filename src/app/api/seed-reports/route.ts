import { NextResponse } from 'next/server';
import { db, schema } from '@/src/libs/server/db';

export async function GET() {
  try {
    const grades = ['K6', 'K7', 'K10', 'K11'];
    const now = new Date();
    
    // Create 15 enrolled leads
    const insertedLeads = [];
    for (let i = 0; i < 15; i++) {
      const id = `lead_enrolled_${Date.now()}_${i}`;
      const grade = grades[Math.floor(Math.random() * grades.length)];
      await db.insert(schema.leads).values({
        id,
        leadCode: `L-ENR-${Math.floor(Math.random() * 10000)}`,
        fullName: `Học sinh nhập học ${i + 1}`,
        phone: `0988${Math.floor(Math.random() * 1000000)}`,
        grade,
        status: 'enrolled',
        source: 'website',
        createdAt: now,
        updatedAt: now,
      });
      insertedLeads.push(id);
    }

    // Create some paid payments
    const types = ['seat_reservation', 'tuition', 'admission_fee'];
    for (let i = 0; i < 20; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = type === 'tuition' ? 45000000 : type === 'seat_reservation' ? 10000000 : 2000000;
      await db.insert(schema.payments).values({
        id: `pay_${Date.now()}_${i}`,
        leadId: insertedLeads[Math.floor(Math.random() * insertedLeads.length)],
        type: type as any,
        amount,
        status: 'paid',
        transferContent: 'Thanh toan phi',
        paidAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'Seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
