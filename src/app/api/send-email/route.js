// File: app/api/send-email/route.js

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { google } from "googleapis";

// Destructure OAuth2 from googleapis
const { OAuth2 } = google.auth;


const {
  EMAIL_CLIENT_ID,
  EMAIL_CLIENT_SECRET,
  EMAIL_REFRESH_TOKEN,
  EMAIL_REDIRECT_URI,
  EMAIL_USER,
} = process.env;

export async function POST(request) {
  try {
    // Parse the JSON body of the request
    const { email, bcc } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: "Recipient email is required." },
        { status: 400 }
      );
    }

    // Initialize OAuth2 Client
    const oauth2Client = new OAuth2(
      EMAIL_CLIENT_ID,
      EMAIL_CLIENT_SECRET,
      EMAIL_REDIRECT_URI
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: EMAIL_REFRESH_TOKEN,
    });

    // Get access token
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error("Failed to obtain access token.");
    }

    // Create Nodemailer transporter using OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: EMAIL_CLIENT_ID,
        clientSecret: EMAIL_CLIENT_SECRET,
        refreshToken: EMAIL_REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false, // Use with caution. Consider setting to true in production.
      },
    });


    // Set up email data with BCC
    const mailOptions = {
      from: `"Invitation" <${EMAIL_USER}>`, // Sender address
      to: email, // Primary recipient
      bcc: bcc, // BCC recipients
      subject: "Invite",
      text: "Invite Sent",
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully to:", email);


    return NextResponse.json({ message: "Success: email was sent." });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "COULD NOT SEND MESSAGE", error: error.message },
      { status: 500 }
    );
  }
}
