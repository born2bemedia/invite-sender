import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Встановлюємо API-ключ SendGrid з змінної середовища
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    // Розпарсити тіло запиту
    const { sender, email, bcc } = await request.json();

    // Валідація вхідних даних
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

    // Створення об'єкта повідомлення для SendGrid
    const msg = {
      to: email, // Основний отримувач
      from: sender, // Адреса відправника (ця адреса має бути верифікована у SendGrid)
      subject: "Invite",
      html: "<p>Invite Sent</p>",
    };

    // Якщо передано BCC, додаємо їх (переконайтеся, що це масив)
    if (bcc && Array.isArray(bcc) && bcc.length > 0) {
      msg.bcc = bcc;
    }

    // Відправка листа через SendGrid
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
