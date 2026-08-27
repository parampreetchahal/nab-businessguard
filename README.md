# NAB BusinessGuard

> **An independent banking risk-monitoring prototype for detecting suspicious SME transactions and helping investigators understand why a transaction was flagged.**

NAB BusinessGuard is a full-stack prototype that explores how transaction-risk signals can be combined into an investigator-oriented banking monitoring system.

The system analyzes synthetic SME transaction data, assigns a **0–100 risk score**, classifies transactions into **HIGH / MEDIUM / LOW risk**, and provides explainable signals showing why a transaction was flagged.

Rather than building only a dashboard, the project was developed end-to-end across the application stack:

**Risk Engine → REST API → Investigation UI → Business Monitoring → Cloud Deployment**

---

## Live Demo

| Resource              | Link                                                  |
| --------------------- | ----------------------------------------------------- |
| **Frontend**          | https://nab-businessguard.vercel.app/                 |
| **Backend API**       | https://nab-businessguard-backend.vercel.app/         |
| **GitHub Repository** | https://github.com/parampreetchahal/nab-businessguard |

---

## Why I Built This

Financial institutions process large volumes of transactions, making it difficult for investigators to manually identify unusual activity.

A risk score by itself is also not enough.

When a transaction is flagged, an investigator needs to understand:

- How unusual is the transaction amount?
- How does it compare with the business's historical behaviour?
- Is the beneficiary new?
- Is the device new?
- How anomalous is the transaction?
- What other transactions are associated with the business?
- What signals caused the transaction to receive its risk classification?

BusinessGuard was built to explore this problem from a **software engineering and system-design perspective**.

The objective was to build a complete working prototype rather than a standalone machine-learning experiment or static dashboard.

---

# What BusinessGuard Does

BusinessGuard provides three levels of investigation.

### 1. Risk Dashboard

Provides an overview of transaction activity and the distribution of risk across the system.

### 2. Business-Level Monitoring

Allows an investigator to inspect the transaction behaviour of an individual business, including:

- Total transactions
- Total payment volume
- Average transaction value
- High-risk transaction count
- Medium-risk transaction count
- Low-risk transaction count
- Recent high-risk activity

### 3. Transaction Investigation

An investigator can open an individual transaction and inspect its complete risk context:

- Risk score
- Risk level
- Transaction amount
- Historical average
- Risk signals
- New beneficiary detection
- New device detection
- Location
- Payment type
- ML/anomaly score
- Business context

The goal is to move from:

```text
"Something looks suspicious."
```

to:

```text
"Here is the transaction,
here is its risk score,
and here are the signals that caused the system to flag it."
```

---

# Core Features

## Risk Scoring

Transactions are assigned a numerical risk score between **0 and 100**.

The score is translated into three risk levels:

```text
HIGH
MEDIUM
LOW
```

---

## Explainable Risk Signals

BusinessGuard does not rely solely on a numerical score.

The system exposes contributing signals such as:

- Transaction amount significantly above historical behaviour
- New beneficiary
- New device
- Behavioural anomaly

This makes the result easier to interpret during an investigation.

---

## Historical Behaviour Analysis

A transaction can be compared against the business's historical transaction behaviour.

For example:

```text
Current Transaction:   $19,895.06
Historical Average:    $3,790
```

A significant deviation from the historical average can increase the transaction's risk.

---

## New Beneficiary Detection

Transactions involving previously unseen beneficiaries can contribute additional risk.

This allows the system to distinguish between familiar payment behaviour and potentially unusual payment relationships.

---

## New Device Detection

A transaction originating from a new device can also contribute to the overall risk assessment.

---

## Behavioural Anomaly Detection

An anomaly score represents how unusual a transaction is relative to expected behaviour.

The current prototype combines this signal with other transaction-level indicators.

---

# Example Investigation

Example transaction:

```text
Transaction: TXN_SUSP_001

Risk Score: 100 / 100
Risk Level: HIGH

Transaction Amount: $19,895.06
Historical Average: $3,790

Risk Signals:
- Transaction amount is significantly higher than historical average
- New beneficiary
```

The important part is not simply that the transaction is classified as HIGH risk.

The system also provides the **context behind that classification**.

---

# System Architecture

```text
                         NAB BusinessGuard
                                |
              +-----------------+-----------------+
              |                                   |
              v                                   v
       Next.js Frontend                      REST API
              |                                   |
              |                                   v
              |                            FastAPI Backend
              |                                   |
              |                                   v
              |                            Transaction Data
              |                                   |
              |                                   v
              |                              Risk Engine
              |                                   |
              +----------------+------------------+
                               |
                               v
                         Risk Assessment
                               |
                    +----------+----------+
                    |                     |
                    v                     v
             Business Risk        Transaction Risk
                Profile              Investigation
```

### Application flow

```text
Transaction
     |
     v
Risk Engine
     |
     +----------------------+
     |                      |
     v                      v
Risk Score             Risk Signals
     |                      |
     +----------+-----------+
                |
                v
           Risk Level
                |
                v
        Investigation UI
```

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

## Backend

- Python
- FastAPI
- REST API

## Data

- Synthetic transaction dataset
- CSV-based prototype data source

## Risk Detection

- Rule-based risk signals
- Historical transaction comparison
- Anomaly scoring
- Risk classification

## Deployment

- Vercel
- GitHub

---

# Risk Detection Approach

The current prototype combines multiple transaction signals.

## Transaction Amount

The transaction amount is compared against the business's historical average transaction value.

A significant increase can contribute to the overall risk score.

## New Beneficiary

A previously unseen beneficiary can represent an additional risk signal.

## New Device

A previously unseen device can contribute to the risk assessment.

## Behavioural Anomaly

An anomaly score represents how unusual the transaction is relative to expected business behaviour.

## Combined Assessment

The risk engine combines these signals to produce:

```text
Risk Score
    +
Risk Level
    +
Explainable Reasons
```

This separation allows the detection logic to evolve independently from the API and frontend layers.

---

# Backend API

The frontend communicates with the backend through REST APIs.

### Dashboard

```http
GET /dashboard/stats
```

Returns dashboard-level transaction and risk statistics.

### Transactions

```http
GET /transactions
```

Supports risk-level filtering and pagination.

Example:

```http
GET /transactions?risk_level=HIGH&page=1&limit=25
```

### Individual Transaction

```http
GET /transactions/{transaction_id}
```

Returns detailed transaction information and risk analysis.

### Businesses

```http
GET /businesses
```

Returns available businesses.

### Business Summary

```http
GET /businesses/{business_id}/summary
```

Returns transaction and risk statistics for a business.

### Business Transactions

```http
GET /businesses/{business_id}/transactions
```

Returns transactions associated with a specific business.

Risk filtering is supported.

Example:

```http
GET /businesses/B001/transactions?risk_level=HIGH
```

### Transaction Analysis

```http
POST /analyze
```

Analyzes a transaction and returns its risk assessment.

---

# Project Structure

```text
nab-businessguard/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── transaction.py
│   │   │
│   │   ├── services/
│   │   │   └── risk_engine.py
│   │   │
│   │   ├── __init__.py
│   │   └── main.py
│   │
│   ├── data/
│   │   ├── generate_data.py
│   │   └── transactions.csv
│   │
│   ├── requirements.txt
│   ├── test_risk_engine.py
│   └── .gitignore
│
├── frontend/
│   ├── app/
│   │   ├── businesses/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── transactions/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   └── Navbar.tsx
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── public/
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

# Running Locally

## Prerequisites

Make sure the following are installed:

- Python
- Node.js
- npm
- Git

## 1. Clone the repository

```bash
git clone https://github.com/parampreetchahal/nab-businessguard.git
cd nab-businessguard
```

---

## 2. Start the Backend

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Start the Frontend

Open another terminal:

```bash
cd frontend
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
http://localhost:3000
```

---

# Dataset

The current prototype uses **generated synthetic transaction data** rather than real banking data.

The dataset contains approximately:

```text
1,020 transactions
```

The data generation script is located at:

```text
backend/data/generate_data.py
```

Using synthetic data allows the complete investigation workflow to be demonstrated without exposing real customer or financial information.

---

# Engineering Highlights

This project demonstrates experience across several areas of software engineering:

- Full-stack application development
- REST API design
- Python backend development
- FastAPI
- React / Next.js
- TypeScript
- Risk scoring
- Anomaly detection concepts
- Data processing
- Explainable risk signals
- API integration
- CORS configuration
- Testing
- Cloud deployment
- Git/GitHub workflow
- Production debugging

The project was developed as an end-to-end system rather than as isolated frontend or backend components.

---

# Production Architecture Considerations

BusinessGuard is intentionally a **prototype**, not a production banking system.

A production implementation would require substantially more infrastructure, security, governance, and operational controls.

## Data Ingestion

The current CSV-based data source could be replaced with a secure transaction-ingestion pipeline:

```text
Payment Systems
      |
      v
Event / Transaction Pipeline
      |
      v
Risk Processing
```

## Persistent Storage

A production implementation would require persistent storage for:

- Transactions
- Businesses
- Risk assessments
- Investigation records
- Audit information

## Real-Time Processing

At high transaction volumes, risk evaluation could be moved toward an event-driven architecture:

```text
Transaction Event
      |
      v
Message / Event Stream
      |
      v
Risk Engine
      |
      v
Risk Result
```

## Security

A production banking implementation would require controls such as:

- Authentication
- Role-based authorization
- Encryption
- Secure secrets management
- Audit logging
- Rate limiting
- Data access controls
- PII protection

## Model Monitoring

If machine-learning models are introduced into production, additional controls would be required:

- Model monitoring
- Drift detection
- False-positive analysis
- Model versioning
- Performance evaluation
- Explainability
- Human review workflows

---

# Prototype vs Production

| Area           | Current Prototype       | Production Direction            |
| -------------- | ----------------------- | ------------------------------- |
| Data Source    | Generated CSV           | Secure transaction pipeline     |
| Storage        | Prototype dataset       | Production database             |
| Processing     | API-based               | Event-driven / streaming        |
| Risk Engine    | Rules + anomaly signals | Rules + production ML           |
| Authentication | Prototype               | Enterprise authentication       |
| Authorization  | Prototype               | RBAC                            |
| Monitoring     | Basic                   | Full observability              |
| Audit          | Prototype               | Immutable audit logging         |
| Deployment     | Vercel                  | Enterprise cloud infrastructure |
| Data           | Synthetic               | Secure financial data           |

This distinction is intentional: the prototype demonstrates the **core engineering workflow** while clearly identifying the work required for a production-grade banking environment.

---

# Development Workflow

The project was approached as an end-to-end engineering problem:

```text
Problem Definition
       ↓
System Design
       ↓
Data Generation
       ↓
Risk Engine
       ↓
Backend API
       ↓
Frontend
       ↓
Testing
       ↓
Integration
       ↓
Cloud Deployment
       ↓
Production Considerations
```

This workflow was important because the objective was not simply to implement individual features, but to understand how the components fit together into a complete software system.

---

# Future Improvements

Potential extensions include:

- Real-time transaction ingestion
- Persistent database storage
- Authentication and authorization
- Investigator case management
- Advanced transaction search
- Advanced analytics
- ML model training pipeline
- Model monitoring
- Alert notifications
- Audit trails
- Role-based dashboards
- Event-driven processing
- Production observability

These improvements are intentionally outside the scope of the current prototype.

---

# Screenshots

1. Dashboard
2. Transactions
3. Business Risk Profile
4. Transaction Investigation

```text
## Dashboard
<img width="1901" height="878" alt="image" src="https://github.com/user-attachments/assets/9ae29d4a-7a7e-4ff4-9dee-afc4ce934ec7" />


## Transaction Monitoring
<img width="1898" height="876" alt="image" src="https://github.com/user-attachments/assets/322ee5fb-fde6-4b64-b598-81fe7460eeba" />


## Business Risk Profile
<img width="1897" height="877" alt="image" src="https://github.com/user-attachments/assets/c4f92105-cd5c-4220-8de0-8b3dbacab296" />


## Transaction Investigation
<img width="1896" height="877" alt="image" src="https://github.com/user-attachments/assets/62accc9e-1a0d-4c7b-b37c-b572adb4c918" />
<img width="1901" height="871" alt="image" src="https://github.com/user-attachments/assets/8472ef02-4edc-4b86-9ad4-61ed31387c1e" />

```

---

# Disclaimer

NAB BusinessGuard is an **independent portfolio project**.

It is not affiliated with, endorsed by, or connected to **National Australia Bank Limited**.

The project does not use NAB internal systems, customer data, proprietary data, or confidential information.

All transaction data used in the prototype is synthetic/generated data.

The project is intended for **educational, demonstration, and portfolio purposes**.

---

# Author

**Parampreet Chahal**

Software Engineering

GitHub:
https://github.com/parampreetchahal

---

# Project Status

**Prototype Complete**

The current version demonstrates the complete core workflow:

```text
Synthetic Transaction Data
          ↓
      Risk Engine
          ↓
     FastAPI Backend
          ↓
     Next.js Frontend
          ↓
   Business Monitoring
          ↓
Transaction Investigation
          ↓
    Cloud Deployment
```

The prototype establishes the foundation for further development toward a more sophisticated transaction-risk and investigation platform.
