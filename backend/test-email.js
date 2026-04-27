require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔍 Testing email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
    console.error('❌ Missing environment variables. Check your .env file.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Boutique Test" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '✅ Test Email from Boutique Website',
    html: `
      <div style="font-family: Arial; padding: 20px; background: #f9f9f9;">
        <h2 style="color: #E75480;">Test Email</h2>
        <p>If you receive this, your email configuration is working correctly!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log(`📬 Check inbox of: ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    if (error.code === 'EAUTH') {
      console.log('\n💡 Tip: You need to use an App Password for Gmail.');
      console.log('Go to: https://myaccount.google.com/apppasswords');
      console.log('Generate a 16-character password and update EMAIL_PASS in .env');
    }
  }
}

testEmail();