const SibApiV3Sdk = require('sib-api-v3-sdk');

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];

apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOTPEmail(to, otp) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: 'Boutique',
    email: process.env.EMAIL_USER,
  };

  sendSmtpEmail.to = [{ email: to }];

  sendSmtpEmail.subject = 'Your OTP for Verification';

  sendSmtpEmail.htmlContent = `
    <p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>
  `;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
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

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: 'Boutique Contact',
    email: process.env.EMAIL_USER,
  };

  sendSmtpEmail.to = [
    {
      email: process.env.ADMIN_EMAIL,
    },
  ];

  sendSmtpEmail.subject = `💌 New Contact Message from ${name}`;
  sendSmtpEmail.htmlContent = htmlContent;
  const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log('Email sent:', response);
  return response;
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

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: 'Boutique Enquiry',
    email: process.env.EMAIL_USER,
  };

  sendSmtpEmail.to = [
    {
      email: process.env.ADMIN_EMAIL,
    },
  ];

  sendSmtpEmail.subject = `📌 New Enquiry for ${serviceTitle} - ${designTitle}`;
  sendSmtpEmail.htmlContent = htmlContent;
  const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
  console.log('Enquiry email sent:', response);
  return response;
}

module.exports = { sendOTPEmail, sendContactEmail,sendEnquiryEmail };