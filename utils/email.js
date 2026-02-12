import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: 'desarrollo2@holainformatica.com',
    to: email,
    subject: 'Código de verificación - MenuSense',
    text: `Tu código de verificación es: ${code}. Este código expira en 10 minutos.`,
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p><p>Este código expira en 10 minutos.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado a', email);
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}
