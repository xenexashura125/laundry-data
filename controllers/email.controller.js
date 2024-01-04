const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // set to false if you want to trust self-signed certificates
  auth: {
    user: 'travelandtour757@gmail.com',
    pass: 'cdqynlfnvkbtbqni',
  },
  tls: {
    rejectUnauthorized: false, // set to false to trust self-signed certificates
  },
});


const sendPasswordResetEmail = async (toEmail, resetToken, user) => {
  const mailOptions = {
    from: 'TRAVEL AND TOUR <travelandtour757@gmail.com>',
    to: toEmail,
    subject: 'Password Reset',
    html: `
      <p>Hello ${user.firstname},</p>
      <p>Click the link below to reset your password:</p>
      <a href="http://localhost:4200/reset-password?resetTokenId=${resetToken}">Reset Password Link</a>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Thank you!</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true; // Email sent successfully
  } catch (error) {
    console.error('Error sending email:', error);
    return false; // Email sending failed
  }
};

module.exports = {
  sendPasswordResetEmail
};