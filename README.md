# 🩸 BloodBridge — Blood Donation & Request Platform

BloodBridge is a full-stack web application designed to connect blood donors with people who need blood. The platform allows users to create blood requests, discover compatible blood donation opportunities, respond to requests, manage donor responses, and track their donation eligibility.

## 🌐 Live Application

🚀 **Live Website:** https://bloodbridge-yash.netlify.app/

🔗 **Backend API:** https://bloodbridge-938f.onrender.com/

💻 **GitHub Repository:** https://github.com/YashDeshmukh495/BloodBridge

---

## ✨ Features

### 👤 User Authentication
- User registration and login
- JWT-based authentication
- Secure password hashing
- Protected routes
- User profile management

### 🩸 Blood Requests
- Create blood requests
- Specify patient name, blood group, hospital, city, PIN code and required units
- Set request urgency
- View personal blood requests
- Delete requests
- Track donor responses

### 🔍 Smart Donor Matching
- Blood-group compatibility checking
- City-based donor/request matching
- Donation eligibility verification
- 60-day donation eligibility rule
- Only compatible and eligible requests are shown to donors

### 🤝 Donor Response System
- Donors can respond to compatible blood requests
- Request owners can view donor responses
- Request owners can accept or reject donors
- Accepted donors proceed through the donor eligibility process
- Donors can track their donation responses and status

### 🟢 Donor Availability
- Users can mark themselves as available/unavailable for donation
- Availability status is used to control donor participation

### 👤 Profile
- View personal information
- Blood group
- City and PIN code
- Donation/request statistics
- Donation history information

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- JavaScript
- Vite
- CSS

### Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcryptjs

### Database
- MongoDB
- Mongoose

### Deployment
- Netlify — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## 🏗️ Project Architecture

```text
User
  │
  ▼
React Frontend
(Netlify)
  │
  │ REST API
  ▼
Node.js + Express Backend
(Render)
  │
  ▼
MongoDB Atlas

## Blood Donation Flow



User F
   │
   ▼
Create Blood Request
   │
   ▼
Compatible Request
   │
   ▼
User G
   │
   ▼
Respond / Donate
   │
   ▼
User F Receives Donor Response
   │
   ├── Accept
   │     │
   │     ▼
   │   Donor Eligibility
   │
   └── Reject
