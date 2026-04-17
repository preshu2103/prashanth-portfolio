# Prashanth Bandi — QA Engineer Portfolio

A full-stack portfolio website for **Prashanth Bandi**, Software Test Engineer.

---

## 🗂️ Project Structure

```
portfolio/
│
├── index.html              ← Frontend (single file, deploy to Vercel/Netlify)
│
└── backend/
    ├── server.js           ← Express API server
    ├── package.json        ← Node dependencies
    ├── .env.example        ← Environment variable template
    └── .env                ← YOUR secrets (never commit this!)
```

---

## 🚀 Quick Start

### 1. Frontend (index.html)

The entire frontend is in `index.html`. You can:
- Open it directly in a browser for local testing
- Deploy to **Vercel**, **Netlify**, or **GitHub Pages**

> Before deploying, update the `BACKEND_URL` inside the `<script>` section of `index.html`:
```js
const BACKEND_URL = 'https://your-backend.onrender.com';
```

---

### 2. Backend Setup

#### Step 1 — Install dependencies
```bash
cd backend
npm install
```

#### Step 2 — Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your real values:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail **App Password** (see below) |
| `FRONTEND_URL` | Your deployed frontend URL |
| `PORT` | Server port (default: 5000) |

#### Step 3 — Get Gmail App Password
1. Go to [Google Account](https://myaccount.google.com)
2. **Security** → **2-Step Verification** → Enable it
3. **Security** → **App Passwords**
4. Select App: "Mail", Device: "Other (Custom)"
5. Copy the 16-character password → paste into `EMAIL_PASS`

#### Step 4 — Set up MongoDB Atlas
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. **Database Access** → Create a user with password
4. **Network Access** → Add `0.0.0.0/0` (allow all IPs)
5. **Connect** → Drivers → Copy the URI
6. Paste into `MONGO_URI` (replace `<password>` with your actual password)

#### Step 5 — Run the server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## 🌐 Deployment

### Frontend → Vercel / Netlify

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Netlify:** Drag and drop `index.html` into [netlify.com/drop](https://app.netlify.com/drop)

---

### Backend → Render (Free Tier)

1. Push `backend/` folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Add all `.env` variables in Render dashboard
5. Deploy → Copy your Render URL
6. Update `BACKEND_URL` in `index.html` with your Render URL

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/contact` | Submit contact form |
| `GET` | `/api/inquiries` | List all inquiries (admin) |

### POST /api/contact

**Request Body:**
```json
{
  "fullName": "Ramesh Kumar",
  "companyName": "Infosys Ltd.",
  "email": "ramesh@infosys.com",
  "phone": "+91 98765 43210",
  "jobRole": "QA Analyst",
  "message": "We have an exciting QA opportunity..."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Inquiry received successfully!",
  "id": "65a1b2c3d4e5f6..."
}
```

---

## ✨ Features

- ✅ Dark / Light mode toggle with localStorage persistence
- ✅ Smooth scroll-reveal animations
- ✅ Mobile-responsive design
- ✅ Working contact form with MongoDB storage
- ✅ Email notification via Gmail SMTP (Nodemailer)
- ✅ Auto-reply email to recruiter
- ✅ Rate limiting (5 submissions per 15 minutes)
- ✅ Input sanitization & server-side validation
- ✅ Helmet.js security headers
- ✅ Professional HTML email templates
- ✅ SEO meta tags
- ✅ Resume download button

---

## 📋 Resume Download

Place your resume PDF file at the root of the project folder and name it `resume.pdf`. The "Download Resume" button links to `resume.pdf`.

---

## 🛡️ Security Notes

- Never commit `.env` to Git (it's in `.gitignore`)
- Use Gmail App Passwords, never your real Gmail password
- The `/api/inquiries` endpoint should be protected with authentication in production
- Rate limiting is configured to prevent spam (5 requests/15 min/IP)

---

## 📞 Contact

**Prashanth Bandi**
- Email: prashanthchowdary1981@gmail.com
- Phone: +91 7893554261
- Location: Bangalore, India
