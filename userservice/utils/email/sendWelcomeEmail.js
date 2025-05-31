import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMPT_MAIL,
    pass: process.env.SMPT_MAIL_PASSWORD,
  },
});

async function sendWelcomeEmail(user) {
  try {
    const subject = `Welcome to ScriptAI, ${user.name}! 🎉`;
    const text = `
Hi ${user.name},

Welcome to ScriptAI! We’re thrilled to have you on board.

ScriptAI helps you generate professional ad scripts in seconds.

Happy scripting!
The ScriptAI Team

© ${new Date().getFullYear()} ScriptAI. All rights reserved.
123 ScriptAI Blvd, Suite 100, City, State, ZIP
`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ScriptAI</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #4f46e5;
      color: #ffffff;
      padding: 16px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .content {
      padding: 24px;
      color: #333333;
      line-height: 1.5;
    }
    .content h2 {
      color: #4f46e5;
      font-size: 18px;
      margin-bottom: 12px;
    }
    .content p {
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff;
      text-decoration: none;
      padding: 10px 18px;
      border-radius: 4px;
      font-weight: bold;
    }
    .footer {
      background-color: #f4f4f7;
      color: #666666;
      font-size: 12px;
      text-align: center;
      padding: 16px;
    }
    @media (max-width: 600px) {
      .content {
        padding: 16px;
      }
      .header h1 {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ScriptAI!</h1>
    </div>
    <div class="content">
      <h2>Hey ${user.name},</h2>
      <p>
        We’re thrilled to have you on board. ScriptAI makes it easy to create professional ad
        scripts in just a few clicks.
      </p>
     
      <p>Happy scripting!<br/>The ScriptAI Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ScriptAI. All rights reserved.</p>
      <p>123 ScriptAI Blvd, Suite 100, City, State, ZIP</p>
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
      from: "ScriptAI <no-reply@scriptai.com>",
      to: user.email,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

export default sendWelcomeEmail;
