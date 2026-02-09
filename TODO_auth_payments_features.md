ig# Add Authentication, Payments, and Other Features

## Overview
Enhance the data warehouse with advanced authentication (MFA), real payment integrations (Stripe), internationalization, and email notifications.

## Features to Implement

### 1. Multi-Factor Authentication (MFA)
- [x] Install MFA dependencies (speakeasy, qrcode)
- [x] Add MFA secret to user schema
- [x] Create MFA setup API endpoint
- [x] Create MFA verification API endpoint
- [x] Update auth flow to require MFA
- [ ] Add MFA setup UI in profile/settings
- [ ] Update signin page to include MFA step

### 2. Stripe Payment Integration
- [x] Install Stripe SDK
- [x] Create Stripe payment intent API
- [ ] Update checkout page to support Stripe
- [ ] Add Stripe webhook handler for payment confirmations
- [x] Update payment schema for Stripe transactions
- [ ] Add Stripe configuration to environment

### 3. Internationalization (i18n)
- [x] Install next-intl
- [x] Create locale files for English
- [ ] Update layout to support i18n
- [ ] Add language switcher component
- [ ] Translate key pages (home, auth, checkout)
- [ ] Add locale detection middleware

### 4. Email Notifications
- [x] Install nodemailer and email service
- [x] Create email service utility
- [x] Add email templates for payment events
- [x] Update payment verification to send emails
- [ ] Add user email preferences
- [ ] Create notification settings page

## Dependencies Added
- speakeasy, qrcode (for MFA)
- stripe (for payments)
- next-intl (for i18n)
- nodemailer (for emails)
- @types/speakeasy, @types/qrcode (TypeScript definitions)

## Implementation Steps
1. Set up dependencies and environment variables
2. Implement MFA backend and frontend
3. Integrate Stripe payments
4. Add i18n support
5. Implement email notifications
6. Test all features end-to-end

## Dependencies to Add
- speakeasy, qrcode (for MFA)
- stripe (for payments)
- next-intl (for i18n)
- nodemailer, @types/nodemailer (for emails)

## Environment Variables Needed
- MFA_SECRET_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- EMAIL_SMTP_HOST
- EMAIL_SMTP_PORT
- EMAIL_USER
- EMAIL_PASS
