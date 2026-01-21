Here is the comprehensive **README.md** file with the **Usage Guide** and **Future Enhancements** included as requested. You can copy the code block below directly.

```markdown
# 🎓 Signet: Decentralized Academic Credential Verification System

**Signet** is a **Hybrid Blockchain Application** designed to issue, verify, and revoke academic certificates securely. By combining the immutability of **Ethereum (Web3)** with the privacy of a **Secure Database (Web2)**, Signet eliminates certificate fraud while protecting student privacy.

---

## 📜 Table of Contents
1.  [Project Overview](#-project-overview)
2.  [Why Signet? (Problem & Solution)](#-why-signet-problem--solution)
3.  [System Architecture](#-system-architecture)
4.  [Tech Stack](#-tech-stack)
5.  [Key Features](#-key-features)
6.  [Installation & Setup](#-installation--setup)
7.  [Usage Guide](#-usage-guide)
8.  [Smart Contract & APIs](#-smart-contract--apis)
9.  [Future Enhancements](#-future-enhancements)

---

## 🚀 Project Overview

**Signet** replaces traditional, paper-based, and centralized certificate systems with a tamper-proof decentralized ledger.
* **Issuers (Universities)** can mint digital degrees as NFTs (ERC-721).
* **Students** receive certificates directly in their crypto wallets (MetaMask).
* **Verifiers (Employers)** can instantly confirm the validity of a degree without contacting the university.

---

## ❓ Why Signet? (Problem & Solution)

### The Problem
* **Fake Degrees:** Scandals like the *Manav Bharati University* case (36,000+ fake degrees) expose the vulnerability of centralized databases to insider manipulation.
* **Data Silos:** Verification is slow because data is locked in university servers that don't talk to employer systems.
* **Single Point of Failure:** If a university's server crashes or is hacked, records are lost or altered.

### The Signet Solution (Hybrid Approach)
* **Immutable Proof:** Once a certificate is issued on the blockchain, it cannot be edited, backdated, or deleted.
* **Privacy-First:** Sensitive data (Grades, Backlogs, USN) is stored in a private MongoDB database, while only the *Proof of Validity* is public on the blockchain.
* **Instant Verification:** Employers can verify credentials in seconds using the Certificate ID.

---

## 🏗 System Architecture

The system follows a **3-Tier Hybrid Architecture**:

1.  **User Layer (Frontend):**
    * Web Interface deployed on **Vercel**.
    * **MetaMask** integration for secure login and transaction signing.
2.  **Hybrid Middleware (The Brain):**
    * **Node.js/Express:** Handles business logic and APIs.
    * **MongoDB:** Stores private student data (USN, SGPA, CGPA, Backlogs).
3.  **Decentralized Storage (The Vault):**
    * **Ethereum Sepolia:** Stores the "Hash" (Proof of existence) and Revocation status.
    * **IPFS:** Stores public assets (Certificate Images, University Logos).

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript, Ethers.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Blockchain** | Solidity (Smart Contracts), Ethereum Sepolia Testnet |
| **Storage** | IPFS (Pinata/Web3.Storage) |
| **Tools** | MetaMask, Remix IDE, VS Code, Vercel |

---

## ✨ Key Features

* **🎓 Batch Issuance:** Issue certificates to eligible students (0 Backlogs) in bulk.
* **🔍 Dual Verification:**
    * *Public Check:* Is the certificate valid on the blockchain?
    * *Private Check:* Fetch SGPA/CGPA from the secure database (if authorized).
* **🚫 Instant Revocation:** Permanently mark a certificate as "Invalid" on the ledger if issued in error.
* **🔒 Privacy Preservation:** Student grades are never exposed on the public ledger.
* **💼 Wallet Identity:** Students own their credentials via their Ethereum address.

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
* Node.js (v14+)
* MongoDB (Local or Atlas URL)
* MetaMask Extension (Configured for Sepolia)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/signet.git](https://github.com/your-username/signet.git)
cd signet

```

### 2. Backend Setup

Navigate to the server folder and install dependencies.

```bash
cd server
npm install

```

* Create a `.env` file in the `server` folder:
```env
MONGO_URI=mongodb://localhost:27017/SIGNET_STUDENT
SECRET_KEY=YourSuperSecretKey

```


* Start the Server:
```bash
node server.js

```


*(Runs on http://localhost:5000)*

### 3. Frontend Setup

* Open the `client` (or root) folder.
* Update `constants.js` with your deployed **Contract Address** and **ABI**.
* Open `index.html` with **Live Server** (VS Code Extension).

---

## 📖 Usage Guide

### 1. Admin (University)

* **Login:** Connect Admin Wallet via MetaMask.
* **Seed Data:** Visit `http://localhost:5000/seed-data` to load dummy students into MongoDB.
* **Issue Certificate:** 1. Navigate to the "Issue" tab.
2. Select a student from the dropdown list (Only students with 0 backlogs will appear).
3. Click **Issue** and confirm the transaction in MetaMask.
* **Revoke Certificate:** 1. Go to the "Revoke" section.
2. Enter the unique Certificate ID.
3. Confirm the revocation transaction to mark it as invalid on the blockchain.

### 2. Student

* **Check Profile:** Enter your Wallet Address in the "Verify Student" section.
* **View Certs:** You will see a list of all your earned credentials along with their status (Valid/Revoked).

### 3. Verifier (Employer)

* **Verify ID:** Paste the Certificate ID (Hash) provided by the candidate.
* **Result:** The system will display:
* **Blockchain Status:** Valid or Invalid.
* **Private Data:** Grades and USN (fetched securely from the database if authorized).



---

## 🔗 Smart Contract & APIs

### Smart Contract Functions (Solidity)

* `issueCertificate(address student, string memory tokenURI, string memory name)`
* `revokeCertificate(uint256 tokenId)`
* `getCertificateDetails(uint256 tokenId)`

### Backend API Endpoints (Node.js)

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/seed-data` | Populates DB with test students. |
| `GET` | `/get-batch/:sem` | Fetches eligible students for dropdown. |
| `POST` | `/mark-issued` | Updates DB status after Blockchain success. |
| `GET` | `/check-student/:addr` | Checks if a wallet belongs to a student. |
| `GET` | `/verify-metadata/:id` | Fetches private grades (USN, SGPA). |

---

## 🚀 Future Enhancements

* **Layer-2 Migration:** Deploying the smart contract on **Polygon** or **Arbitrum** to reduce gas fees by up to 99% and increase transaction speed.
* **QR Code Integration:** Embedding dynamic QR codes on physical or digital certificates for instant "scan-and-verify" capability using mobile devices.
* **AI Fraud Detection:** Implementing AI algorithms to analyze issuance patterns and flag anomalies (e.g., unusual bulk issuance at odd hours).
* **Govt Integration:** Building API bridges to connect with national digital lockers like **DigiLocker** or **ABC ID** for seamless cross-platform recognition.

---

### 👨‍💻 Contributors

* **[Your Name]** - Full Stack Developer

---

*Built for the Future of Academic Integrity.*

```

```
