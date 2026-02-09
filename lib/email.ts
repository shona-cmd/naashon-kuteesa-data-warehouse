import nodemailer from 'nodemailer';

// Create a transporter for sending emails using Gmail
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'nathanielkuts@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD, // You'll need to generate an App Password
  },
});

export interface PaymentNotificationData {
  transaction_id: string;
  amount: string;
  status: string;
  provider: string;
}

/**
 * Send payment notification email to customer
 */
export async function sendPaymentNotification(
  to: string,
  subject: string,
  paymentDetails: PaymentNotificationData
) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .payment-details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
          .status-completed { background-color: #dcfce7; color: #166534; }
          .status-pending { background-color: #fef9c3; color: #854d0e; }
          .status-failed { background-color: #fee2e2; color: #991b1b; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Notification</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>Your payment has been processed successfully.</p>
            
            <div class="payment-details">
              <h3>Payment Details:</h3>
              <p><strong>Transaction ID:</strong> ${paymentDetails.transaction_id}</p>
              <p><strong>Amount:</strong> ${paymentDetails.amount}</p>
              <p><strong>Status:</strong> <span class="status status-${paymentDetails.status}">${paymentDetails.status}</span></p>
              <p><strong>Provider:</strong> ${paymentDetails.provider}</p>
            </div>
            
            <p>If you have any questions about this transaction, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>Thank you for using Naashon Data Warehouse!</p>
            <p>&copy; ${new Date().getFullYear()} Naashon Kuteesa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'nathanielkuts@gmail.com',
      to,
      subject,
      html,
    });

    console.log(`Payment notification sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send payment notification:', error);
    return false;
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .features { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .feature-item { padding: 8px 0; border-bottom: 1px solid #eee; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Naashon Data Warehouse!</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for joining our platform. We're excited to have you on board!</p>
            
            <div class="features">
              <h3>What you can do:</h3>
              <div class="feature-item">📊 Advanced Analytics Dashboard</div>
              <div class="feature-item">💳 Multiple Payment Methods</div>
              <div class="feature-item">🌍 Global Support</div>
              <div class="feature-item">🔒 Secure Authentication</div>
            </div>
            
            <p>Get started by exploring your dashboard and discovering powerful insights for your business.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Naashon Kuteesa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'nathanielkuts@gmail.com',
      to,
      subject: 'Welcome to Naashon Data Warehouse',
      html,
    });

    console.log(`Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send MFA setup confirmation email
 */
export async function sendMfaSetupEmail(to: string, name: string) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; }
          .alert { background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MFA Enabled Successfully</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Multi-Factor Authentication (MFA) has been successfully enabled on your account.</p>
            
            <div class="alert">
              <strong>Security Notice:</strong> Your account is now protected with an additional layer of security. You will need to enter a verification code from your authenticator app each time you sign in.
            </div>
            
            <p>If you did not make this change, please contact our support team immediately.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Naashon Kuteesa. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'noreply@example.com',
      to,
      subject: 'MFA Enabled - Naashon Data Warehouse',
      html,
    });

    console.log(`MFA setup email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Failed to send MFA setup email:', error);
    return false;
  }
}

