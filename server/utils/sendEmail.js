const nodemailer = require("nodemailer");

// Brevo SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

// The "From" address Brevo actually sends as. This MUST be an email address
// that is verified as a sender in your Brevo account (Senders, Domains &
// Dedicated IPs -> Senders), otherwise Brevo will silently reject/drop the
// message even though sendMail() resolves without throwing.
// Falls back to BREVO_LOGIN if BREVO_FROM_EMAIL isn't set, but it's best to
// set BREVO_FROM_EMAIL explicitly on Render to a verified sender.
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.BREVO_LOGIN;

// Send a 6-digit OTP for email verification (registration) or password reset
const sendOtpEmail = async (email, otp, purpose = "verify") => {
  const isReset = purpose === "reset";
  const subject = isReset
    ? "Your Nyoranix password reset code"
    : "Verify your email - Nyoranix";
  const heading = isReset ? "Reset your password" : "Verify your email";
  const intro = isReset
    ? "Use the code below to reset your Nyoranix account password. This code expires in 10 minutes."
    : "Use the code below to verify your Nyoranix account. This code expires in 10 minutes.";

  const mailOptions = {
    from: `"Nyoranix Support" <${FROM_EMAIL}>`,
    to: email,
    subject,
    text: `Your ${isReset ? "password reset" : "verification"} code is: ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563EB; text-align: center;">${heading}</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">${intro}</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background: #f3f4f6; padding: 16px 32px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #999; text-align: center;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          © ${new Date().getFullYear()} Nyoranix. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: `"Nyoranix Support" <${FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Nyoranix! 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">

          <h2 style="color: #2563EB; text-align: center;">
            Welcome to Nyoranix, ${name}!
          </h2>

          <p style="font-size: 16px; color: #333;">
            Hi <strong>${name}</strong>,
          </p>

          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            We are thrilled to have you on board! You have successfully created your account.
            Now you can explore our premium range of educational, industrial, and consumer electronics.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a
              href="https://nyoranix-web.onrender.com/shop"
              style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;"
            >
              Start Shopping
            </a>
          </div>

          <p style="font-size: 14px; color: #999; text-align: center;">
            If you have any questions, feel free to reply to this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="font-size: 12px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} Nyoranix. All rights reserved.
          </p>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Welcome email sent successfully");
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }
};


// Notify admin whenever a customer submits the Contact Us form
const sendInquiryNotification = async (inquiry) => {
  try {
    const adminEmail =
      process.env.ADMIN_EMAIL || FROM_EMAIL;

    const mailOptions = {
      from: `"Nyoranix Website" <${FROM_EMAIL}>`,
      to: adminEmail,

      // Reply directly to the customer
      replyTo: inquiry.email,

      subject: `New Contact Message: ${inquiry.subject}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">

          <h2 style="color: #dc2626; text-align: center;">
            New Contact Form Message
          </h2>

          <table style="width: 100%; font-size: 15px; color: #333; border-collapse: collapse;">

            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 100px;">
                Name
              </td>
              <td style="padding: 8px 0;">
                ${inquiry.name}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0; font-weight: bold;">
                Email
              </td>
              <td style="padding: 8px 0;">
                <a href="mailto:${inquiry.email}">
                  ${inquiry.email}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding: 8px 0; font-weight: bold;">
                Subject
              </td>
              <td style="padding: 8px 0;">
                ${inquiry.subject}
              </td>
            </tr>

          </table>

          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #eee;">

            <p style="margin: 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #888;">
              Message
            </p>

            <p style="margin: 8px 0 0; font-size: 15px; color: #333; white-space: pre-wrap; line-height: 1.6;">
              ${inquiry.message}
            </p>

          </div>

          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
            This message was also saved to your Admin Panel → Messages.
          </p>

        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(" Inquiry notification email sent successfully");

  } catch (error) {
    console.error(
      " Error sending inquiry notification email:",
      error
    );
  }
};


module.exports = {
  sendWelcomeEmail,
  sendInquiryNotification,
  sendOtpEmail,
};