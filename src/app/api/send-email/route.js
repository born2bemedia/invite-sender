import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    const { sender, email, bcc } = await request.json();

    if (!sender) {
      return NextResponse.json(
        { message: "Sender email is required." },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { message: "Recipient email is required." },
        { status: 400 }
      );
    }

    const msg = {
      to: email, 
      from: sender, 
      subject: "Invite",
      html: "<p>Invite Sent</p>",
    };

    if (bcc && Array.isArray(bcc) && bcc.length > 0) {
      msg.bcc = bcc;
    }

    await sgMail.send(msg);

    console.log("Email sent successfully from:", sender, "to:", email);
    return NextResponse.json({ message: "Success: email was sent." });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "COULD NOT SEND MESSAGE", error: error.message },
      { status: 500 }
    );
  }
}
