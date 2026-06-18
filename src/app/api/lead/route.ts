import { NextResponse } from 'next/server';

const requiredFields = ['name', 'company', 'email', 'message'] as const;

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = {
      name: cleanValue(body.name),
      company: cleanValue(body.company),
      email: cleanValue(body.email),
      countryCode: cleanValue(body.countryCode),
      phone: cleanValue(body.phone),
      message: cleanValue(body.message),
      source: 'renderless-landing',
      submittedAt: new Date().toISOString(),
    };

    const missingField = requiredFields.find((field) => !payload[field]);
    if (missingField) {
      return NextResponse.json({ error: `${missingField} is required.` }, { status: 400 });
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Lead webhook is not configured.' },
        { status: 500 }
      );
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: 'Lead webhook rejected the submission.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid lead submission.' }, { status: 400 });
  }
}
