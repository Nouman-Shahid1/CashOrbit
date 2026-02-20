const axios = require("axios");

const sendEmailWithBrevo = async (options) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_FROM_EMAIL,
          name: process.env.BREVO_FROM_NAME,
        },
        to: [{ email: options.email }],
        subject: options.subject,
        htmlContent:
          options.html ||
          `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">CashOrbit</h2>
          <p>Your verification code is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #007bff;">
            ${options.code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      method: "brevo",
      messageId: response.data.messageId,
    };
  } catch (error) {
    console.error("Brevo Error:", error.response?.data || error.message);
    throw error;
  }
};

const sendEmail = async (options) => {
  // Try Brevo first
  if (
    process.env.BREVO_API_KEY &&
    process.env.BREVO_API_KEY !== "your_brevo_api_key_here"
  ) {
    try {
      console.log("🚀 Attempting to send email via Brevo...");
      const result = await sendEmailWithBrevo(options);
      console.log("✅ Email sent successfully via Brevo");
      return result;
    } catch (error) {
      console.log("❌ Brevo failed:", error.response?.data || error.message);
      console.log(
        "Error details:",
        JSON.stringify(error.response?.data, null, 2)
      );
    }
  } else {
    console.log("⚠️ Brevo API key not configured");
  }

  // Fallback to console logging for development
  console.log("📧 EMAIL TO:", options.email);
  console.log("🔑 VERIFICATION CODE:", options.code);
  console.log("📝 SUBJECT:", options.subject);

  return { success: true, method: "console" };
};

module.exports = { sendEmail };
