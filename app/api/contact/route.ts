import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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
    const { error: dbError } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        company: data.company || null,
        role: data.role || null,
        intent: data.intent,
        message: data.message || null,
        timestamp: data.timestamp,
      });

    if (dbError) {
      console.error('Supabase error:', dbError);
      // Don't fail the request if DB fails - still send emails
    }

    // 2. Send notification email to team (fire and forget - don't block response)
    sendLeadNotification(data).catch(err => {
      console.error('Failed to send lead notification:', err);
    });

    // 3. Send confirmation email to user (fire and forget)
    sendConfirmationEmail(data.email, data.name, data.intent).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Form submitted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

