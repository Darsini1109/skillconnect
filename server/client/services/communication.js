const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send email
const sendEmail = async (to, subject, text, html = null, template = null) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@skillconnect.com',
      to,
      subject,
      text,
      html: html || text
    };

    // Apply template if provided
    if (template) {
      mailOptions.html = applyEmailTemplate(template, { subject, content: text });
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Apply email template
const applyEmailTemplate = (template, data) => {
  const templates = {
    welcome: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to SkillConnect!</h2>
        <p>${data.content}</p>
        <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0;">Best regards,<br>The SkillConnect Team</p>
        </div>
      </div>
    `,
    verification: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Account</h2>
        <p>${data.content}</p>
        <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0;">This link will expire in 24 hours.</p>
        </div>
      </div>
    `,
    notification: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${data.subject}</h2>
        <p>${data.content}</p>
        <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0;">Best regards,<br>The SkillConnect Team</p>
        </div>
      </div>
    `
  };

  return templates[template] || data.content;
};

// Send SMS (using a mock implementation - replace with actual SMS service)
const sendSMS = async (to, message) => {
  try {
    // Mock SMS implementation
    console.log(`SMS sent to ${to}: ${message}`);
    
    // In a real implementation, you would integrate with services like:
    // - Twilio
    // - AWS SNS
    // - Google Cloud Messaging
    // - etc.
    
    return { messageId: `sms_${Date.now()}`, status: 'sent' };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

// Send bulk email
const sendBulkEmail = async (recipients, subject, message, template = null) => {
  const results = {
    successful: [],
    failed: []
  };

  for (const recipient of recipients) {
    try {
      await sendEmail(recipient.email, subject, message, null, template);
      results.successful.push(recipient);
    } catch (error) {
      results.failed.push({
        recipient,
        error: error.message
      });
    }
  }

  return results;
};

// Send notification email
const sendNotificationEmail = async (userId, type, data) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || !user.preferences.notifications.email) {
      return;
    }

    const notifications = {
      welcome: {
        subject: 'Welcome to SkillConnect!',
        message: `Hi ${user.firstName}, welcome to SkillConnect! We're excited to have you join our community.`,
        template: 'welcome'
      },
      account_suspended: {
        subject: 'Account Suspended',
        message: `Your account has been suspended. Reason: ${data.reason}`,
        template: 'notification'
      },
      account_reactivated: {
        subject: 'Account Reactivated',
        message: 'Your account has been reactivated. You can now log in and continue using SkillConnect.',
        template: 'notification'
      },
      role_assigned: {
        subject: 'New Role Assigned',
        message: `You have been assigned a new role: ${data.role}`,
        template: 'notification'
      }
    };

    const notification = notifications[type];
    if (notification) {
      await sendEmail(
        user.email,
        notification.subject,
        notification.message,
        null,
        notification.template
      );
    }
  } catch (error) {
    console.error('Notification email failed:', error);
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendBulkEmail,
  sendNotificationEmail
};