// API para enviar e-mail via SMTP
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { to, subject, body, smtp } = req.body;

  if (!to || !subject || !body || !smtp) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: to, subject, body, smtp' });
  }

  try {
    // Implementação usando Nodemailer
    // Nota: Para implementação completa, instalar: npm install nodemailer
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      host: smtp.host,
      port: 587,
      secure: false,
      auth: {
        user: smtp.user,
        pass: smtp.pass
      }
    });

    const info = await transporter.sendMail({
      from: smtp.user,
      to: to,
      subject: subject,
      html: body
    });
    */

    // Por enquanto, simulação da resposta
    console.log('✉️ E-mail enviado:', { to, subject, smtp: smtp.host });
    
    return res.status(200).json({ 
      success: true, 
      messageId: 'email_' + Date.now(),
      message: 'E-mail enviado com sucesso (simulação)'
    });

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
}