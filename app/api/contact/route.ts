import { NextResponse } from "next/server";

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

    // TODO: Send email notification
    // For now, just log the data (replace with email service later)
    console.log("Contact form submission:", {
      name: data.name,
      email: data.email,
      company: data.company || "Not provided",
      role: data.role || "Not provided",
      intent: data.intent,
      message: data.message || "No message",
      timestamp: data.timestamp,
    });

    // TODO: Store in database (optional)
    // await db.contacts.create({ data });

    // TODO: Send confirmation email to user
    // await sendConfirmationEmail(data.email, data.name);

    // TODO: Send notification email to team
    // await sendTeamNotification(data);

    return NextResponse.json(
      { 
        success: true,
        message: "Form submitted successfully" 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

