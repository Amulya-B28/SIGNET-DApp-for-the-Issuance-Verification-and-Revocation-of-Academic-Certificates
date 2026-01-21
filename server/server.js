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

// --- UPDATED SCHEMA (Added Backlogs) ---
const studentSchema = new mongoose.Schema({
    usn: { type: String, unique: true },
    name: String,
    semester: Number,
    encryptedWallet: String,
    
    // Grades
    sgpa: Number, 
    cgpa: Number,
    backlogs: Number, // <--- NEW FIELD
    
    // Status
    isEligible: Boolean, // Now calculated based on backlogs
    isIssued: { type: Boolean, default: false },
    
    // NFT Link
    certificateId: String 
});

const Student = mongoose.model('Student', studentSchema);

// --- ROUTES ---

// 1. ADMIN: Seed Data (UPDATED LOGIC)
app.get('/seed-data', async (req, res) => {
    const rawWallets = [
        { 
            usn: "1JS22CS001", name: "Alex", sem: 6, 
            wallet: "0x0ea18962eaa3bd3e7219672b2336482bd39e4863", 
            sgpa: 9.5, cgpa: 9.2, backlogs: 0 // Eligible
        },
        { 
            usn: "1JS22CS002", name: "Sam", sem: 6, 
            wallet: "0xa990a878ACDa5618dAFB65f88d06D72412C9e580", 
            sgpa: 4.0, cgpa: 5.5, backlogs: 2 // NOT Eligible
        },
        { 
            usn: "1JS22CS003", name: "John", sem: 6, 
            wallet: "0xD34E5cD2E7e13b645eAA116D1cFaD4BBaD1292A1", 
            sgpa: 9.8, cgpa: 9.6, backlogs: 0 // Eligible
        }
    ];

    let updatedCount = 0;

    try {
        for (const s of rawWallets) {
            // Logic: 0 Backlogs = True, Anything else = False
            const calculatedEligibility = (s.backlogs === 0);
            
            // Encrypt Wallet (Always update encryption to be safe)
            const encrypted = CryptoJS.AES.encrypt(s.wallet, SECRET_KEY).toString();

            // UPSERT: Update if exists, Insert if new
            await Student.findOneAndUpdate(
                { usn: s.usn }, // Find by USN
                {
                    $set: {
                        name: s.name,
                        semester: s.sem,
                        encryptedWallet: encrypted,
                        sgpa: s.sgpa,
                        cgpa: s.cgpa,
                        backlogs: s.backlogs,       // <--- Force Update This
                        isEligible: calculatedEligibility // <--- Force Update This
                    }
                },
                { upsert: true, new: true } // Create if not found
            );
            updatedCount++;
        }
        res.json({ message: `✅ Success! Updated/Added ${updatedCount} students with new Backlog criteria.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. FRONTEND: Get Eligible Batch (Unchanged - uses isEligible)
app.get('/get-batch/:semester', async (req, res) => {
    const { semester } = req.params;

    // This query finds students where isEligible is TRUE.
    // Since we set isEligible based on backlogs above, this works automatically.
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
            uri: `ipfs://credential_${s.usn}` 
        };
    });

    res.json(readyForBlockchain);
});

// 3. FRONTEND: Mark students as Issued (Unchanged)
app.post('/mark-issued', async (req, res) => {
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
                    certificateId: certId 
                } 
            }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to update database" });
    }
});

// 4. VERIFIER: Get Private Metadata (Unchanged)
app.get('/verify-metadata/:certId', async (req, res) => {
    const { certId } = req.params;
    const student = await Student.findOne({ certificateId: certId });

    if (!student) return res.status(404).json({ error: "Not Found" });

    res.json({
        name: student.name,
        usn: student.usn,
        sgpa: student.sgpa,
        cgpa: student.cgpa,
        semester: student.semester,
        backlogs: student.backlogs // Optional: Send backlogs to verifier if needed
    });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));