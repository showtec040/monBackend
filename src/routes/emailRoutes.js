const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  auth: {
    user: '942711001@smtp-brevo.com',
    pass: 'fD67pBcWraysEKM9'
  }
});

router.post('/bienvenue', async (req, res) => {
  const { nomComplet, email, telephone, departement, fonction, grade, matricule } = req.body;

  const mailOptions = {
    from: '"Pro-Archive RDC" <votre.email@gmail.com>',
    to: email,
    subject: 'Bienvenue sur Pro-Archive RDC',
    html: `
      <h2>Bienvenue ${nomComplet} !</h2>
      <p>Votre compte a été créé avec succès sur la plateforme Pro-Archive RDC.</p>
      <ul>
        <li><strong>Nom :</strong> ${nomComplet}</li>
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Téléphone :</strong> ${telephone}</li>
        <li><strong>Département :</strong> ${departement}</li>
        <li><strong>Fonction :</strong> ${fonction}</li>
        <li><strong>Grade :</strong> ${grade}</li>
        <li><strong>Matricule :</strong> ${matricule}</li>
      </ul>
      <p>Merci de rejoindre notre équipe !</p>
      <p>L'équipe Pro-Archive RDC</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email envoyé !' });
  } catch (err) {
    console.error('Erreur envoi email:', err);
    res.json({ success: false, message: 'Erreur lors de l\'envoi de l\'email.' });
  }
});

module.exports = router;