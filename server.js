/**
 * ============================================================
 * Prashanth Bandi — Portfolio Backend Server
 * Stack: Node.js + Express + MongoDB + Nodemailer (Gmail SMTP)
 * ============================================================
 */

const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
require('dotenv').config();
console.log(process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Security Middleware ─────────────────────────────────── */
app.use(helmet());

// CORS — Allow only your frontend domain in production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  process.env.FRONTEND_URL,  // Set in .env for production
].filter(Boolean);

app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting — Max 5 contact form submissions per 15 min per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many submissions from this IP. Please try again after 15 minutes.',
  },
  
});

app.use(express.json({ limit: '10kb' }));  // Limit body size

/* ── MongoDB Connection ──────────────────────────────────── */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected successfully');
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

/* ── MongoDB Schema & Model ──────────────────────────────── */
const inquirySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name too long'],
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [150, 'Company name too long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    maxlength: [200, 'Email too long'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    maxlength: [20, 'Phone number too long'],
  },
  jobRole: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true,
    maxlength: [200, 'Job role too long'],
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message too long'],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  collection: 'inquiries',
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

/* ── Nodemailer Transporter ──────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // Your Gmail: prashanthchowdary1981@gmail.com
    pass: process.env.EMAIL_PASS,   // Gmail App Password (NOT your real password)
  },
});

// Verify email transport on startup
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Email transporter error:', err.message);
  } else {
    console.log('✅ Email service ready');
  }
});

/* ── Email HTML Template ─────────────────────────────────── */
function buildEmailHTML(data) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Job Inquiry</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
      .wrap { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #080c14, #141e30); padding: 36px 32px; text-align: center; }
      .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
      .header p { color: #00e5a0; margin: 6px 0 0; font-size: 14px; font-family: monospace; }
      .badge { display: inline-block; background: rgba(0, 229, 160, 0.15); border: 1px solid rgba(0, 229, 160, 0.4); color: #00e5a0; font-size: 12px; padding: 4px 14px; border-radius: 100px; margin-top: 12px; }
      .body { padding: 32px; }
      .field { margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f0f4f8; }
      .field:last-child { border-bottom: none; }
      .field label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9aabb8; font-weight: 600; margin-bottom: 5px; display: block; }
      .field value { font-size: 15px; color: #1a2540; font-weight: 500; }
      .message-box { background: #f5f8ff; border-radius: 10px; padding: 16px; border-left: 3px solid #00e5a0; }
      .message-box p { color: #1a2540; font-size: 14px; line-height: 1.7; margin: 0; }
      .footer { background: #f0f4f8; padding: 20px 32px; text-align: center; font-size: 12px; color: #9aabb8; }
      .footer a { color: #00e5a0; }
      .timestamp { font-family: monospace; font-size: 12px; color: #9aabb8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h1>📬 New Job Inquiry</h1>
        <p>// Prashanth Bandi — Portfolio Contact</p>
        <span class="badge">⚡ Immediate Action Required</span>
      </div>
      <div class="body">
        <div class="field">
          <label>Recruiter Name</label>
          <value>${escapeHtml(data.fullName)}</value>
        </div>
        <div class="field">
          <label>Company</label>
          <value>${escapeHtml(data.companyName)}</value>
        </div>
        <div class="field">
          <label>Email Address</label>
          <value><a href="mailto:${escapeHtml(data.email)}" style="color:#00e5a0;">${escapeHtml(data.email)}</a></value>
        </div>
        <div class="field">
          <label>Phone Number</label>
          <value><a href="tel:${escapeHtml(data.phone)}" style="color:#00e5a0;">${escapeHtml(data.phone)}</a></value>
        </div>
        <div class="field">
          <label>Job Role Offered</label>
          <value style="color:#00e5a0; font-size:17px; font-weight:700;">💼 ${escapeHtml(data.jobRole)}</value>
        </div>
        <div class="field">
          <label>Message / Job Description</label>
          <div class="message-box">
            <p>${escapeHtml(data.message).replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
        <p class="timestamp">📅 Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
      <div class="footer">
        <p>This inquiry was submitted via your portfolio at <a href="#">prashanthbandi.dev</a></p>
        <p>Reply directly to <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Auto-reply email to the recruiter
function buildAutoReplyHTML(data) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
      .wrap { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #080c14, #141e30); padding: 32px; text-align: center; }
      .header h2 { color: #ffffff; margin: 0 0 6px; font-size: 22px; }
      .header p { color: #00e5a0; font-size: 13px; margin: 0; font-family: monospace; }
      .body { padding: 32px; color: #1a2540; font-size: 15px; line-height: 1.75; }
      .highlight { background: rgba(0,229,160,0.08); border-radius: 10px; padding: 16px; border-left: 3px solid #00e5a0; margin: 20px 0; }
      .footer { background: #f0f4f8; padding: 18px; text-align: center; font-size: 12px; color: #9aabb8; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="header">
        <h2>Thank You, ${escapeHtml(data.fullName)}!</h2>
        <p>// Your inquiry has been received</p>
      </div>
      <div class="body">
        <p>Hi ${escapeHtml(data.fullName)},</p>
        <p>Thank you for reaching out regarding the <strong>${escapeHtml(data.jobRole)}</strong> position at <strong>${escapeHtml(data.companyName)}</strong>.</p>
        <div class="highlight">
          <p><strong>Prashanth Bandi</strong> — Software Test Engineer / QA Analyst — will review your inquiry and get back to you shortly.</p>
        </div>
        <p>📞 You can also reach him directly at: <strong>+91 7893554261</strong></p>
        <p>Best regards,<br /><strong>Prashanth Bandi</strong><br />Software Test Engineer | QA Analyst<br />Bangalore, India</p>
      </div>
      <div class="footer">Auto-reply from Prashanth Bandi's Portfolio</div>
    </div>
  </body>
  </html>
  `;
}

/* ── HTML escape helper (prevent XSS in emails) ────────── */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── INPUT SANITIZATION ─────────────────────────────────── */
function sanitizeInput(val) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, 2000);
}

/* ── ROUTES ─────────────────────────────────────────────── */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Get all inquiries (for admin use — protect this in production with auth)
app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ submittedAt: -1 }).select('-ipAddress');
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Contact form submission
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    // Extract and sanitize fields
    const fullName    = sanitizeInput(req.body.fullName);
    const companyName = sanitizeInput(req.body.companyName);
    const email       = sanitizeInput(req.body.email);
    const phone       = sanitizeInput(req.body.phone);
    const jobRole     = sanitizeInput(req.body.jobRole);
    const message     = sanitizeInput(req.body.message);

    /* ── Server-side Validation ─────────────────────────── */
    const errors = [];

    if (!fullName || fullName.length < 2)
      errors.push('Full name must be at least 2 characters.');
    if (!companyName || companyName.length < 2)
      errors.push('Company name must be at least 2 characters.');
    if (!email || !validator.isEmail(email))
      errors.push('Please provide a valid email address.');
    if (!phone || !/^[\+]?[\d\s\-\(\)]{7,15}$/.test(phone))
      errors.push('Please provide a valid phone number.');
    if (!jobRole || jobRole.length < 2)
      errors.push('Job role must be at least 2 characters.');
    if (!message || message.length < 10)
      errors.push('Message must be at least 10 characters.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    /* ── Save to MongoDB ────────────────────────────────── */
    const inquiry = await Inquiry.create({
      fullName,
      companyName,
      email,
      phone,
      jobRole,
      message,
      ipAddress: req.ip,
    });

    /* ── Send Email Notification to Prashanth ─────────── */
    const mailToOwner = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'prashanthchowdary1981@gmail.com',
      subject: `🔔 New Job Inquiry from ${fullName} — ${jobRole} at ${companyName}`,
      html: buildEmailHTML({ fullName, companyName, email, phone, jobRole, message }),
      replyTo: email,
    };

    /* ── Auto-reply to Recruiter ────────────────────────── */
    const mailToRecruiter = {
      from: `"Prashanth Bandi" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Re: Your Job Inquiry — Prashanth Bandi (QA Engineer)`,
      html: buildAutoReplyHTML({ fullName, companyName, jobRole }),
    };

    // Send both emails concurrently
    await Promise.all([
      transporter.sendMail(mailToOwner),
      transporter.sendMail(mailToRecruiter),
    ]);

    console.log(`📩 Inquiry saved [ID: ${inquiry._id}] & emails sent — from ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully! Prashanth will contact you soon.',
      id: inquiry._id,
    });

  } catch (err) {
    console.error('❌ Contact API error:', err);

    // If MongoDB saved but email failed, still return success
    if (err.code === 'ECONNREFUSED' || err.responseCode) {
      return res.status(201).json({
        success: true,
        message: 'Inquiry received! (Email notification pending)',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again or email directly.',
    });
  }
});

/* ── 404 Handler ─────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ── Global Error Handler ────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

/* ── Start Server ────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📌 API: http://localhost:${PORT}/api/health\n`);
});
