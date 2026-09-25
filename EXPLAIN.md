# ðŸŽ“ EduSure â€” Project Architecture & Workflow Documentation

Welcome to **EduSure** (IPS Academy Academic Portal) â€” an end-to-end peer-to-peer academic resource sharing, examination preparation, and campus community platform.

This document provides a single-source-of-truth breakdown of the entire platform: architecture, end-to-end workflows, and an exhaustive guide to every single page in the system.

---

## ðŸ“‘ Table of Contents
1. [Platform Overview & Tech Stack](#1-platform-overview--tech-stack)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Page Directory & Count Summary (35 Pages)](#3-page-directory--count-summary)
4. [Landing Page Structure](#4-landing-page-structure)
5. [End-to-End System Workflows](#5-end-to-end-system-workflows)
   - [A. Authentication & Security Flow](#a-authentication--security-flow)
   - [B. Student Onboarding Workflow](#b-student-onboarding-workflow)
   - [C. Material Upload & Admin Moderation Workflow](#c-material-upload--admin-moderation-workflow)
   - [D. Search, Filter & Download Workflow](#d-search-filter--download-workflow)
   - [E. Community Forum & Discussions Workflow](#e-community-forum--discussions-workflow)
   - [F. Events & Academic Calendar Workflow](#f-events--academic-calendar-workflow)
   - [G. Coins, Gamification & Rewards Redemption](#g-coins-gamification--rewards-redemption)
   - [H. Helpdesk & Support Ticketing Workflow](#h-helpdesk--support-ticketing-workflow)
6. [Detailed Page-by-Page Breakdown](#6-detailed-page-by-page-breakdown)
   - [Public & Authentication Pages (8 Pages)](#public--authentication-pages)
   - [Onboarding Page (1 Page)](#onboarding-page)
   - [Student Portal Pages (12 Pages)](#student-portal-pages)
   - [Admin Portal Pages (14 Pages)](#admin-portal-pages)
7. [Security & Access Control Matrix](#7-security--access-control-matrix)

---

## 1. Platform Overview & Tech Stack

EduSure empowers engineering and college students to upload handwritten notes, access semester-wise Previous Year Questions (PYQs), prepare for campus placements, participate in peer Q&A, and earn coins for their academic contributions.

### ðŸ’» Technology Stack:
- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling & Design System**: [Tailwind CSS](https://tailwindcss.com/) with full responsive breakpoints, dark/light mode toggle via `ThemeContext`
- **Animations & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/) & [Lenis](https://lenis.darkroom.engineering/) smooth scrolling
- **Icons & Visuals**: [Lucide React](https://lucide.dev/)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/)
- **State & Query Cache**: [TanStack Query (React Query)](https://tanstack.com/query)
- **Backend API**: [Express.js](https://expressjs.com/) on Node.js
- **Database & Identity**: [Supabase PostgreSQL](https://supabase.com/) with Row-Level Security (RLS) & real-time subscriptions
- **File Storage**: Supabase Storage Buckets (PDF notes, PYQ sheets, preview thumbnails)
- **Email Infrastructure**: Nodemailer SMTP with customized institutional templates and OTP dispatching

---

## 2. High-Level Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          CLIENT (React 19 + Vite)                      â”‚
â”‚                                                                        â”‚
â”‚  Landing Page  â”‚  Auth & Onboarding  â”‚  Student Portal â”‚  Admin Portal â”‚
â”‚  (6 Chapters)  â”‚  (OTP / Google)     â”‚  (12 Pages)     â”‚  (14 Pages)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                    â”‚
                â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                â–¼                                       â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚      EXPRESS API SERVER      â”‚        â”‚        SUPABASE PLATFORM       â”‚
â”‚  â€¢ Nodemailer SMTP (OTP)     â”‚        â”‚  â€¢ PostgreSQL Database         â”‚
â”‚  â€¢ Email policy toggle       â”‚        â”‚  â€¢ GoTrue Auth & Google OAuth  â”‚
â”‚  â€¢ Search & filtering proxy  â”‚        â”‚  â€¢ Cloud Storage (PDF Buckets) â”‚
â”‚  â€¢ Rate limiting & security  â”‚        â”‚  â€¢ Row-Level Security (RLS)    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 3. Page Directory & Count Summary

The application contains **35 distinct pages / views** organized into 4 functional tiers:

| Tier | Category | Number of Pages | Key Route Examples |
|---|---|---|---|
| **Tier 1** | Public Landing Page | **1 Page** (6 Sections) | `/` |
| **Tier 2** | Authentication & Recovery | **7 Pages** | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| **Tier 3** | Onboarding Flow | **1 Page** | `/onboarding` |
| **Tier 4** | Student Portal (Protected) | **12 Pages** | `/dashboard`, `/pyqs`, `/placement-materials`, `/community`, `/upload` |
| **Tier 5** | Admin Portal (Admin Guarded) | **14 Pages** | `/admin/dashboard`, `/admin/approvals`, `/admin/users`, `/admin/pyqs` |
| **Total** | | **35 Pages** (+ 404 Fallback) | |

---

## 4. Landing Page Structure

The landing page (`/`) is built as a single-page interactive portal featuring 6 distinct chapters with smooth Lenis scrolling, parallax hero effects, and floating navigation:

1. **Chapter 1: Hero Section (`#home`)**
   - Welcomes students with bold headline and dynamic subtitle.
   - Dual primary call-to-actions: `Explore Resources â†’` (routes to PYQs) and `Upload Notes â†’` (routes to Upload).
   - Live metrics summary cards: 131+ Students, 49 Verified Resources, 580 Coins Earned, 98% Pass Rate.
2. **Chapter 2: Features Section (`#features`)**
   - Highlighting the core pillars: Verified PYQs, Placement Roadmaps, Peer Community, and Coins Reward Engine.
3. **Chapter 3: How It Works Section (`#how-it-works`)**
   - 3-step student journey: (1) Sign Up & Verify, (2) Share Notes or Learn, (3) Earn Coins & Level Up.
4. **Chapter 4: Events Section (`#events`)**
   - Live campus calendar feed featuring upcoming hackathons, tech talks, exam schedules, and workshops.
5. **Chapter 5: Statistics Section (`#statistics`)**
   - Interactive milestone counters demonstrating platform adoption, total downloads, and active study hours.
6. **Chapter 6: Final CTA Section (`#join`)**
   - Interactive sign-up banner with role-aware redirection (`Join Now` vs `Go to Dashboard`).

---

## 5. End-to-End System Workflows

### A. Authentication & Security Flow
```
User Enters Email
       â”‚
       â–¼
Is Institutional? (@ipsacademy.org) OR Admin Allowed Non-College?
       â”‚
   â”œâ”€â”€ YES â”€â”€â–º Send 6-Digit OTP via Nodemailer SMTP
   â”‚              â”‚
   â”‚              â–¼
   â”‚           User Verifies OTP â”€â”€â–º Token Created in Supabase Auth
   â”‚
   â””â”€â”€ Google OAuth â”€â”€â–º Redirects via /auth/callback â”€â”€â–º Checks User Record
```
- **Login Options**: Email + Password, 6-digit Email OTP, or 1-Click Google OAuth.
- **Admin Bypass**: If the authenticated user has `role === 'admin'` or is a system root admin, they immediately route to `/admin/dashboard`.
- **Student Redirection**: New students or students with incomplete onboarding are routed to `/onboarding`.

### B. Student Onboarding Workflow
- **Mandatory First-Time Setup**: Once a student registers, they cannot browse protected student pages without completing onboarding.
- **Step 1 â€” Basic Profile & Credentials**:
  - Full Name, locked Phone & locked Enrollment number (preventing duplicates).
  - For Google OAuth users: automatic prompt to create and confirm a password.
- **Step 2 â€” Academic Preferences**:
  - Select Engineering Branch (CSE, IT, AIML, Mechanical, Civil, etc.), Current Year (1st, 2nd, 3rd, 4th), and favorite subjects.
- **Step 3 â€” Welcome Reward**:
  - Sets `onboarding_completed: true` in database, awards 25 bonus coins, and navigates to `/dashboard`.
- **Admin Exemption**: Admin users never see the onboarding screen; any attempt to visit `/onboarding` automatically redirects to `/admin/dashboard`.

### C. Material Upload & Admin Moderation Workflow
```
[Student /upload]
Select File (PDF) â”€â”€â–º Fill Details (Branch, Subject, Exam Type) â”€â”€â–º Upload to Supabase Storage
                                                                           â”‚
                                                                           â–¼
                                                                  Status: "pending"
                                                                           â”‚
                                  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                                  â–¼                                                                   â–¼
                         [Admin Approves]                                                    [Admin Rejects]
              Status â”€â”€â–º "approved"                                               Status â”€â”€â–º "rejected"
              Material visible in /pyqs & /placement-materials                    Notification sent with reason
              Coins: +4 on approval (1 on upload = 5 total)                              No coins rewarded
              Transaction logged in database
```

### D. Search, Filter & Download Workflow
- **Instant Search**: Debounced search bar querying titles, subjects, branch, and author names.
- **Category Quick Pills**: One-click filters (e.g. All Subjects, CS Core, Mathematics, Exam Types).
- **Dedicated `FilterPopup`**: Reusable slide-in drawer allowing multi-select by:
  - Subject chip selection
  - Exam type (Mid-term, End-term, Supplementary)
  - Semester / Year
  - Sorting (Newest First, Most Downloaded, Highest Rated)
- **In-Browser Preview**: Floating `MaterialPreviewModal` with secure Supabase storage signed URL.
- **1-Click Download**: Increments download count metric and saves file locally.

### E. Community Forum & Discussions Workflow
- **Posts**: Students and admins post academic doubts, campus news, internship questions, and event alerts.
- **Official Admin Badges**: Posts created by admins or committee leads display a verified badge.
- **Engagement**: Upvoting, threaded commenting, and topic tags (`#exam_prep`, `#dsa`, `#placement`, `#notice`).

### F. Events & Academic Calendar Workflow
- **Calendar Grid (`/calendar`)**: Month, week, and list view of upcoming college deadlines, submission dates, and events.
- **Admin Management (`/admin/events`)**: Admins publish campus workshops, guest lectures, hackathons, and registration links.

### G. Coins, Gamification & Rewards Redemption
- **Coin Earning**:
  - Sign-up & Onboarding: +25 coins
  - Material Upload & Approval: +5 coins total (+1 on upload submission, +4 on admin approval)
  - Peer Upvote milestones: +5 coins
- **Reward Catalog (`/rewards`)**: Students redeem accrued coins for college merchandise, canteen coupons, mock interview vouchers, and premium certificates.
- **Transaction Ledger**: Tracked under `/admin/transactions` with full debit/credit traceability.

### H. Helpdesk & Support Ticketing Workflow
- Students open tickets at `/support-center` regarding broken files, copyright claims, or profile updates.
- Admins triage tickets at `/admin/tickets` (Status: Open, In Progress, Resolved) and send direct responses.

---

## 6. Detailed Page-by-Page Breakdown

### Public & Authentication Pages

#### 1. Landing Page (`/`)
- **File**: `client/src/pages/LandingPage.jsx`
- **Purpose**: Showcase the platform, feature highlights, live statistics, dynamic chapter sidebar navigation, and calls to action.
- **Access**: Public.

#### 2. Login (`/login`)
- **File**: `client/src/pages/Login.jsx`
- **Purpose**: Multi-modal login via Password, Email OTP, or Google OAuth. Routes admins to `/admin/dashboard` and students to `/dashboard`.
- **Access**: Public / Guest.

#### 3. Register (`/register`)
- **File**: `client/src/pages/Register.jsx`
- **Purpose**: New user account creation. Enforces institutional domain rules, dispatches verification OTP via Nodemailer SMTP, and initializes profile.
- **Access**: Public / Guest.

#### 4. Forgot Password (`/forgot-password`)
- **File**: `client/src/pages/ForgotPassword.jsx`
- **Purpose**: Request a password recovery email or verification OTP code.
- **Access**: Public.

#### 5. Reset Password (`/reset-password`)
- **File**: `client/src/pages/ResetPassword.jsx`
- **Purpose**: Set a new password using token exchange from an email recovery link.
- **Access**: Public with valid auth token.

#### 6. Reset Password via OTP (`/reset-password-otp`)
- **File**: `client/src/pages/ResetPasswordOTP.jsx`
- **Purpose**: Set a new password after verifying a 6-digit email OTP.
- **Access**: Public.

#### 7. Email Verification (`/email-verification`)
- **File**: `client/src/pages/EmailVerification.jsx`
- **Purpose**: Intermediate screen prompting users to confirm their email address.
- **Access**: Public.

#### 8. Auth Callback (`/auth/callback`)
- **File**: `client/src/pages/AuthCallback.jsx`
- **Purpose**: Headless OAuth listener exchanging tokens from Google/Supabase authentication and routing users based on role and onboarding status.
- **Access**: Public.

---

### Onboarding Page

#### 9. Student Onboarding Wizard (`/onboarding`)
- **File**: `client/src/pages/Onboarding.jsx`
- **Purpose**: Guided 3-step setup for students. Sets password for Google accounts, collects branch, year, subjects, bio, and grants initial welcome coins.
- **Access**: Authenticated students only (admins are automatically bypassed).

---

### Student Portal Pages (Protected by `ProtectedRoute`)

#### 10. Student Dashboard (`/dashboard`)
- **File**: `client/src/pages/Dashboard.jsx`
- **Purpose**: Central hub showing coin balance, uploaded materials count, quick download shortcuts, announcements, and recommended subjects.
- **Access**: Authenticated student.

#### 11. Previous Year Questions (`/pyqs`)
- **File**: `client/src/pages/PYQ.jsx`
- **Purpose**: Search, filter, preview, and download semester exam question papers organized by branch, subject, and examination year.
- **Access**: Authenticated student / admin.

#### 12. Placement Materials (`/placement-materials`)
- **File**: `client/src/pages/PlacementMaterials.jsx`
- **Purpose**: Curated preparation vault for campus placements: DSA cheat-sheets, company-specific interview questions, HR guides, and aptitude banks.
- **Access**: Authenticated student / admin.

#### 13. Community Discussion Forum (`/community`)
- **File**: `client/src/pages/CommunityPost.jsx`
- **Purpose**: Peer discussion forum for Q&A, study circles, project collaboration, and viewing verified admin notices.
- **Access**: Authenticated student / admin.

#### 14. My Materials (`/my-materials`)
- **File**: `client/src/pages/MyMaterials.jsx`
- **Purpose**: Personal repository where students monitor the approval status (Pending / Approved / Rejected) and download metrics of their uploaded notes.
- **Access**: Authenticated student.

#### 15. Academic Calendar (`/calendar`)
- **File**: `client/src/pages/Calendar.jsx`
- **Purpose**: Interactive calendar view showing mid-term exams, end-term exams, assignment deadlines, and campus events.
- **Access**: Authenticated student / admin.

#### 16. Rewards & Badges (`/rewards`)
- **File**: `client/src/pages/Rewards.jsx`
- **Purpose**: Gamification store to redeem earned coins for physical merchandise, vouchers, and unlock achievement badges.
- **Access**: Authenticated student.

#### 17. Upload Resource (`/upload`)
- **File**: `client/src/pages/Upload.jsx`
- **Purpose**: Multi-field form to submit notes, assignment solutions, or PYQs with PDF upload directly to Supabase storage.
- **Access**: Authenticated student.

#### 18. Student Profile (`/profile`)
- **File**: `client/src/pages/Profile.jsx`
- **Purpose**: View and edit personal profile, contact info, bio, academic branch, enrolled year, and earned achievements.
- **Access**: Authenticated student.

#### 19. Account Settings (`/settings`)
- **File**: `client/src/pages/Settings.jsx`
- **Purpose**: Preferences management: dark/light theme toggle, password changes, and notification preferences.
- **Access**: Authenticated student.

#### 20. Help & Documentation (`/help`)
- **File**: `client/src/pages/Help.jsx`
- **Purpose**: Platform guidelines, FAQ, community rules, and guidelines on how to format and upload study notes.
- **Access**: Authenticated student.

#### 21. Support Helpdesk (`/support-center`)
- **File**: `client/src/pages/SupportHelp.jsx`
- **Purpose**: Raise tickets to reach college administrators regarding copyright issues, account recovery, or feedback.
- **Access**: Authenticated student.

---

### Admin Portal Pages (Protected by `AdminGuard`)

#### 22. Admin Dashboard (`/admin/dashboard`)
- **File**: `client/src/pages/admin/AdminDashboard.jsx`
- **Purpose**: Real-time management cockpit showing total registered students, pending review counts, storage usage, and system alerts.
- **Access**: Role: `admin`.

#### 23. Material Moderation & Approvals (`/admin/approvals`)
- **File**: `client/src/pages/admin/AdminApprovals.jsx`
- **Purpose**: Queue of pending student uploads. Admins preview PDFs and choose to Approve (credits +4 coins to uploader; 1 was credited on upload) or Reject (with feedback).
- **Access**: Role: `admin`.

#### 24. Materials Repository Management (`/admin/materials`)
- **File**: `client/src/pages/admin/AdminMaterials.jsx`
- **Purpose**: Master table of all approved study materials across all semesters. Edit titles, update tags, reassign categories, or delete files.
- **Access**: Role: `admin`.

#### 25. PYQ Dedicated Management (`/admin/pyqs`)
- **File**: `client/src/pages/admin/AdminPYQs.jsx`
- **Purpose**: Specialized manager for question papers with filters by year, exam cycle (Mid-term / End-term), and syllabus versions.
- **Access**: Role: `admin`.

#### 26. Rewards & Redemption Manager (`/admin/rewards`)
- **File**: `client/src/pages/admin/AdminRewards.jsx`
- **Purpose**: Manage the reward catalog, add new gift cards or merchandise, view student redemptions, and mark items as fulfilled.
- **Access**: Role: `admin`.

#### 27. User & Role Management (`/admin/users`)
- **File**: `client/src/pages/admin/AdminUsers.jsx`
- **Purpose**: Directory of all student and faculty accounts. Modify roles (`student` â†” `admin`), view activity, or suspend accounts.
- **Access**: Role: `admin`.

#### 28. Coin Transactions Ledger (`/admin/transactions`)
- **File**: `client/src/pages/admin/AdminTransactions.jsx`
- **Purpose**: Financial and gamification ledger recording every coin credit, debit, bonus, and redemption across the entire platform.
- **Access**: Role: `admin`.

#### 29. Content Moderation Reports (`/admin/reports`)
- **File**: `client/src/pages/admin/AdminReports.jsx`
- **Purpose**: Review user-flagged forum posts, copyrighted file reports, and inappropriate comments with 1-click takedown tools.
- **Access**: Role: `admin`.

#### 30. Campus Events Manager (`/admin/events`)
- **File**: `client/src/pages/admin/AdminEvents.jsx`
- **Purpose**: Create, edit, and publish campus workshops, webinars, hackathons, and exam timetables displayed on the public landing page and student calendar.
- **Access**: Role: `admin`.

#### 31. Official Committee Announcements (`/admin/committee-posts`)
- **File**: `client/src/pages/admin/AdminCommitteePosts.jsx`
- **Purpose**: Publish verified notices, department circulars, and announcements pinned to the top of the community feed.
- **Access**: Role: `admin`.

#### 32. Support Tickets Helpdesk (`/admin/tickets`)
- **File**: `client/src/pages/admin/AdminTickets.jsx`
- **Purpose**: Triage, respond to, and resolve helpdesk tickets submitted by students from the Support Center.
- **Access**: Role: `admin`.

#### 33. Analytics & Growth Insights (`/admin/analytics`)
- **File**: `client/src/pages/admin/AdminAnalytics.jsx`
- **Purpose**: Visual graphs (via Recharts) displaying material download curves, daily active users, top contributors, and high-demand subjects.
- **Access**: Role: `admin`.

#### 34. Bulk Email Broadcast System (`/admin/bulk-email`)
- **File**: `client/src/pages/admin/AdminBulkEmail.jsx`
- **Purpose**: Send mass notifications and department newsletters via Nodemailer SMTP with audience filtering (e.g. All Students, 3rd Year Only, Admins Only).
- **Access**: Role: `admin`.

#### 35. Authentication & Domain Settings (`/admin/auth-settings`)
- **File**: `client/src/pages/admin/AdminAuthSettings.jsx`
- **Purpose**: 1-click toggle to permit or restrict registrations from personal emails (Gmail) versus strict college institutional emails (`.ies@ipsacademy.org`).
- **Access**: Role: `admin`.

---

## 7. Security & Access Control Matrix

| Route Pattern | Guard Component | Authentication Required | Role Required | Onboarding Required |
|---|---|---|---|---|
| `/` | *None* | No | Any / Guest | No |
| `/login`, `/register`, `/auth/*` | *None* | No | Any / Guest | No |
| `/onboarding` | `ProtectedRoute` | Yes | Student Only (Admins Auto-Bypassed) | In Progress |
| `/dashboard`, `/pyqs`, `/upload`, etc. | `ProtectedRoute` | Yes | Student or Admin | Yes (For Students) |
| `/admin/*` | `AdminGuard` | Yes | Admin Only (`role: 'admin'`) | Bypassed |

---

## 8. Summary Checklist

- **Total Routes / Pages**: 35 Pages + 404 Fallback
- **Public & Auth Pages**: 8 Pages
- **Onboarding Wizard**: 1 Page
- **Student Academic Suite**: 12 Pages
- **Admin Management Suite**: 14 Pages
- **Core Database Entities**: Users, Materials, PYQs, Forum Posts, Comments, Events, Tickets, Rewards, Transactions, Auth Policy.

