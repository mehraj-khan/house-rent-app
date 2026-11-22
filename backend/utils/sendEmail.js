/* eslint-disable */
import process from 'node:process';
import nodemailer from 'nodemailer';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// مشترکہ ٹرانسپورٹر (Gmail Auth)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ========================================================
// 1. 📩 6 ہندسوں کا OTP کوڈ بھیجنے کا نیا فنکشن (Registration OTP)
// ========================================================
export const sendOTPEmail = async (toEmail, otpCode) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !toEmail) {
    throw new Error('Email credentials (EMAIL_USER / EMAIL_PASS) missing in environment variables.');
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"HouseRent PK Verification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your Verification Code: ${otpCode} - HouseRent PK`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #0f172a; color: #ffffff; padding: 18px 22px;">
            <h2 style="margin: 0; font-size: 18px;">🏠 HouseRent PK — Email Verification</h2>
          </div>
          <div style="padding: 22px; color: #334155;">
            <p style="margin-top: 0; font-size: 15px;">Assalam-o-Alaikum,</p>
            <p style="font-size: 14px; line-height: 1.5;">
              Thank you for registering. Use the 6-digit verification code below to verify your email address:
            </p>
            <div style="background: #eff6ff; border: 1.5px dashed #2563eb; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1d4ed8;">${escapeHtml(otpCode)}</span>
            </div>
            <p style="font-size: 12px; color: #dc2626; font-weight: bold; margin-bottom: 0;">
              * This code will expire in 10 minutes. Do not share this code with anyone.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 12px 22px; font-size: 12px; color: #64748b;">
            Tip: If you did not request this, please ignore this email.
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('OTP Email send failed:', err.message);
    throw err;
  }
};

// ========================================================
// 2. 💬 نیا میسج آنے پر ای میل بھیجنے کا فنکشن (آپ کا پرانا فنکشن)
// ========================================================
export const sendNewMessageEmail = async ({
  toEmail,
  toName,
  senderName,
  text,
  contextTitle,
}) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !toEmail) {
    return;
  }

  try {
    const transporter = createTransporter();
    const siteUrl = process.env.CLIENT_URL || 'https://house-rent-web-uvz7.vercel.app';
    const safeToName = escapeHtml(toName || 'User');
    const safeSender = escapeHtml(senderName || 'Someone');
    const safeText = escapeHtml(text || '');
    const safeTitle = escapeHtml(contextTitle || 'HouseRent PK');
    const cleanSubjectSender = String(senderName || 'Someone').replace(/[\r\n]+/g, ' ');

    await transporter.sendMail({
      from: `"HouseRent PK" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `💬 New Message from ${cleanSubjectSender} - HouseRent PK`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; color: #ffffff; padding: 18px 22px;">
            <h2 style="margin: 0; font-size: 18px;">🏠 HouseRent PK — New Message</h2>
          </div>
          <div style="padding: 22px; background: #ffffff; color: #334155;">
            <p style="margin-top: 0;">Assalam-o-Alaikum <b>${safeToName}</b>,</p>
            <p><b>${safeSender}</b> sent you a message regarding <b>${safeTitle}</b>:</p>
            <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 12px 14px; border-radius: 6px; margin: 16px 0; color: #0f172a;">
              "${safeText}"
            </div>
            <a href="${siteUrl}/messages" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 11px 20px; border-radius: 8px; font-weight: bold;">
              Reply Now →
            </a>
          </div>
          <div style="background: #f8fafc; padding: 12px 22px; font-size: 12px; color: #64748b;">
            Tip: Always pay via Official Escrow for 100% safety.
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};