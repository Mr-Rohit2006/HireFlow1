# 🚀 HireFlow — AI-Powered Job Portal

> A full-stack job portal connecting **students** and **recruiters** with built-in **AI-driven ATS resume scoring**, automated email notifications, and a modern glassmorphic UI.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [API & Routes Overview](#-api--routes-overview)
- [AI-Powered ATS Scoring](#-ai-powered-ats-scoring)
- [Email Notifications](#-email-notifications)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎓 Student Portal
- **Dashboard** — View application stats (total jobs, applied, shortlisted, rejected, pending) and personalized job recommendations
- **Job Browsing** — Search and filter available job listings
- **Save Jobs** — Bookmark jobs for later and manage a saved jobs list
- **ATS Score Checker** — Upload your resume and instantly get an AI-calculated match score against any job description *before* applying
- **One-Click Apply** — Apply to jobs with resume upload; AI scores your resume automatically
- **Application Tracker** — Monitor the status of all submitted applications in real-time
- **Profile Management** — Update personal info, skills, bio, and upload your resume

### 💼 Recruiter Portal
- **Dashboard** — Overview of posted jobs and total applications received
- **Post Jobs** — Create new job listings with title, company, location, salary, type, and full descriptions
- **Edit & Delete Jobs** — Full CRUD operations on job postings
- **Applicant Management** — View all applicants per job with their ATS scores
- **Status Updates** — Shortlist or reject candidates with a single click
- **Resume Downloads** — Download applicant resumes directly from the portal
- **Profile Management** — Update recruiter profile information

### 🔐 Authentication & Security
- **JWT-Based Auth** — Stateless authentication using httpOnly cookies
- **Role-Based Access Control** — Separate middleware for students, recruiters, and authenticated users
- **Password Hashing** — Secure bcrypt password hashing (10 salt rounds)
- **Forgot/Reset Password** — Token-based password reset flow via email
- **Remember Me** — Extended session duration (7 days) with opt-in
- **Route Protection** — Middleware guards on all sensitive routes

### 📧 Automated Emails
- Application confirmation to students
- New application alerts to recruiters
- Shortlist congratulations email
- Rejection notification email
- Password reset link email

---

## 🛠 Tech Stack

| Layer          | Technology                                                       |
|----------------|------------------------------------------------------------------|
| **Runtime**    | Node.js                                                          |
| **Framework**  | Express.js 5                                                     |
| **Database**   | MongoDB (via Mongoose 9)                                         |
| **Templating** | EJS (Embedded JavaScript)                                        |
| **Auth**       | JSON Web Tokens (JWT) + bcrypt                                   |
| **AI/LLM**     | Groq API (Llama 3.3 70B) — for ATS resume analysis              |
| **Email**      | Nodemailer (Gmail SMTP)                                          |
| **File Upload**| Multer                                                           |
| **PDF Parsing**| pdf-parse                                                        |
| **Styling**    | Vanilla CSS with glassmorphic design                             |

---

## 📁 Project Structure

```
hireflow/
├── app.js                    # Express app entry point & server setup
├── package.json              # Dependencies & scripts
├── .env.example              # Environment variable template
├── .gitignore
│
├── config/
│   └── db.js                 # MongoDB connection setup
│
├── models/
│   ├── User.js               # User schema (student/recruiter roles)
│   ├── Job.js                # Job listing schema
│   └── Application.js        # Application schema with resume & ATS score
│
├── controllers/
│   ├── authController.js     # Register, login, logout, forgot/reset password
│   ├── recruiterController.js# Dashboard, CRUD jobs, applicant management
│   ├── studentController.js  # Dashboard, profile, save jobs
│   ├── applicationController.js # Apply, ATS check, my applications
│   └── jobController.js      # Job listing & posting
│
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── recruiterRoutes.js    # Recruiter-only endpoints
│   ├── studentRoutes.js      # Student-only endpoints
│   ├── applicationRoutes.js  # Application endpoints
│   └── jobRoutes.js          # Job browsing & posting endpoints
│
├── middleware/
│   ├── isAuth.js             # JWT verification middleware
│   ├── isRecruiter.js        # Recruiter role guard
│   ├── isStudent.js          # Student role guard
│   ├── redirectIfAuthenticated.js # Redirect logged-in users
│   └── uploadResume.js       # Multer config for resume uploads
│
├── utils/
│   ├── atsAnalyzer.js        # AI-powered resume scoring (Groq/Llama)
│   ├── generateToken.js      # JWT token generation
│   └── sendmail.js           # Nodemailer email utility
│
├── views/
│   ├── error.ejs             # Global error page
│   ├── auth/
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── forgot-password.ejs
│   │   └── reset-password.ejs
│   ├── recruiter/
│   │   ├── dashboard.ejs
│   │   ├── applicants.ejs
│   │   ├── edit-job.ejs
│   │   └── profile.ejs
│   ├── student/
│   │   ├── dashboard.ejs
│   │   ├── profile.ejs
│   │   └── saved-jobs.ejs
│   ├── jobs/
│   │   ├── jobs.ejs
│   │   └── postJob.ejs
│   └── applications/
│       └── applications.ejs
│
├── public/
│   ├── css/                  # Stylesheets (auth, base, dashboard, etc.)
│   ├── js/                   # Client-side scripts (jobs, dashboard)
│   └── images/               # Static assets
│
└── uploads/                  # Uploaded resumes (gitignored)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster
- **Groq API Key** — free tier at [console.groq.com](https://console.groq.com)
- **Gmail App Password** — for email notifications ([guide](https://support.google.com/accounts/answer/185833))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mr-Rohit2006/HireFlow.git
cd HireFlow

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Then edit .env with your actual values (see below)

# 4. Start the development server
npx nodemon app.js

# Server starts at http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hireflow

# Email (Gmail SMTP)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_gmail_app_password

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=3000

# AI - Groq API
GROQ_API_KEY=your_groq_api_key_here
```

| Variable       | Description                                              |
|----------------|----------------------------------------------------------|
| `MONGO_URI`    | MongoDB connection string (local or Atlas)               |
| `MAIL_USER`    | Gmail address for sending automated emails               |
| `MAIL_PASS`    | Gmail App Password (not your regular password)           |
| `JWT_SECRET`   | Secret key for signing JWT tokens                        |
| `PORT`         | Server port (defaults to `3000`)                         |
| `GROQ_API_KEY` | API key from Groq for AI-powered resume analysis         |

---

## 💡 Usage

### Register & Login

1. Navigate to `http://localhost:3000`
2. Register as a **Student** or **Recruiter**
3. Login with your credentials

### As a Recruiter

1. **Post a Job** — Fill in job details (title, company, location, salary, description)
2. **Manage Jobs** — Edit or delete your posted jobs from the dashboard
3. **Review Applicants** — Click on a job to view all applicants with their ATS scores
4. **Update Status** — Shortlist or reject candidates (automated emails are sent)
5. **Download Resumes** — Access applicant resumes directly

### As a Student

1. **Browse Jobs** — Explore all available job listings
2. **Check ATS Score** — Upload your resume to preview your match score before applying
3. **Apply** — Submit your application with a resume
4. **Track Applications** — Monitor application statuses (Pending / Shortlisted / Rejected)
5. **Save Jobs** — Bookmark interesting jobs for later
6. **Edit Profile** — Update your skills, bio, phone, and resume

---

## 🛣 API & Routes Overview

### Authentication
| Method | Route                          | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/login`                       | Login page               |
| POST   | `/login`                       | Authenticate user        |
| GET    | `/register`                    | Registration page        |
| POST   | `/register`                    | Create new account       |
| GET    | `/logout`                      | Logout & clear cookie    |
| GET    | `/forgot-password`             | Forgot password page     |
| POST   | `/forgot-password`             | Send reset email         |
| GET    | `/reset-password/:token`       | Reset password page      |
| POST   | `/reset-password`              | Update password          |

### Jobs
| Method | Route                          | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/jobs`                        | Browse all jobs          |
| GET    | `/post-job`                    | Post job form            |
| POST   | `/post-job`                    | Create new job listing   |

### Student
| Method | Route                          | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/dashboard`                   | Student dashboard        |
| GET    | `/profile`                     | View profile             |
| POST   | `/profile`                     | Update profile           |
| POST   | `/save-job/:jobId`             | Save/unsave a job        |
| GET    | `/saved-jobs`                  | View saved jobs          |

### Applications
| Method | Route                          | Description              |
|--------|--------------------------------|--------------------------|
| POST   | `/apply/:jobId`                | Apply to a job           |
| POST   | `/check-score/:jobId`          | Check ATS score only     |
| GET    | `/my-applications`             | View my applications     |

### Recruiter
| Method | Route                          | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/recruiter/dashboard`         | Recruiter dashboard      |
| GET    | `/recruiter/job/:jobId/applicants` | View applicants      |
| POST   | `/recruiter/update-status`     | Update applicant status  |
| GET    | `/recruiter/edit-job/:jobId`   | Edit job form            |
| POST   | `/recruiter/edit-job/:jobId`   | Save job edits           |
| POST   | `/recruiter/delete-job/:jobId` | Delete a job             |
| GET    | `/recruiter/profile`           | Recruiter profile        |
| POST   | `/recruiter/profile`           | Update recruiter profile |

---

## 🤖 AI-Powered ATS Scoring

HireFlow uses the **Groq API** with the **Llama 3.3 70B Versatile** model to provide intelligent resume-to-job matching:

### How It Works

1. **PDF Parsing** — Resumes (PDF) are parsed using `pdf-parse` to extract text content
2. **Prompt Engineering** — A structured prompt compares the resume against the job description using weighted criteria:
   - **Skills & Technologies** — 40%
   - **Relevant Experience** — 30%
   - **Education & Qualifications** — 15%
   - **Job Title & Role Alignment** — 15%
3. **AI Analysis** — The Groq API processes the prompt and returns a match percentage
4. **Score Display** — The score (0–100%) is displayed to both students and recruiters

### Two Modes

- **Pre-Apply Check** — Students can upload a resume and preview their score *without* committing to an application. The file is processed in memory (no persistence).
- **On-Apply Analysis** — When a student formally applies, their resume is scored automatically and the result is stored alongside the application.

---

## 📧 Email Notifications

Automated emails are sent via **Nodemailer** (Gmail SMTP) at key stages:

| Trigger                     | Recipient  | Subject                                    |
|-----------------------------|------------|--------------------------------------------|
| Student applies to a job    | Student    | Application Submitted Successfully         |
| Student applies to a job    | Recruiter  | New Job Application Received               |
| Recruiter shortlists        | Student    | Congratulations! You are shortlisted 🎉    |
| Recruiter rejects           | Student    | Application Update from HireFlow           |
| Password reset request      | User       | HireFlow – Password Reset Request          |

---

## 🖼 Screenshots

> *Run the application locally to see the full UI with glassmorphic design, responsive layouts, and interactive dashboards.*

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**. See `package.json` for details.

---

<p align="center">
  Built with ❤️ by <strong>Rohit</strong>
</p>
