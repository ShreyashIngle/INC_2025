// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });


// export const sendResetPasswordEmail = async (email, resetUrl) => {
//   const mailOptions = {
//     from: process.env.SMTP_USER,
//     to: [email, 'adwaitborate@gmail.com'],
//     subject: 'Password Reset Request',
//     html: `
//       <h1>Password Reset Request</h1>
//       <p>You requested a password reset. Click the link below to reset your password:</p>
//       <a href="${resetUrl}">Reset Password</a>
//       <p>If you didn't request this, please ignore this email.</p>
//       <p>This link will expire in 30 minutes.</p>
//     `
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log('Password reset email sent successfully to', email);
//   } catch (error) {
//     console.error('Error sending password reset email to', email, error);
//   }
// };


import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Only use this in development
  }
});

// Verify SMTP connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP server connection error:', error);
  } else {
    console.log('SMTP server connection successful');
  }
});

export const sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"Password Reset" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 30 minutes.</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};