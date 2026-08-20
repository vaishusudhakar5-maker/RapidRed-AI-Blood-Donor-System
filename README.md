
# 🩸 RapidRed

## AI-Driven Real-Time Emergency Blood Finder & Donor Alert System

> **When every minute matters, RapidRed helps connect emergency blood requests with suitable and available donors through intelligent matching, real-time location, donor availability, eligibility and emergency prioritization.**

🚨 Emergency Response • 🤖 Intelligent Matching • 📍 Location Intelligence • 🔐 Privacy • 🏥 Healthcare Coordination

---

## 🏆 Overview

RapidRed is an intelligent emergency blood coordination platform designed to reduce the time and effort required to find suitable blood donors during critical situations.

Traditional blood-donor searches often depend on phone calls, WhatsApp groups, social media posts and manually maintained donor lists. These approaches can become slow and unreliable when every minute matters.

RapidRed transforms this process into a structured digital workflow that connects:

**Patients → Intelligent Matching → Available Donors → Donor Response → Healthcare Coordination**

---

# 🚨 Problem Statement

During emergency situations, finding a compatible and available blood donor is often a race against time.

### Existing Challenges

- ⏱️ Time-consuming donor discovery
- 🩸 Difficulty identifying compatible donors
- 📍 Lack of location-based prioritization
- 📞 Repeated manual communication
- ❌ Unavailable or ineligible donors being contacted
- 🔐 Unnecessary exposure of personal contact information
- 🏥 Limited coordination between patients, donors and healthcare facilities

### Core Problem

> **The challenge is not simply finding a blood donor. It is finding the right available donor quickly enough.**

---

# 💡 Our Solution

RapidRed introduces an intelligent donor coordination workflow.

```text
Emergency Blood Requirement
            ↓
     Create Blood Request
            ↓
       Capture Location
            ↓
    Determine Emergency Level
            ↓
    Blood Compatibility Check
            ↓
     Donor Eligibility Check
            ↓
     Donor Availability Check
            ↓
       Distance Calculation
            ↓
    Intelligent Prioritization
            ↓
         Donor Alert
          ↙       ↘
      Accept      Decline
         ↓
  Donor Coordination
         ↓
 Hospital / Admin Monitoring
````

RapidRed converts:

**Manual Search → Intelligent Emergency Coordination**

---

# ⭐ Key Innovations

## 🤖 1. Intelligent Donor Matching

RapidRed evaluates donor suitability instead of simply displaying every registered donor.

The matching engine considers:

| Factor          | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| 🩸 Blood Group  | Determines compatible donor candidates                      |
| 📍 Distance     | Prioritizes nearby donors                                   |
| 🟢 Availability | Filters currently available donors                          |
| ✅ Eligibility   | Prevents currently ineligible donors from being prioritized |
| 🚨 Urgency      | Prioritizes critical requests                               |
| 📡 Location     | Enables geographical filtering                              |

---

## 🩸 2. Blood Compatibility Engine

RapidRed uses blood-group compatibility rules to identify suitable donor candidates.

This reduces unnecessary alerts to incompatible donors and helps focus emergency requests on relevant donors.

---

## 📍 3. Location-Aware Matching

RapidRed uses geographical coordinates to calculate the approximate distance between the patient and donor.

### Emergency Search Radius

| Emergency Level | Initial Search Radius |
| --------------- | --------------------: |
| 🚨 Critical     |                  5 KM |
| 🟠 Medium       |                 10 KM |
| 🟢 Planned      |                 20 KM |

This allows the system to prioritize donors who are realistically close enough to respond.

---

## 🚨 4. Emergency Prioritization

RapidRed supports three emergency levels:

### Critical

* Smaller initial search radius
* High-priority matching
* Faster donor alert workflow

### Medium

* Moderate search radius
* Standard prioritization

### Planned

* Wider search radius
* Normal matching workflow

---

## 🔔 5. Donor Alert & Response

Once suitable donors are identified, RapidRed enables the donor response workflow.

```text
Patient Creates Request
          ↓
   Matching Engine
          ↓
   Suitable Donor
          ↓
    Emergency Alert
       ↙       ↘
   ACCEPT     DECLINE
      ↓
Donor Coordination
```

Donor responses become part of the emergency request lifecycle.

---

# 🔐 Privacy & Consent

Healthcare applications require careful handling of personal information.

RapidRed follows a privacy-conscious communication workflow.

```text
Before Donor Acceptance
          ↓
   Limited Information
          ↓
   Donor Receives Request
          ↓
      Donor Accepts
          ↓
 Consent-Based Coordination
```

The goal is to reduce unnecessary exposure of donor contact information and support communication based on donor consent and request status.

---

# 👥 User Roles

RapidRed supports different workflows for different stakeholders.

### 🩸 Donor

* View emergency requests
* Check eligibility
* Toggle availability
* Receive donor alerts
* Accept / decline requests
* Participate in donor coordination

### 🏥 Patient

* Create emergency blood requests
* Select blood group
* Select hospital
* Set urgency
* Provide location
* View request status
* Connect with suitable donor workflow

### 🏥 Hospital

* Monitor emergency requirements
* Support blood coordination
* Monitor request activity
* Provide healthcare operational visibility

### 👨‍💼 Admin

* Monitor emergency requests
* Monitor donor activity
* View system statistics
* Track request status
* Monitor matching activity
* Coordinate healthcare operations

Privileged Hospital and Admin workflows are protected using dedicated access verification.

---

# 🏗️ System Architecture

```text
                         RAPIDRED
                            │
             ┌──────────────┴──────────────┐
             │                             │
         FRONTEND                       BACKEND
             │                             │
         React.js                       FastAPI
             │                             │
          UI / UX                       REST APIs
             │                             │
             └──────────────┬──────────────┘
                            │
                     Business Logic
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
   Authentication       Matching          Requests
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                       PostgreSQL
                            │
             ┌──────────────┼──────────────┐
             │              │              │
           Users         Requests        Donors
             │              │              │
             └──────────────┼──────────────┘
                            │
                 Location Intelligence
                            │
                   Donor Coordination
```

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Framer Motion

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Uvicorn

## Database

* PostgreSQL

## Intelligent Matching

* Python-based matching logic
* Blood-group compatibility rules
* Distance-based filtering
* Emergency-priority logic
* Donor availability filtering
* Eligibility-based filtering

## Authentication & Security

* JWT-based authentication
* Password hashing
* Role-based application workflow
* Protected Admin access
* Protected Hospital access
* Consent-oriented donor communication

---

# 🔌 REST API

RapidRed provides a structured REST API.

### Authentication

```text
POST /auth/register
POST /auth/login
PUT  /auth/role/{user_id}
```

### Donor Eligibility

```text
POST /eligibility/check
GET  /eligibility/{user_id}
```

### Donor Availability

```text
GET  /availability/{user_id}
POST /availability/toggle
```

### Blood Requests

```text
POST /blood-requests/
GET  /blood-requests/active
GET  /blood-requests/patient/{patient_id}
GET  /blood-requests/{request_id}
```

### Donor Matching

```text
GET /matching/request/{request_id}
```

### Location

```text
POST /location/update
GET  /location/{user_id}
GET  /location/track/{request_id}
```

### Donor Responses

```text
POST /donor-responses/
GET  /donor-responses/request/{request_id}
GET  /donor-responses/request/{request_id}/accepted
GET  /donor-responses/request/{request_id}/patient-contact
POST /donor-responses/sync/{request_id}
```

Interactive API documentation is available through FastAPI Swagger UI.

---

# 🗄️ Database Architecture

RapidRed uses a relational healthcare-oriented data model.

```text
Users
  │
  ├── Donor Eligibility
  │
  ├── Donor Availability
  │
  ├── Location
  │
  └── Blood Requests
          │
          └── Donor Responses
```

### Core Tables

```text
users
donor_eligibility
donor_availability
blood_requests
donor_responses
```

The relational structure maintains donor, request and response relationships while allowing future expansion.

---

# ⚡ Real-Time Emergency Workflow

### Step 1 — Registration

A user creates a RapidRed account.

### Step 2 — Authentication

The user logs into the platform.

### Step 3 — Role Selection

The application supports:

* Donor
* Patient
* Hospital
* Admin

### Step 4 — Patient Creates Request

The patient provides:

* Blood group
* Hospital
* Emergency level
* Location
* Additional details

### Step 5 — Intelligent Matching

RapidRed evaluates suitable donor candidates based on compatibility, eligibility, availability, distance and urgency.

### Step 6 — Donor Response

The donor can accept or decline the request.

### Step 7 — Coordination

Accepted donor information can be used for further emergency coordination based on the application's consent workflow.

### Step 8 — Monitoring

Hospital and Admin workflows provide operational visibility.

---

# 📊 Example Matching Result

Example emergency request:

```json
{
  "request_id": 8,
  "required_blood_group": "B+",
  "urgency": "medium",
  "search_radius_km": 10,
  "total_matches": 1,
  "matches": [
    {
      "donor_id": 5,
      "blood_group": "B+",
      "distance_km": 0.4
    }
  ]
}
```

This demonstrates the system identifying a compatible available donor within the defined emergency search radius.

---

# 📈 Scalability

RapidRed follows a separated frontend, backend and database architecture, allowing the platform to scale beyond the prototype.

```text
College / Prototype
        ↓
City-Level Network
        ↓
District-Level Network
        ↓
State-Level Network
        ↓
National Emergency Blood Network
```

### Potential Expansion

RapidRed can be extended to connect:

* 🏥 Hospitals
* 🩸 Blood Banks
* 👥 Donor Communities
* 🏢 Healthcare Organizations
* 🚑 Emergency Services

---

# 🌍 Real-World Impact

RapidRed aims to reduce:

* Donor search time
* Manual communication
* Compatibility uncertainty
* Geographic search delays
* Unnecessary donor contact

while improving:

* ⚡ Emergency response
* 🩸 Donor accessibility
* 📍 Location-based coordination
* 🔐 Privacy-conscious communication
* 🏥 Healthcare coordination

---

# 🎯 SDG Alignment

## SDG 3 — Good Health and Well-Being

RapidRed aligns with **Sustainable Development Goal 3** by addressing emergency healthcare coordination and improving access to blood donors.

The platform focuses on making emergency donor discovery:

> **Faster • Smarter • More Accessible • More Coordinated**

---

# 💡 What Makes RapidRed Different?

| Challenge      | RapidRed Approach                |
| -------------- | -------------------------------- |
| Finding donors | Intelligent matching             |
| Compatibility  | Blood-group compatibility engine |
| Distance       | Location-aware filtering         |
| Availability   | Real-time donor availability     |
| Emergency      | Urgency-based prioritization     |
| Communication  | Donor response workflow          |
| Privacy        | Consent-oriented coordination    |
| Healthcare     | Hospital workflow                |
| Monitoring     | Admin dashboard                  |
| Scalability    | Modular API architecture         |

---

# 🧠 Innovation

RapidRed combines multiple components into a unified emergency workflow:

```text
Blood Compatibility
        +
Donor Eligibility
        +
Real-Time Availability
        +
Location Intelligence
        +
Emergency Prioritization
        +
Donor Response
        +
Privacy-Conscious Communication
        +
Hospital Coordination
        +
Admin Intelligence
```

The objective is not merely to maintain a donor database.

> **RapidRed is designed as an intelligent emergency coordination layer between patients, donors and healthcare stakeholders.**

---

# 🔮 Future Scope

### 📱 Communication

* SMS alerts
* WhatsApp integration
* Push notifications
* Multilingual support

### 🏥 Healthcare Integration

* Hospital APIs
* Blood-bank integration
* Live blood inventory
* Emergency service integration

### 🤖 Advanced Intelligence

* Blood demand forecasting
* Regional shortage prediction
* Donor response prediction
* Intelligent emergency escalation
* Predictive donor availability

### 🔐 Advanced Privacy

* Fine-grained consent management
* Secure communication channels
* Data minimization
* Audit logs

### 📊 Analytics

* Regional demand analysis
* Emergency response time
* Donor response rate
* Blood-group demand trends

---

# 🚀 Prototype Demo Flow

```text
Register
   ↓
Login
   ↓
Role Selection
   ↓
Patient Dashboard
   ↓
Create Blood Request
   ↓
Location Update
   ↓
Intelligent Donor Matching
   ↓
Donor Dashboard
   ↓
Availability
   ↓
Emergency Request
   ↓
Accept / Decline
   ↓
Donor Response
   ↓
Hospital / Admin Workflow
```

---

# 💻 Local Setup

## Prerequisites

Make sure you have:

* Python 3.x
* Node.js
* npm
* PostgreSQL

---

## 1. Clone the Repository

```bash
git clone https://github.com/vaishusudhakar5-maker/RapidRed-AI-Blood-Donor-System.git
```

```bash
cd RapidRed-AI-Blood-Donor-System
```

---

# 2. Backend Setup

```bash
cd "Ctrl Freaks/backend"
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the required dependencies according to the project's configured Python environment.

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 3. Frontend Setup

Open another terminal:

```bash
cd "Ctrl Freaks/frontend"
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔐 Environment Configuration

Sensitive configuration must be stored in environment variables.

Examples:

```env
DATABASE_URL=your_database_connection
JWT_SECRET=your_secret
API_KEYS=your_api_keys
```

### ⚠️ Security

**Never commit real credentials, database passwords, API keys or secret codes to GitHub.**

Use environment variables and keep `.env` files excluded through `.gitignore`.

---

# 📁 Project Structure

```text
Ctrl Freaks/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── test_connection.py
│
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── context/
        ├── pages/
        ├── routes/
        ├── services/
        └── utils/
```

---

# 👥 Team — Ctrl Freaks

### Team Members

* **Vaishnavi.S**
* **Saranya.K**
* **Vaishnavi.P**

---

# 🏆 Project

### RapidRed

**AI-Driven Real-Time Emergency Blood Finder & Donor Alert System**

Built to address a real-world emergency healthcare coordination problem through intelligent matching, location intelligence, availability tracking and structured donor coordination.

---

# ❤️ Our Vision

> **No emergency patient should lose valuable time searching for a compatible blood donor.**

RapidRed aims to build a future where emergency blood coordination is:

### ⚡ Fast

### 🤖 Intelligent

### 📍 Location-Aware

### 🔐 Privacy-Conscious

### 🏥 Connected

---

## 🩸 RapidRed

**Every second matters. Every donor can make a difference.**

```
