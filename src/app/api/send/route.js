import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Ensure you have these environment variables set in your environment or .env file
const GMAIL_USER = "dev@born2be.media";
const GMAIL_PASS = "NHVPUBDj3yD89mK>fg";

export async function POST(request) {
  try {
    const requestBody = await request.text();
    const bodyJSON = JSON.parse(requestBody);
    const { email, bcc } = bodyJSON;

    // Validate input
    if (!email) {
      return NextResponse.status(400).json({ message: "Recipient email is required." });
    }

    // Configure nodemailer with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER, // Your Gmail email from environment variables
        pass: GMAIL_PASS, // Your Gmail password or app password from environment variables
      },
      tls: {
        rejectUnauthorized: false, // This bypasses the certificate validation
      },
    });

    // Set up email data with BCC
    const mailOptions = {
      from: '"Invitation" <' + GMAIL_USER + '>', // Sender address from environment variables
      to: email, // Primary recipient
      bcc: bcc || [], // BCC recipients from the request body
      subject: "Invite",
      text: "Invite Sent",
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Success: emails were sent" });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.status(500).json({ message: "COULD NOT SEND MESSAGE", error: error.message });
  }
}
