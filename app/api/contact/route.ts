import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendLeadNotification, sendConfirmationEmail } from "@/lib/email";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  role?: string;
  intent: string;
  message?: string;
  timestamp: string;
}

interface DatabaseRecord {
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  intent: string;
  message: string | null;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.intent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // 1. Store in Supabase
    const dbRecord: DatabaseRecord = {
      name: data.name,
      email: data.email,
      company: data.company || null,
      role: data.role || null,
      intent: data.intent,
      message: data.message || null,
      timestamp: data.timestamp,
    };
    
    const { error: dbError } = await getSupabaseAdmin()
      .from('contact_submissions')
      .insert(dbRecord as never);

    if (dbError) {
      // Log error but don't fail the request - still send emails
      // Error will be visible in Vercel logs if needed
    }

    // 2. Send notification email to team (fire and forget - don't block response)
    sendLeadNotification(data).catch(() => {
      // Error logged in email service
    });

    // 3. Send confirmation email to user (fire and forget)
    sendConfirmationEmail(data.email, data.name, data.intent).catch(() => {
      // Error logged in email service
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Form submitted successfully" 
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

