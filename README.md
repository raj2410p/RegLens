# RegLens

**RegLens** is a modern, AI-powered financial compliance and risk monitoring dashboard. It enables automated parsing of transaction records, risk-rule evaluation, and natural language analytics utilizing Google's Gemini AI, all while adhering to strict data privacy and encryption standards.

---
## live demo
🌐 [Deployed on Heroku](https://reglens-e89cf826b3cb.herokuapp.com/)  

## 🌟 Key Features

- **Automated Risk Engine:** Instantly evaluates ingested transactions against configurable AML (Anti-Money Laundering) heuristics, including Threshold Limits, High-Velocity transfers, Geo-Risk, and Cross-Border validations.
- **AI-Powered Natural Language Interface:** Talk directly to your ledger. Powered by **Google Gemini**, the integrated chat assistant can summarize daily flags, filter risk scopes, and explain complex rule triggers in plain English.
- **Enterprise-Grade Data Security:** 
  - **AES-256 Encryption-at-Rest:** Sensitive Personally Identifiable Information (PII) like `sender` and `receiver` is dynamically encrypted at a field level before touching the database.
  - **AI Anonymization (Data Masking):** Names and personal traits are automatically tokenized (`"Entity_1"`) before external API transmission to protect user privacy.
- **Instant Printable Reporting:** One-click generation of beautifully formatted, executive-ready PDF compliance audits.
- **Versatile File Ingestion:** Drag and drop `.csv`, `.json`, `.xml`, or even unstructured `.pdf` data natively.

## 🏗️ Technology Stack

- **Frontend:** React, Vite, Vanilla CSS 
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** `@google/generative-ai`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017` or via Atlas.
- API Key from [Google AI Studio](https://aistudio.google.com/) for Gemini models.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/RegLens.git
   cd RegLens
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   GEMINI_API_KEY=your_google_ai_key
   MONGO_URI=mongodb://127.0.0.1:27017/reglens
   PORT=5000
   ```
   *(Note: The server uses an intelligent mock fallback mechanism if the API key hits a quota limit or is omitted).*

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application Local

Open two separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm start
```
*The backend server will run on `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
*The frontend dashboard will run on `http://localhost:5173`*

---

## 🔒 Security Architecture Highlights

1. **CryptoService**: Leverages Node's native `crypto` module to apply `aes-256-cbc` ciphers dynamically on Mongoose Hooks. Hackers accessing the database files receive only random IVs and encrypted buffers.
2. **PrivacyService**: Provides bidirectional, short-lived token hashing during an LLM cycle to guarantee LLM models operate completely blindly on the datasets they process. 

---

## 📝 License
Copyright &copy; 2026. This project is meant as a prototype showcase for Advanced Agentic UI integrations and zero-trust data strategies.
