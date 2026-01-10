import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Check if email credentials are configured
const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

// Create reusable transporter only if configured
let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.error('⚠️  Email service configuration error:', error.message);
      console.log('Email functionality will be disabled.');
    } else {
      console.log('✓ Email service is ready to send messages');
    }
  });
} else {
  console.log('⚠️  Email service is disabled. Set EMAIL_USER and EMAIL_PASSWORD in .env to enable.');
}

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (email, username, token) => {
  if (!isEmailConfigured || !transporter) {
    console.log(`⚠️  Skipping verification email to ${email} (email not configured)`);
    return { success: false, message: 'Email service not configured' };
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"WAFA - Ne pas répondre" <${process.env.EMAIL_USER}>`,
    replyTo: 'noreply@wafa.ma',
    to: email,
    subject: 'Vérifiez votre adresse email - WAFA',
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'WAFA Medical Platform',
      'List-Unsubscribe': `<mailto:unsubscribe@wafa.ma?subject=unsubscribe>`,
    },
    text: `Bonjour ${username},\n\nMerci de vous être inscrit sur WAFA ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur ce lien :\n\n${verificationUrl}\n\nCe lien expirera dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.\n\n© ${new Date().getFullYear()} WAFA. Tous droits réservés.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">WAFA</h1>
          <p style="color: white; margin: 10px 0 0 0;">Plateforme d'apprentissage médical</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #333;">Bonjour ${username},</h2>
          <p style="color: #555; line-height: 1.6;">
            Merci de vous être inscrit sur WAFA ! Pour activer votre compte, 
            veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;">
              Vérifier mon email
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 12px;">
            ${verificationUrl}
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte, 
            ignorez cet email.
          </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} WAFA. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, username, token, firebaseResetLink = null) => {
  if (!isEmailConfigured || !transporter) {
    console.log(`⚠️  Skipping password reset email to ${email} (email not configured)`);
    return { success: false, message: 'Email service not configured' };
  }

  // Use Firebase reset link if provided, otherwise use traditional token-based reset
  const resetUrl = firebaseResetLink || `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const isFirebaseReset = !!firebaseResetLink;
  
  const mailOptions = {
    from: `"WAFA - Ne pas répondre" <${process.env.EMAIL_USER}>`,
    replyTo: 'noreply@wafa.ma',
    to: email,
    subject: 'Réinitialisation de votre mot de passe - WAFA',
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'WAFA Medical Platform',
      'List-Unsubscribe': `<mailto:unsubscribe@wafa.ma?subject=unsubscribe>`,
    },
    text: `Bonjour ${username},\n\nVous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien pour créer un nouveau mot de passe :\n\n${resetUrl}\n\n⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe restera inchangé.\n\nCe lien expirera dans ${isFirebaseReset ? '1 heure' : '1 heure'}.\n\n© ${new Date().getFullYear()} WAFA. Tous droits réservés.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">WAFA</h1>
          <p style="color: white; margin: 10px 0 0 0;">Réinitialisation du mot de passe</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #333;">Bonjour ${username},</h2>
          <p style="color: #555; line-height: 1.6;">
            Vous avez demandé à réinitialiser votre mot de passe. 
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #555; line-height: 1.6; font-size: 14px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 12px;">
            ${resetUrl}
          </p>
          
          <p style="color: #ff6b6b; line-height: 1.6; margin-top: 30px; font-size: 14px;">
            ⚠️ Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
            Votre mot de passe restera inchangé.
          </p>
          
          <p style="color: #999; font-size: 12px;">
            Ce lien expirera dans ${isFirebaseReset ? '1 heure' : '1 heure'}.
          </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} WAFA. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Send contact form notification to admin
 */
export const sendContactNotification = async (contactData) => {
  if (!isEmailConfigured || !transporter) {
    console.log(`⚠️  Skipping contact notification email (email not configured)`);
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"WAFA Contact Form" <${process.env.EMAIL_USER}>`,
    replyTo: contactData.email,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `Nouveau message de contact: ${contactData.subject}`,
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'WAFA Medical Platform',
    },
    text: `Nouveau message de contact\n\nNom: ${contactData.name}\nEmail: ${contactData.email}\nSujet: ${contactData.subject}\n\nMessage:\n${contactData.message}\n\n© ${new Date().getFullYear()} WAFA Admin Panel`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px;">
          <h1 style="color: white; margin: 0;">Nouveau message de contact</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h3 style="color: #333;">Détails du message :</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; background-color: #e5e7eb; font-weight: bold;">Nom :</td>
              <td style="padding: 10px; background-color: #fff;">${contactData.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #e5e7eb; font-weight: bold;">Email :</td>
              <td style="padding: 10px; background-color: #fff;">${contactData.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #e5e7eb; font-weight: bold;">Sujet :</td>
              <td style="padding: 10px; background-color: #fff;">${contactData.subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #333; margin-top: 20px;">Message :</h3>
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px;">
            <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${contactData.message}</p>
          </div>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} WAFA Admin Panel
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact notification sent to admin');
    return { success: true };
  } catch (error) {
    console.error('Error sending contact notification:', error);
    throw error;
  }
};

/**
 * Send welcome email after email verification
 */
export const sendWelcomeEmail = async (email, username) => {
  if (!isEmailConfigured || !transporter) {
    console.log(`⚠️  Skipping welcome email to ${email} (email not configured)`);
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"WAFA - Ne pas répondre" <${process.env.EMAIL_USER}>`,
    replyTo: 'noreply@wafa.ma',
    to: email,
    subject: 'Bienvenue sur WAFA ! 🎉',
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'WAFA Medical Platform',
      'List-Unsubscribe': `<mailto:unsubscribe@wafa.ma?subject=unsubscribe>`,
    },
    text: `Félicitations ${username} !\n\nVotre compte a été vérifié avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de notre plateforme d'apprentissage médical.\n\nCe que vous pouvez faire :\n✅ Accéder à des milliers de QCM médicaux\n📚 Consulter des résumés de cours\n📊 Suivre vos progrès en temps réel\n🏆 Participer au classement des meilleurs étudiants\n📝 Créer vos playlists et notes personnalisées\n\nCommencez maintenant: ${process.env.FRONTEND_URL}/dashboard\n\nBesoin d'aide ? N'hésitez pas à nous contacter !\n\n© ${new Date().getFullYear()} WAFA. Tous droits réservés.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Bienvenue sur WAFA !</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #333;">Félicitations ${username} ! 🎊</h2>
          <p style="color: #555; line-height: 1.6;">
            Votre compte a été vérifié avec succès. Vous pouvez maintenant profiter 
            de toutes les fonctionnalités de notre plateforme d'apprentissage médical.
          </p>
          
          <h3 style="color: #333; margin-top: 30px;">Ce que vous pouvez faire :</h3>
          <ul style="color: #555; line-height: 1.8;">
            <li>✅ Accéder à des milliers de QCM médicaux</li>
            <li>📚 Consulter des résumés de cours</li>
            <li>📊 Suivre vos progrès en temps réel</li>
            <li>🏆 Participer au classement des meilleurs étudiants</li>
            <li>📝 Créer vos playlists et notes personnalisées</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;">
              Commencer maintenant
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Besoin d'aide ? N'hésitez pas à nous contacter !
          </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} WAFA. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

/**
 * Send profile verification code email
 */
export const sendProfileVerificationEmail = async (email, name, code) => {
  if (!isEmailConfigured || !transporter) {
    console.log(`⚠️  Skipping profile verification email to ${email} (email not configured)`);
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"WAFA - Ne pas répondre" <${process.env.EMAIL_USER}>`,
    replyTo: 'noreply@wafa.ma',
    to: email,
    subject: 'Code de vérification de profil - WAFA',
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'WAFA Medical Platform',
    },
    text: `Bonjour ${name || 'Utilisateur'},\n\nVous avez demandé à modifier vos informations personnelles sur WAFA. Voici votre code de vérification :\n\n${code}\n\nCe code expire dans 15 minutes.\n\nSi vous n'avez pas demandé cette modification, vous pouvez ignorer cet email.\n\n© ${new Date().getFullYear()} WAFA. Tous droits réservés.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">WAFA</h1>
          <p style="color: white; margin: 10px 0 0 0;">Plateforme d'apprentissage médical</p>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <h2 style="color: #333;">Bonjour ${name || 'Utilisateur'},</h2>
          <p style="color: #555; line-height: 1.6;">
            Vous avez demandé à modifier vos informations personnelles sur WAFA.
            Voici votre code de vérification :
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f0f0f0; 
                        padding: 20px 40px; 
                        border-radius: 10px; 
                        display: inline-block;
                        letter-spacing: 8px;
                        font-size: 32px;
                        font-weight: bold;
                        color: #333;">
              ${code}
            </div>
          </div>
          
          <p style="color: #555; line-height: 1.6;">
            Ce code expire dans <strong>15 minutes</strong>.
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            Si vous n'avez pas demandé cette modification, vous pouvez ignorer cet email.
          </p>
        </div>
        
        <div style="background-color: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} WAFA. Tous droits réservés.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Profile verification email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending profile verification email:', error);
    throw error;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactNotification,
  sendWelcomeEmail,
  sendProfileVerificationEmail,
};
