// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const CryptoJS = require('crypto-js');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const MONGO_URI = "mongodb://localhost:27017/SIGNET_STUDENT";
const SECRET_KEY = "MySuperSecretKey_2026";

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// --- UPDATED SCHEMA (With SGPA & Cert ID) ---
const studentSchema = new mongoose.Schema({
    usn: { type: String, unique: true }, // unique prevents duplicates
    name: String,
    semester: Number,
    encryptedWallet: String,
    
    // Grades (Needed for Verifier Page)
    sgpa: Number, 
    cgpa: Number,
    
    // Status
    isEligible: Boolean,
    isIssued: { type: Boolean, default: false },
    
    // NFT Link (Needed for Revocation)
    certificateId: String // Stores the 0x... ID from blockchain
});

const Student = mongoose.model('Student', studentSchema);

// --- ROUTES ---

// 1. ADMIN: Seed Data (FIXED: Doesn't delete existing data)
app.get('/seed-data', async (req, res) => {
    // 1. Define your Data
    const rawWallets = [
        { 
            usn: "1JS22CS001", name: "Alex", sem: 6, 
            wallet: "0x0ea18962eaa3bd3e7219672b2336482bd39e4863", 
            sgpa: 9.5, cgpa: 9.2, isEligible: true 
        },
        { 
            usn: "1JS22CS002", name: "Sam", sem: 6, 
            wallet: "0xa990a878ACDa5618dAFB65f88d06D72412C9e580", 
            sgpa: 4.0, cgpa: 5.5, isEligible: false // Fail
        },
        { 
            usn: "1JS22CS003", name: "John", sem: 6, 
            wallet: "0xD34E5cD2E7e13b645eAA116D1cFaD4BBaD1292A1", 
            sgpa: 9.8, cgpa: 9.6, isEligible: true 
        }
    ];

    let addedCount = 0;

    try {
        // 2. Loop through and add ONLY if they don't exist
        for (const s of rawWallets) {
            // Check if student already exists
            const exists = await Student.findOne({ usn: s.usn });
            
            if (!exists) {
                // Encrypt Wallet
                const encrypted = CryptoJS.AES.encrypt(s.wallet, SECRET_KEY).toString();
                
                await Student.create({
                    usn: s.usn,
                    name: s.name,
                    semester: s.sem,
                    encryptedWallet: encrypted,
                    sgpa: s.sgpa, // Added
                    cgpa: s.cgpa, // Added
                    isEligible: s.isEligible
                });
                addedCount++;
            }
        }
        res.json({ message: `✅ Database Checked. Added ${addedCount} new students. Existing data kept safe.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. FRONTEND: Get Eligible Batch
app.get('/get-batch/:semester', async (req, res) => {
    const { semester } = req.params;

    const students = await Student.find({ 
        semester: semester, 
        isEligible: true, 
        isIssued: false 
    });

    const readyForBlockchain = students.map(s => {
        const bytes = CryptoJS.AES.decrypt(s.encryptedWallet, SECRET_KEY);
        const realWallet = bytes.toString(CryptoJS.enc.Utf8);
        return {
            usn: s.usn,
            name: s.name,
            wallet: realWallet,
            // Privacy: Use ID in URI, not Name
            uri: `ipfs://credential_${s.usn}` 
        };
    });

    res.json(readyForBlockchain);
});

// 3. FRONTEND: Mark students as Issued (Now saves the Cert ID!)
app.post('/mark-issued', async (req, res) => {
    // Frontend sends: { usn: "...", certId: "0x123..." }
    const { usn, certId } = req.body; 

    if (!usn || !certId) {
        return res.status(400).json({ error: "Missing USN or Cert ID" });
    }

    try {
        await Student.updateOne(
            { usn: usn },
            { 
                $set: { 
                    isIssued: true,
                    certificateId: certId // <--- CRITICAL: Save the ID for revocation later
                } 
            }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update database" });
    }
});

// 4. VERIFIER: Get Private Metadata (New Route)
app.get('/verify-metadata/:certId', async (req, res) => {
    const { certId } = req.params;
    const student = await Student.findOne({ certificateId: certId });

    if (!student) return res.status(404).json({ error: "Not Found" });

    res.json({
        name: student.name,
        usn: student.usn,
        sgpa: student.sgpa,
        cgpa: student.cgpa,
        semester: student.semester
    });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));