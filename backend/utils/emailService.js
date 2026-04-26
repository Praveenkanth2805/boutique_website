const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: `"Boutique" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP for Verification',
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };