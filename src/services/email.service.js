const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');
const { compileTemplate } = require('../utils/helpers');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(to, subject, templateName, context = {}) {
    try {
      const html = await compileTemplate(templateName, context);
      
      await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html
      });
      
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error(`Email sending failed: ${error}`);
      throw new ApiError.internal('Email could not be sent');
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await this.sendEmail(
      email,
      'Verify Your Email',
      'email-verification',
      { verificationUrl }
    );
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    await this.sendEmail(
      email,
      'Password Reset Request',
      'password-reset',
      { resetUrl }
    );
  }

  async sendWelcomeEmail(email, name) {
    await this.sendEmail(
      email,
      'Welcome to Our Platform',
      'welcome',
      { name }
    );
  }
}

module.exports = new EmailService();