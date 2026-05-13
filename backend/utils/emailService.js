const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP Server Ready');
  }
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

// Add at the bottom of the file
async function sendContactEmail(name, email, message) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #E75480, #F8C8DC); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-family: 'Playfair Display', serif; }
        .content { padding: 30px; }
        .message-box { background: #fef4f7; padding: 20px; border-radius: 15px; border-left: 4px solid #E75480; margin: 20px 0; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: 600; color: #E75480; display: inline-block; width: 80px; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ New Contact Message ✨</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="field-label">👤 Name:</span> ${name}
          </div>
          <div class="field">
            <span class="field-label">📧 Email:</span> ${email}
          </div>
          <div class="message-box">
            <strong>💬 Message:</strong><br>
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div class="footer">
          <p>Boutique Website | You received this because someone contacted you via the contact form.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Boutique Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `💌 New Contact Message from ${name}`,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
  return info;
}

async function sendEnquiryEmail({ name, mobile, address, pincode, serviceTitle, designTitle, designImageUrl }) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #E75480, #F8C8DC); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-family: 'Playfair Display', serif; }
        .content { padding: 30px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: 600; color: #E75480; display: inline-block; width: 100px; }
        .design-image { max-width: 100%; border-radius: 12px; margin-top: 10px; border: 1px solid #eee; }
        .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 New Design Enquiry</h1>
        </div>
        <div class="content">
          <div class="field">
            <span class="field-label">👤 Name:</span> ${name}
          </div>
          <div class="field">
            <span class="field-label">📞 Mobile:</span> ${mobile}
          </div>
          <div class="field">
            <span class="field-label">📍 Address:</span> ${address}, ${pincode}
          </div>
          <div class="field">
            <span class="field-label">💍 Service:</span> ${serviceTitle}
          </div>
          <div class="field">
            <span class="field-label">🎨 Design ID:</span> ${designTitle}
          </div>
          ${designImageUrl ? `<div class="field"><span class="field-label">🖼️ Design:</span><br/><img src="${designImageUrl}" class="design-image" alt="Design" /></div>` : ''}
        </div>
        <div class="footer">
          <p>Boutique Website | Customer enquiry received</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Boutique Enquiry" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📌 New Enquiry for ${serviceTitle} - ${designTitle}`,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Enquiry email sent with image:', info.messageId);
  return info;
}

module.exports = { sendOTPEmail, sendContactEmail,sendEnquiryEmail };