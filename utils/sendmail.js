const nodemailer = require("nodemailer");

module.exports = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.verify();
    console.log("SMTP Connected");

    const info = await transporter.sendMail({
      from: `"HireFlow" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log("Mail Sent:", info.messageId);

  } catch (error) {
    console.log("Mail Error:", error);
  }
};