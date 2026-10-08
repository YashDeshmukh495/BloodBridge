# BloodBridge Repository Audit Report

**Date:** October 8, 2026  
**Auditor:** Senior MERN Developer & Code Reviewer  
**Live Frontend:** https://bloodbridge-yash.netlify.app/  
**Live Backend:** https://bloodbridge-938f.onrender.com/  

---

> [!IMPORTANT]
> **AUDIT-ONLY PHASE NOTICE:**  
> This audit report reflects the exact current state of the BloodBridge codebase. No application source code files have been modified, deleted, moved, or refactored during this audit phase. Source code preservation has been strictly maintained.

---

## 1. CURRENT FOLDER STRUCTURE

The repository is structured as a mono-repo split into two main directories: `client/` for the Vite + React frontend, and `server/` for the Node.js + Express + MongoDB backend.

```
BloodBridge/
├── .git/
├── .gitignore
├── implementation_plan.md
├── implementation_plan2
├── tatus --short (Stray command output file in root)
├── client/
│   ├── .env
│   ├── .env.example
│   ├── .env.production
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── dist/
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── assets/
│       │   └── hero.jpg
│       ├── components/
│       │   ├── AlertMessage.jsx
│       │   ├── Footer.css
│       │   ├── Footer.jsx
│       │   ├── Navbar.css
│       │   └── Navbar.jsx
│       ├── context/ (Empty directory)
│       ├── hooks/ (Empty directory)
│       ├── layouts/
│       │   └── MainLayout.jsx
│       ├── pages/
│       │   ├── AvailableRequests.jsx
│       │   ├── CreateBloodRequest.css
│       │   ├── CreateBloodRequest.jsx
│       │   ├── Dashboard.css
│       │   ├── Dashboard.jsx
│       │   ├── DonorEligibility.jsx
│       │   ├── DonorResponses.jsx
│       │   ├── FindDonors.jsx
│       │   ├── Home.css
│       │   ├── Home.jsx
│       │   ├── Login.css
│       │   ├── Login.jsx
│       │   ├── MyDonorResponses.jsx
│       │   ├── MyRequests.jsx
│       │   ├── Profile.css
│       │   ├── Profile.jsx
│       │   ├── Register.css
│       │   ├── Register.jsx
│       │   └── SubmitDonorResponse.jsx
│       ├── routes/ (Empty directory)
│       ├── services/
│       │   └── api.js
│       └── utils/ (Empty directory)
└── server/
    ├── .env
    ├── package.json
    ├── package-lock.json
    ├── server.js
    ├── test_flow.js
    ├── controllers/
    │   ├── authController.js
    │   ├── bloodRequestController.js
    │   └── donorResponseController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── BloodRequest.js
    │   ├── DonorResponse.js
    │   └── User.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── bloodRequestRoutes.js
    │   └── donorResponseRoutes.js
    └── utils/
        └── bloodCompatibility.js
```

---

## 2. CURRENT ARCHITECTURE

### Frontend Architecture
- **Framework:** React 19 (`react` `^19.2.8`, `react-dom` `^19.2.8`) managed by Vite 8 (`vite` `^8.2.0`).
- **Routing:** Single Page Application (SPA) routing via `react-router-dom` `^7.18.2` defined in `client/src/App.jsx`.
- **Components & Layouts:** 
  - Shared layout component `MainLayout.jsx` in `client/src/layouts/`.
  - Global navigation `Navbar.jsx`, footer `Footer.jsx`, and notification banner `AlertMessage.jsx` in `client/src/components/`.
  - 12 page components in `client/src/pages/`.
- **State Handling:** React local component state (`useState`, `useEffect`). Global context system is **not implemented** (directory `client/src/context/` is empty). User data and JWT token persist in browser `localStorage`.
- **API Communication:** Centralized fetch helper `apiFetch` in `client/src/services/api.js` (uses `VITE_API_URL` environment variable). However, multiple page components bypass `apiFetch` and call hardcoded production backend endpoints using standard browser `fetch`.

### Backend Architecture
- **Runtime & Framework:** Node.js CommonJS module environment running Express 5 (`express` `^5.2.1`).
- **Server Entry Point:** `server/server.js` sets up middleware (`cors`, `express.json`), connects to MongoDB via Mongoose 9 (`mongoose` `^9.9.3`), and mounts Express routers.
- **MVC Pattern:** Standard Express structure with explicit separation:
  - `routes/`: Define API route paths and attach middleware.
  - `controllers/`: Handle business logic, input validation, DB calls, and HTTP responses.
  - `models/`: Define Mongoose database schemas.
  - `middleware/`: Bearer token JWT authentication in `authMiddleware.js`.
  - `utils/`: Red cell blood group compatibility mapping in `bloodCompatibility.js`.

### Database Architecture
- **Database:** MongoDB hosted on MongoDB Atlas Cluster.
- **ODM:** Mongoose 9 (`mongoose` `^9.9.3`).
- **Collections & Models:**
  - `users`: User profile, credentials, location, donation counts, availability.
  - `bloodrequests`: Blood donation request details, patient info, status, owner reference.
  - `donorresponses`: Donor responses linked to a blood request and donor user, tracking health & eligibility status.

---

## 3. AUTHENTICATION FLOW

### Registration (`server/controllers/authController.js:L65`)
1. **Input Payload:** `name`, `email`, `password`, `confirmPassword`, `mobile`, `bloodGroup`, `dateOfBirth`, `weight`, `hasDonatedBefore`, `lastDonationDate`, `city`, `pinCode`.
2. **Backend Validation:**
   - Checks presence of all required fields (`authController.js:L88-L106`).
   - Ensures `password === confirmPassword` (`L113`).
   - Validates 10-digit mobile number format matching regex `/^[6-9]\d{9}$/` (`L125`).
   - Validates 6-digit Indian PIN code regex `/^\d{6}$/` (`L137`).
   - Calculates age from `dateOfBirth`; enforces age $\ge 18$ years (`L170`).
   - Enforces weight $\ge 60$ kg (`L187`).
   - If `hasDonatedBefore === true`: verifies `lastDonationDate` is provided, not in the future, and enforces a 60-day minimum interval since last donation (`L212-L264`).
   - Checks uniqueness of `email` (`L276`) and `mobile` (`L295`). Returns `409 Conflict` if duplicate.
3. **Password Hashing:** Hashes password using `bcryptjs` (`bcrypt.hash(password, 10)`) (`L313`).
4. **Creation & Default Values:** Saves user record. Sets `currentCity = city` and `currentPinCode = pinCode` initially (`L360-L363`), `availableToDonate = false`, `donationsCount = 0`, `bloodReceivedCount = 0`.
5. **Response:** Returns `201 Created` with sanitized user object (excluding password).

### Login (`server/controllers/authController.js:L447`)
1. **Input Payload:** `email`, `password`.
2. **User Lookup:** Queries `User.findOne({ email: email.toLowerCase().trim() })` (`L473`). Returns `401 Unauthorized` if not found.
3. **Password Verification:** Compares plain password with stored hash using `bcrypt.compare(password, user.password)` (`L491`).
4. **JWT Generation:** Creates JWT signed with `process.env.JWT_SECRET` expiring in `7d` (`L510`).
   - **JWT Payload Structure:** `{ userId: user._id }` (`L513`).
5. **Token & Storage:**
   - Server returns `{ token, user }` (`L528`).
   - Client stores `token` in `localStorage.setItem("token", token)` and user object in `localStorage.setItem("user", JSON.stringify(user))` (`client/src/pages/Login.jsx:L59-L64`).

### Token Transmission & Authentication Middleware (`server/middleware/authMiddleware.js`)
- Client attaches HTTP Header: `Authorization: Bearer <token>` (`client/src/services/api.js:L19`).
- Middleware checks presence of `Authorization` header (`authMiddleware.js:L8`), verifies prefix `Bearer ` (`L15`), extracts token (`L22`), and verifies using `jwt.verify(token, process.env.JWT_SECRET)` (`L25`).
- On success: Attaches `req.user = decoded` (containing `{ userId }`) and calls `next()` (`L31-L34`).
- On failure: Returns `401 Unauthorized` with `{ message: "Invalid or expired token" }`.

### Logout (`client/src/components/Navbar.jsx:L62`)
- Clears local storage (`localStorage.removeItem("token")`, `localStorage.removeItem("user")`).
- Resets user React state and navigates to `/login`.

### Authorization & Role Checking
- **Role System:** Not implemented. All registered users share the same role schema (`User`).
- **Resource Ownership Authorization:**
  - Deleting a blood request (`bloodRequestController.js:L471`): Checks `bloodRequest.requestedBy.toString() === req.user.userId.toString()`. Returns `403 Forbidden` if unauthorized.
  - Viewing donor responses (`donorResponseController.js:L165`): Ensures only `bloodRequest.requestedBy` can view responses. Returns `403 Forbidden`.
  - Accepting/Rejecting donor (`donorResponseController.js:L280`, `L359`): Owner check enforced.
  - Submitting eligibility (`donorResponseController.js:L429`): Ensures `response.donor.toString() === req.user.userId.toString()`.

---

## 4. MONGOOSE MODELS

### Model 1: `User` (`server/models/User.js`)
- **Collection Name:** `users`
- **Purpose:** Stores donor/recipient account profiles, contact details, donor availability status, location data, and donation history metrics.
- **Fields:**

| Field | Data Type | Required | Default | References / Validation / Enums |
|---|---|---|---|---|
| `name` | String | Yes | — | Trimmed |
| `email` | String | Yes | — | Unique, Lowercase, Trimmed |
| `password` | String | Yes | — | Hashed with bcryptjs |
| `mobile` | String | Yes | — | Unique, Trimmed |
| `bloodGroup` | String | Yes | — | Enum: `["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]` |
| `dateOfBirth` | Date | Yes | — | Age validated $\ge 18$ years in controller |
| `weight` | Number | Yes | — | `min: 1` (Validated $\ge 60$ kg in controller) |
| `hasDonatedBefore` | Boolean | Yes | `false` | Boolean flag |
| `lastDonationDate` | Date | No | `null` | Updated automatically upon completed donation |
| `city` | String | Yes | — | Registration city, Trimmed |
| `pinCode` | String | Yes | — | Registration PIN code, Trimmed |
| `currentCity` | String | No | `""` | Current active location city, Trimmed |
| `currentPinCode` | String | No | `""` | Current active location PIN code, Trimmed |
| `availableToDonate` | Boolean | No | `false` | Toggle flag for donor visibility |
| `donationsCount` | Number | No | `0` | Incremented upon donation completion |
| `bloodReceivedCount` | Number | No | `0` | Incremented upon receiving blood |
| `createdAt` | Date | Auto | System | Timestamps enabled (`timestamps: true`) |
| `updatedAt` | Date | Auto | System | Timestamps enabled (`timestamps: true`) |

---

### Model 2: `BloodRequest` (`server/models/BloodRequest.js`)
- **Collection Name:** `bloodrequests`
- **Purpose:** Stores emergency and non-emergency blood requests created by users.
- **Fields:**

| Field | Data Type | Required | Default | References / Validation / Enums |
|---|---|---|---|---|
| `patientName` | String | Yes | — | Trimmed |
| `bloodGroup` | String | Yes | — | Trimmed (Target recipient blood group) |
| `city` | String | Yes | — | Trimmed (City where blood is needed) |
| `pinCode` | String | Yes | — | Trimmed (PIN code of request location) |
| `hospital` | String | Yes | — | Trimmed |
| `unitsRequired` | Number | Yes | — | `min: 1` (Validated $1 \le \text{units} \le 6$ in controller) |
| `urgency` | String | No | `"Medium"` | Enum: `["Low", "Medium", "High", "Emergency"]` |
| `contactNumber` | String | Yes | — | Trimmed (10-digit phone number) |
| `description` | String | No | — | Trimmed optional notes |
| `status` | String | No | `"Pending"` | Enum: `["Pending", "Accepted", "Completed", "Cancelled"]` |
| `requestedBy` | ObjectId | Yes | — | `ref: "User"` (Reference to creator User) |
| `createdAt` | Date | Auto | System | Timestamps enabled (`timestamps: true`) |
| `updatedAt` | Date | Auto | System | Timestamps enabled (`timestamps: true`) |

---

### Model 3: `DonorResponse` (`server/models/DonorResponse.js`)
- **Collection Name:** `donorresponses`
- **Purpose:** Tracks a donor's offer to fulfill a specific `BloodRequest`, including owner response status and donor eligibility checks.
- **Fields:**

| Field | Data Type | Required | Default | References / Validation / Enums |
|---|---|---|---|---|
| `bloodRequest` | ObjectId | Yes | — | `ref: "BloodRequest"` |
| `donor` | ObjectId | Yes | — | `ref: "User"` |
| `status` | String | No | `"Pending"` | Enum: `["Pending", "Accepted", "Rejected", "Completed"]` |
| `message` | String | No | `""` | Optional donor message |
| `healthConfirmed` | Boolean | No | `false` | Set by donor during eligibility submission |
| `eligibilityConfirmed` | Boolean | No | `false` | True after donor completes eligibility form |
| `isEligible` | Boolean | No | `false` | Computed by backend (checks 60-day interval) |
| `eligibilityDate` | Date | No | `null` | Timestamp when eligibility submitted |
| `donationDate` | Date | No | `null` | Timestamp when owner confirms completion |
| `createdAt` | Date | Auto | System | Timestamps enabled (`timestamps: true`) |
| `updatedAt` | Date | Auto | System | Timestamps enabled (`timestamps: true`) |

---

## 5. EVERY API ENDPOINT

Below is the exhaustive list of all 17 backend HTTP endpoints implemented in the repository codebase:

| METHOD | URL | AUTH REQUIRED? | REQUEST BODY | PARAMETERS | RESPONSE | PURPOSE | SOURCE FILE |
|---|---|---|---|---|---|---|---|
| `GET` | `/` | No | None | None | Plain text string `"BloodBridge API is running"` | Health check endpoint | `server/server.js:L36` |
| `POST` | `/api/test` | No | Any JSON object | None | `{ message, data }` | Debug test endpoint | `server/server.js:L41` |
| `POST` | `/api/auth/register` | No | `{ name, email, password, confirmPassword, mobile, bloodGroup, dateOfBirth, weight, hasDonatedBefore, lastDonationDate, city, pinCode }` | None | `{ message, user }` | Register new user account | `server/routes/authRoutes.js:L19` / `authController.js:L65` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | None | `{ message, token, user }` | User login and JWT issue | `server/routes/authRoutes.js:L24` / `authController.js:L447` |
| `PUT` | `/api/auth/update-location` | Yes | `{ city, pinCode }` | None | `{ message, user }` | Update user current location | `server/routes/authRoutes.js:L29` / `authController.js:L606` |
| `GET` | `/api/auth/profile` | Yes | None | None | `{ user }` (with `requestsCreatedCount`) | Fetch authenticated user profile | `server/routes/authRoutes.js:L38` / `authController.js:L759` |
| `PUT` | `/api/auth/availability` | Yes | `{ availableToDonate }` | None | `{ message, user }` | Toggle donor availability status | `server/routes/authRoutes.js:L47` / `authController.js:L781` |
| `GET` | `/api/auth/donors` | Yes | None | Query: `bloodGroup`, `city` | `{ message, count, donors }` | Search available compatible donors | `server/routes/authRoutes.js:L56` / `authController.js:L812` |
| `POST` | `/api/blood-requests` | Yes | `{ patientName, bloodGroup, hospital, unitsRequired, urgency, contactNumber, description }` | None | `{ message, bloodRequest }` | Create new blood request | `server/routes/bloodRequestRoutes.js:L19` / `bloodRequestController.js:L14` |
| `GET` | `/api/blood-requests` | Yes | None | None | `{ message, donationEligible, myRequests, availableRequests }` | Fetch user requests & compatible requests | `server/routes/bloodRequestRoutes.js:L42` / `bloodRequestController.js:L161` |
| `DELETE` | `/api/blood-requests/:id` | Yes | None | Path: `:id` (BloodRequest ID) | `{ message }` | Delete blood request owned by user | `server/routes/bloodRequestRoutes.js:L53` / `bloodRequestController.js:L446` |
| `POST` | `/api/blood-requests/:id/respond` | Yes | `{ message }` | Path: `:id` (BloodRequest ID) | `{ message, response }` | Donor responds to a request | `server/routes/donorResponseRoutes.js:L21` / `donorResponseController.js:L31` |
| `GET` | `/api/blood-requests/my-responses` | Yes | None | None | `{ message, count, responses }` | Fetch donor's own submitted responses | `server/routes/bloodRequestRoutes.js:L31` AND `server/routes/donorResponseRoutes.js:L32` *(Route shadow issue)* |
| `GET` | `/api/blood-requests/:id/responses` | Yes | None | Path: `:id` (BloodRequest ID) | `{ message, count, responses }` | Request owner views responses for request | `server/routes/donorResponseRoutes.js:L42` / `donorResponseController.js:L151` |
| `PUT` | `/api/blood-requests/response/:responseId/accept` | Yes | None | Path: `:responseId` (DonorResponse ID) | `{ message, response }` | Request owner accepts donor response | `server/routes/donorResponseRoutes.js:L52` / `donorResponseController.js:L252` |
| `PUT` | `/api/blood-requests/response/:responseId/reject` | Yes | None | Path: `:responseId` (DonorResponse ID) | `{ message, response }` | Request owner rejects donor response | `server/routes/donorResponseRoutes.js:L62` / `donorResponseController.js:L335` |
| `PUT` | `/api/blood-requests/response/:responseId/eligibility` | Yes | `{ healthConfirmed }` | Path: `:responseId` (DonorResponse ID) | `{ message, isEligible, response }` | Donor submits health eligibility form | `server/routes/donorResponseRoutes.js:L72` / `donorResponseController.js:L404` |
| `PUT` | `/api/blood-requests/response/:responseId/complete` | Yes | None | Path: `:responseId` (DonorResponse ID) | `{ message, donationDate, response }` | Request owner completes blood donation | `server/routes/donorResponseRoutes.js:L82` / `donorResponseController.js:L513` |

---

## 6. BLOOD REQUEST FLOW

The complete lifecycle of a blood request from creation to final donation completion is executed as follows:

```
[User F creates Blood Request]
          ↓
Frontend API Call: POST /api/blood-requests (CreateBloodRequest.jsx:L112)
          ↓
Backend Route: bloodRequestRoutes.js:L19 -> bloodRequestController.js:L14
          ↓
Backend Validation: 10-digit mobile regex, units between 1-6, user location fallback
          ↓
MongoDB Document Created in 'bloodrequests' collection (status: "Pending")
          ↓
Response 201 Created -> Redirect/Display on Dashboard & MyRequests
          ↓
[User G views Available Requests]
          ↓
Backend Route: GET /api/blood-requests (bloodRequestController.js:L161)
Filters requests: excludes user's own requests, requires status === "Pending",
checks donor availableToDonate === true, checks 60-day donation interval,
requires exact city match, verifies red cell blood compatibility.
          ↓
[User G responds to Request]
          ↓
POST /api/blood-requests/:id/respond (donorResponseController.js:L31)
Validates donor availableToDonate === true, 60 days passed, not own request, no duplicate response.
Creates 'donorresponses' document (status: "Pending", healthConfirmed: false, isEligible: false).
          ↓
[User F (Request Owner) views responses & accepts User G]
          ↓
GET /api/blood-requests/:id/responses -> PUT /api/blood-requests/response/:responseId/accept
Updates DonorResponse status to "Accepted".
          ↓
[User G submits Health Eligibility Form]
          ↓
PUT /api/blood-requests/response/:responseId/eligibility (donorResponseController.js:L404)
Validates healthConfirmed === true. Computes 60-day interval check from donor.lastDonationDate.
Sets eligibilityConfirmed = true, isEligible = (differenceInDays >= 60), eligibilityDate = now.
          ↓
[User F confirms Blood Donation Completed]
          ↓
PUT /api/blood-requests/response/:responseId/complete (donorResponseController.js:L513)
Validates status === "Accepted", eligibilityConfirmed === true, isEligible === true, donationDate === null.
Updates Donor User: lastDonationDate = now, $inc donationsCount +1.
Updates Request Owner User: $inc bloodReceivedCount +1.
Updates DonorResponse: status = "Completed", donationDate = now.
Updates BloodRequest: status = "Completed".
```

---

## 7. BLOOD GROUP COMPATIBILITY

### Supporting Implementation (`server/utils/bloodCompatibility.js`)
Red cell blood compatibility is implemented on the backend in `server/utils/bloodCompatibility.js`.

### Supported Blood Groups
8 standard blood groups are supported: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.

### Compatibility Matrix (`server/utils/bloodCompatibility.js:L5-L17`)
The code defines donor-to-recipient compatibility for Red Cell donations:
- `O-` $\rightarrow$ `["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]` (Universal Donor)
- `O+` $\rightarrow$ `["O+", "A+", "B+", "AB+"]`
- `A-` $\rightarrow$ `["A-", "A+", "AB-", "AB+"]`
- `A+` $\rightarrow$ `["A+", "AB+"]`
- `B-` $\rightarrow$ `["B-", "B+", "AB-", "AB+"]`
- `B+` $\rightarrow$ `["B+", "AB+"]`
- `AB-` $\rightarrow$ `["AB-", "AB+"]`
- `AB+` $\rightarrow$ `["AB+"]` (Universal Recipient)

### Evaluation Logic & Scoping
- **Comparison Function:** `canDonate(donorGroup, recipientGroup)` (`bloodCompatibility.js:L20-L32`).
- **Where Evaluated:** Backend only.
  1. In `bloodRequestController.js:L329`: Filters available blood requests shown to a donor based on `canDonate(donor.bloodGroup, request.bloodGroup)`.
  2. In `authController.js:L833`: Filters donor search results in `getAvailableDonors` using `canDonate(donor.bloodGroup, requestedBloodGroup)`.
- **Location Consideration:** City matching is performed alongside blood compatibility in `bloodRequestController.js:L303` (requires case-insensitive exact string match of current city) and `authController.js:L822` (regex match on `city` or `currentCity`).
- **Availability Consideration:** Checked separately via `user.availableToDonate === true`.
- **Frontend Compatibility:** The frontend does **not** evaluate compatibility logic directly; it displays whatever compatible requests/donors the backend filters and returns.

---

## 8. DONOR ELIGIBILITY

The codebase enforces donor eligibility through a combination of registration rules and runtime backend checks:

| Eligibility Criteria | Enforced Rule | Location | Implementation Details |
|---|---|---|---|
| **Age Rule** | Age $\ge 18$ years | Backend (`authController.js:L170`) & Frontend (`Register.jsx:L171`) | Calculated from `dateOfBirth`. Rejects registration if age $< 18$. |
| **Weight Rule** | Weight $\ge 60$ kg | Backend (`authController.js:L187`) & Frontend (`Register.jsx:L192`) | Rejects registration if weight $< 60$ kg. |
| **Donation Interval** | Minimum 60 days since `lastDonationDate` | Backend (`authController.js:L254`, `bloodRequestController.js:L224`, `donorResponseController.js:L24`, `L85`, `L462`) | Difference in days calculated via `(today - lastDonationDate) / (1000 * 60 * 60 * 24) >= 60`. Evaluated at registration, when fetching available requests, when responding to requests, and during eligibility form submission. |
| **Donor Availability** | `availableToDonate === true` | Backend (`bloodRequestController.js:L252`, `donorResponseController.js:L64`, `authController.js:L817`) & Frontend toggle in `Navbar.jsx` | If `availableToDonate` is false, user cannot view available requests or submit responses to blood requests. |
| **Health Confirmation** | `healthConfirmed === true` | Backend (`donorResponseController.js:L412`) & Frontend (`SubmitDonorResponse.jsx:L25`, `DonorEligibility.jsx:L29`) | Explicit boolean confirmation checkbox required before completing eligibility step. |
| **Gender Rules** | *Not implemented.* | — | No gender-specific donation interval or hemoglobin checks exist. |
| **Medical Conditions** | *Not implemented.* | — | No questionnaire for medical conditions, medications, or travel history. |

---

## 9. FRONTEND → BACKEND API CALLS

Every API call across all frontend components has been mapped and classified by URL resolution mechanism:

| File | Component / Function | Method | Endpoint Path | URL Source / Classification |
|---|---|---|---|---|
| `client/src/pages/Login.jsx:L42` | `handleSubmit` | `POST` | `/api/auth/login` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/Register.jsx:L290` | `handleSubmit` | `POST` | `/api/auth/register` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/Dashboard.jsx:L53` | `fetchBloodRequests` | `GET` | `/api/blood-requests` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/Dashboard.jsx:L83` | `fetchUserProfile` | `GET` | `/api/auth/profile` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/Dashboard.jsx:L113` | `handleToggleAvailability` | `PUT` | `/api/auth/availability` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/Profile.jsx:L52` | `fetchUserProfile` | `GET` | `/api/auth/profile` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/Profile.jsx:L117` | `handleUpdateLocation` | `PUT` | `/api/auth/update-location` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/components/Navbar.jsx:L37` | `handleToggleAvailability` | `PUT` | `/api/auth/availability` | Environment Variable (`apiFetch` using `import.meta.env.VITE_API_URL`) |
| `client/src/pages/AvailableRequests.jsx:L24` | `fetchAvailableRequests` | `GET` | `/api/blood-requests` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/CreateBloodRequest.jsx:L112` | `handleSubmit` | `POST` | `/api/blood-requests` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/MyRequests.jsx:L24` | `fetchMyRequests` | `GET` | `/api/blood-requests` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/MyRequests.jsx:L89` | `handleDelete` | `DELETE` | `/api/blood-requests/:id` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/FindDonors.jsx:L61` | `fetchDonors` | `GET` | `/api/auth/donors` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/DonorEligibility.jsx:L66` | `handleSubmit` | `PUT` | `/api/blood-requests/response/:responseId/eligibility` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/DonorResponses.jsx:L25` | `fetchResponses` | `GET` | `/api/blood-requests/:id/responses` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/DonorResponses.jsx:L76` | `updateDonorStatus` | `PUT` | `/api/blood-requests/response/:responseId/:action` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/DonorResponses.jsx:L141` | `completeDonation` | `PUT` | `/api/blood-requests/response/:responseId/complete` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/MyDonorResponses.jsx:L24` | `fetchMyResponses` | `GET` | `/api/blood-requests/my-responses` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |
| `client/src/pages/SubmitDonorResponse.jsx:L34` | `handleSubmit` | `POST` | `/api/blood-requests/:id/respond` | **Hardcoded production URL (`https://bloodbridge-938f.onrender.com/...`)** |

> [!WARNING]
> **CRITICAL FINDING — 11 Hardcoded Production URLs:**  
> Out of 19 API call sites in the frontend, 11 calls bypass `apiFetch` and use hardcoded string literals pointing directly to `https://bloodbridge-938f.onrender.com`. This breaks local development (`localhost`) and staging environments.

---

## 10. RESPONSIVENESS AUDIT

An inspection of the CSS structure across all pages and viewport breakpoints (320px, 360px, 375px, 390px, 414px, 768px, 820px, 1024px, 1280px+) revealed significant inconsistencies:

### Unlinked Global CSS Design System (`client/src/main.jsx:L3`)
- `client/src/index.css` contains modern CSS design system tokens (`--primary`, `--radius-md`, `--shadow-lg`), container media queries (`@media (min-width: 640px)`), responsive form utility classes, and card grids.
- **Problem:** `main.jsx` line 3 has `// import './index.css'` **commented out**. As a result, none of the responsive design tokens or global utilities in `index.css` are loaded in production.

### Page-by-Page Responsiveness Inspection

1. **`Navbar.jsx` / `Navbar.css`**
   - Implements responsive mobile drawer navigation toggle (`mobile-hamburger-btn`, `mobile-nav-drawer`).
   - Uses `desktop-only` (`display: none` under 768px) and `mobile-only` (`display: flex` over 768px). Responsive behavior functions as designed.

2. **`Home.jsx` / `Home.css`**
   - Uses media queries (`@media (max-width: 768px)`, `@media (max-width: 968px)`). Flex layouts stack vertically on mobile.
   - Minor issue: Fixed image width in hero section can cause minor horizontal scrolling on screens $\le 360$px.

3. **`Login.jsx` / `Login.css` & `Register.jsx` / `Register.css`**
   - Centered card layout with responsive padding. Input fields scale nicely using `width: 100%`.
   - On 320px screens, `Register.jsx` captcha refresh button and password toggle eye button overflow slightly due to tight inline flex gaps.

4. **`Dashboard.jsx` / `Dashboard.css` & `Profile.jsx` / `Profile.css`**
   - Uses CSS Grid with `repeat(auto-fit, minmax(220px, 1fr))` for stats and activity grids. Adjusts cleanly down to mobile widths.

5. **`AvailableRequests.jsx`, `MyRequests.jsx`, `FindDonors.jsx`, `DonorEligibility.jsx`, `DonorResponses.jsx`, `MyDonorResponses.jsx`, `SubmitDonorResponse.jsx`**
   - **Severe Issue:** These 7 pages do **not** import any CSS files. They rely entirely on inline React `style={{ ... }}` objects.
   - Fixed outer container paddings (`padding: "30px"` or `"40px"`) without mobile media query reduction cause extreme content squishing on 320px–375px mobile screens.
   - `FindDonors.jsx:L143`: Search filter form uses `display: "flex"`, `flexWrap: "wrap"`, but input containers have fixed basis `flex: "1 1 200px"`, causing buttons to stack awkwardly on mobile.
   - Action buttons in table/card footers lack `flex-wrap: wrap`, causing buttons to clip off screen on 320px devices.

---

## 11. CODE QUALITY AUDIT

### Critical & High Severity Issues

1. **Commented Out Global CSS (`client/src/main.jsx:L3`)**
   - Line 3: `// import './index.css'` disables the primary design system file.

2. **Route Collision & Shadowing (`server/routes/bloodRequestRoutes.js:L31` & `server/routes/donorResponseRoutes.js:L32`)**
   - `bloodRequestRoutes.js` defines `router.get("/my-responses", authMiddleware, getMyDonorResponses)`.
   - `donorResponseRoutes.js` also defines `router.get("/my-responses", authMiddleware, getMyDonorResponses)`.
   - In `server/server.js`:
     ```javascript
     app.use("/api/blood-requests", bloodRequestRoutes);
     app.use("/api/blood-requests", donorResponseRoutes);
     ```
   - Because both routers are mounted on `/api/blood-requests`, Express resolves `GET /api/blood-requests/my-responses` to `bloodRequestRoutes` first, rendering the route definition in `donorResponseRoutes.js` completely dead/unreachable code.

3. **Backend `dotenv` Initialization Order Bug (`server/server.js:L1-L5`)**
   - Lines 1–3 require route modules (`authRoutes`, `bloodRequestRoutes`, `donorResponseRoutes`) before `require("dotenv").config()` is invoked on Line 5.
   - If any required controller or service evaluates `process.env` properties at file load time, `process.env.JWT_SECRET` or `process.env.MONGODB_URI` will return `undefined`.

4. **Hardcoded MongoDB Database Credentials in Codebase (`server/.env:L1`)**
   - `server/.env` contains active database connection string with plaintext username and password (`mongodb://bloodbridge_user:yash495@ac-62tn8ab...`).
   - Root `.gitignore` only excludes `node_modules/`, leaving `server/.env` exposed to git tracking.

5. **11 Hardcoded API Base URLs on Frontend**
   - 11 fetch calls across 7 page components use hardcoded string `"https://bloodbridge-938f.onrender.com/api/..."` instead of `apiFetch` or `import.meta.env.VITE_API_URL`.

### Medium & Maintainability Issues

6. **Stray Command Artifact File (`tatus --short`)**
   - A 14-line text file named `tatus --short` exists in the root directory, created by a mistyped terminal command.

7. **Empty Code Directories**
   - Unused empty directories present in frontend: `client/src/context/`, `client/src/hooks/`, `client/src/routes/`, `client/src/utils/`.

8. **Inconsistent Component Layout Pattern**
   - `Dashboard.jsx` and `Profile.jsx` render `<Navbar />` and `<Footer />` manually.
   - `MainLayout.jsx` exists to wrap pages with Navbar/Footer, but is only used in placeholder structure and not utilized by any actual page component.
   - `AvailableRequests.jsx`, `MyRequests.jsx`, `FindDonors.jsx`, `DonorEligibility.jsx`, `DonorResponses.jsx`, `MyDonorResponses.jsx`, `SubmitDonorResponse.jsx` do not render Navbar or Footer at all, causing broken navigation UX.

9. **Duplicate Helper Functions**
   - 60-day donation interval calculation logic is duplicated verbatim in multiple server files (`authController.js:L41`, `bloodRequestController.js:L203`, `donorResponseController.js:L9`).

---

## 12. DEPLOYMENT AUDIT

### Live Environment Details
- **Frontend Live URL:** https://bloodbridge-yash.netlify.app/
- **Backend Live URL:** https://bloodbridge-938f.onrender.com/

### Deployment Configuration Findings
1. **Frontend Netlify Build Configuration:**
   - `client/package.json` build script: `vite build`. Output directory: `dist`.
   - `client/.env.production` contains `VITE_API_URL=https://bloodbridge-938f.onrender.com`.
   - **Deployment Flaw:** Because 11 fetch calls in page components hardcode `https://bloodbridge-938f.onrender.com`, environment variables are bypassed. Changing `VITE_API_URL` during staging builds has no effect on those 11 API endpoints.

2. **Backend Render Configuration:**
   - `server/package.json` start script: `node server.js`.
   - `server/server.js:L13`: `const PORT = process.env.PORT || 5000`. Render dynamically assigns `PORT`.
   - **CORS Configuration:** `server.js:L28` uses `app.use(cors())` with wildcard default parameters (`*`). While functional, it permits unconstrained cross-origin requests from any origin.

3. **Exposed Production Secrets:**
   - `server/.env` contains production database credentials in source control.

---

## 13. PROPOSED CLEANUP PLAN

> [!NOTE]
> The following plan prioritizes required refactoring and bug fixes for subsequent implementation phases. **None of these changes have been executed in Phase 1.**

| Priority | Problem | Why It Matters | Likely Affected Files | Recommended Solution | Risk Level |
|---|---|---|---|---|---|
| **P0** | Hardcoded production database credentials in `server/.env` & missing `.gitignore` entries | Critical security risk; database credentials exposed in git repository. | `.gitignore`, `server/.env` | Remove credentials from `server/.env`, generate placeholder `.env.example`, and add `.env` to `.gitignore`. | Low |
| **P0** | Hardcoded production API URLs (11 call sites) across frontend pages | Prevents local development, testing, and staging deployments; breaks environment isolation. | `AvailableRequests.jsx`, `CreateBloodRequest.jsx`, `MyRequests.jsx`, `FindDonors.jsx`, `DonorEligibility.jsx`, `DonorResponses.jsx`, `MyDonorResponses.jsx`, `SubmitDonorResponse.jsx` | Refactor all fetch calls to use `apiFetch` helper from `services/api.js`. | Low |
| **P0** | Commented out global CSS import in `main.jsx` | Entire global CSS design system (`index.css`) is disabled in production. | `client/src/main.jsx` | Uncomment `import './index.css'` in `main.jsx`. | Low |
| **P1** | Backend `dotenv` initialization order bug | Routes required before `dotenv.config()` cause `undefined` environment variables. | `server/server.js` | Move `require("dotenv").config()` to line 1 of `server.js` before any `require()` of routes or controllers. | Low |
| **P1** | Duplicate route shadowing for `/api/blood-requests/my-responses` | Endpoint in `donorResponseRoutes.js` is unreachable dead code. | `server/routes/bloodRequestRoutes.js`, `server/routes/donorResponseRoutes.js` | Remove redundant `/my-responses` route definition from `bloodRequestRoutes.js` and keep it solely in `donorResponseRoutes.js`. | Low |
| **P1** | Inline styles and broken responsive layout on 7 page components | Pages lack responsive breakpoints, Navbar, and Footer on mobile screens $\le 768$px. | 7 page files in `client/src/pages/` | Wrap pages in `MainLayout`, replace heavy inline styles with CSS classes utilizing `index.css` grid and breakpoint utilities. | Medium |
| **P2** | Inconsistent layout usage across pages | Fragmented UX; some pages render Navbar/Footer, others do not. | All page components in `client/src/pages/` | Standardize page structure to use `MainLayout.jsx` consistently across all routes in `App.jsx`. | Low |
| **P2** | Duplicated 60-day eligibility logic across backend controllers | Maintenance risk; code duplication. | `authController.js`, `bloodRequestController.js`, `donorResponseController.js` | Extract 60-day eligibility check into reusable utility function in `server/utils/`. | Low |
| **P3** | Stray root file `tatus --short` and empty frontend directories | Codebase clutter. | `tatus --short`, empty dirs in `client/src/` | Remove stray file and clean up empty unused directories. | Low |
| **P3** | Wildcard CORS configuration | Potential security enhancement for production CORS policy. | `server/server.js` | Restrict allowed CORS origins to `process.env.CLIENT_URL`. | Low |

---

## 14. FINAL AUDIT SUMMARY

### Critical Problems
1. Active MongoDB connection string containing username and password (`mongodb://bloodbridge_user:yash495@...`) is committed in `server/.env` and missing from root `.gitignore`.
2. 11 API fetch calls across 7 frontend pages hardcode production server URL (`https://bloodbridge-938f.onrender.com`), ignoring environment configuration.
3. Global CSS design system import (`// import './index.css'`) is commented out in `client/src/main.jsx`.

### Important Problems
1. Backend `dotenv` configuration is loaded after requiring route files in `server/server.js`.
2. Duplicate route definition for `GET /api/blood-requests/my-responses` in `bloodRequestRoutes.js` shadows `donorResponseRoutes.js`.
3. 7 out of 12 frontend pages use inline styles without Navbar, Footer, or mobile responsive breakpoints.

### Responsive Problems
1. Pages relying on inline styles (`AvailableRequests`, `MyRequests`, `FindDonors`, etc.) overflow or squish on mobile screens $\le 375$px.
2. Missing global responsive styles due to commented-out `index.css` import.

### Code Quality Problems
1. Code duplication of 60-day donation interval calculation across 3 backend controllers.
2. Stray command output file `tatus --short` present in root folder.
3. Empty unused directories (`context`, `hooks`, `routes`, `utils`) in `client/src`.

### Deployment Problems
1. Hardcoded API URLs prevent local testing against `localhost:5000`.
2. Permissive wildcard CORS policy on backend server.

---

### Confirmation
**Source code was not modified during this audit phase.**
