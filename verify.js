import { managerAddress, nftAddress, managerABI } from './constants.js';

const sepoliaRPC = "https://eth-sepolia.g.alchemy.com/v2/kISazI6GNDXLr2ZPkBenP"; 
const provider = new ethers.providers.JsonRpcProvider(sepoliaRPC);
const contract = new ethers.Contract(managerAddress, managerABI, provider);

const instResultsDiv = document.getElementById('inst-verify-results');
const studentResultsDiv = document.getElementById('student-verify-results');
const certResultsDiv = document.getElementById('cert-verify-results');

// --- 1. VERIFY INSTITUTION (Unchanged) ---
async function handleVerifyInstitution(event) {
    event.preventDefault();
    const address = document.getElementById('inst-verify-address').value;
    if (!ethers.utils.isAddress(address)) return alert("Invalid Address");

    instResultsDiv.classList.remove('hidden');
    instResultsDiv.innerHTML = '<div class="loader"></div> Verifying...';

    try {
        const institution = await contract.institutions(address);
        if (institution.isAuthorized) {
            instResultsDiv.innerHTML = `
                <div class="result-box" style="border-color: #2ecc71;">
                    <h4 class="text-green">✅ VALID INSTITUTION</h4>
                    <p><strong>Name:</strong> ${institution.name}</p>
                    <p><strong>Address:</strong> ${address}</p>
                </div>`;
        } else {
            instResultsDiv.innerHTML = `<h4 class="text-red">❌ NOT AUTHORIZED</h4>`;
        }
    } catch (error) { console.error(error); }
}

// --- 2. VERIFY STUDENT (Name Removed) ---
// --- 2. VERIFY STUDENT (Show ALL Certificates with USN) ---
async function handleVerifyStudent(event) {
    event.preventDefault();
    const address = document.getElementById('student-verify-address').value;

    if (!ethers.utils.isAddress(address)) return alert("Invalid Address");

    studentResultsDiv.classList.remove('hidden');
    studentResultsDiv.innerHTML = '<div class="loader"></div> Scanning Ledger & Database...';

    try {
        // 1. Get all IDs from Blockchain
        const certIds = await contract.getStudentCertificates(address);

        if (certIds.length > 0) {
            
            // 2. Fetch Data for ALL certificates in parallel
            // We map every ID to a "Promise" that fetches its specific details
            const certsData = await Promise.all(certIds.map(async (certId) => {
                
                // A. Blockchain: Get Cert Details + Issuer Name
                const cert = await contract.getCertificateDetails(certId);
                const institution = await contract.institutions(cert.issuingInstitution);
                
                // B. Database: Get USN (Private Data)
                let usn = "Private/Offline"; 
                try {
                    const response = await fetch(`http://localhost:5000/verify-metadata/${certId}`);
                    if (response.ok) {
                        const data = await response.json();
                        usn = data.usn || "N/A";
                    }
                } catch (err) {
                    // If DB is offline, we just show "Private"
                }

                return {
                    id: certId,
                    credential: cert.credentialName,
                    issuer: institution.name, // The Issuer Name you wanted
                    usn: usn,                 // The USN you wanted
                    status: cert.status,
                    date: new Date(cert.issueDate * 1000).toLocaleDateString()
                };
            }));

            // 3. Build the HTML List
            // We reverse() to show the newest degree at the top
            let htmlList = certsData.reverse().map(c => {
                // Style status
                let statusBadge = c.status === 1 ? '<span class="text-gold">PENDING</span>' : 
                                  c.status === 2 ? '<span class="text-green">VALID</span>' : 
                                  '<span class="text-red">REVOKED</span>';
                
                return `
                <div class="result-box" style="border-left: 4px solid #3498db; margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #444; padding-bottom:8px; margin-bottom:8px;">
                        <h4 style="margin:0; color:#fff;">${c.credential}</h4>
                        <small>${statusBadge}</small>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div>
                            <small style="color:#888;">Student USN</small><br>
                            <strong style="color:#fff;">${c.usn}</strong>
                        </div>
                        <div>
                            <small style="color:#888;">Issued By</small><br>
                            <strong style="color:#fff;">${c.issuer}</strong>
                        </div>
                    </div>
                    
                    <p style="margin-top:8px; font-size:0.8em; color:#aaa;">
                        Date: ${c.date} <br>
                        ID: ${c.id.substring(0, 10)}...
                    </p>
                </div>`;
            }).join('');

            studentResultsDiv.innerHTML = `
                <h4 class="text-blue">Found ${certIds.length} Certificate(s)</h4>
                <p style="margin-bottom:15px; font-size:0.9em; color:#aaa;">Wallet: ${address}</p>
                ${htmlList}
            `;

        } else {
            studentResultsDiv.innerHTML = `<h4 class="text-red">No Certificates Found</h4><p>This wallet has not received any certificates.</p>`;
        }
    } catch (error) {
        console.error(error);
        studentResultsDiv.innerHTML = `<p class="text-red">Connection Error. Check Console.</p>`;
    }
}

// --- 3. VERIFY CERTIFICATE (Swapped Name for USN) ---
async function handleVerifyCertificate(event) {
    event.preventDefault();
    const certId = document.getElementById('cert-verify-id').value.trim();
    if (certId.length !== 66) return alert("Invalid ID");

    certResultsDiv.classList.remove('hidden');
    certResultsDiv.innerHTML = '<div class="loader"></div> Fetching Secure Data...';

    try {
        // A. Blockchain Fetch
        const cert = await contract.getCertificateDetails(certId);
        if (cert.status === 0) {
            certResultsDiv.innerHTML = `<h4 class="text-red">❌ INVALID ID</h4>`;
            return;
        }

        // B. Database Fetch (Get USN)
        let dbData = { sgpa: "-", cgpa: "-", usn: "Private/Offline" };
        let dbStatus = "";

        try {
            const response = await fetch(`http://localhost:5000/verify-metadata/${certId}`);
            if (response.ok) {
                dbData = await response.json();
            }
        } catch (err) { console.warn("DB Offline"); }

        // Formatting Status
        let statusHtml = cert.status === 1 ? '<span class="text-gold">⏳ PENDING</span>' : 
                         cert.status === 2 ? '<span class="text-green">✅ VALID</span>' : 
                         '<span class="text-red">⛔ REVOKED</span>';

        const institution = await contract.institutions(cert.issuingInstitution);
        const etherscanLink = `https://sepolia.etherscan.io/token/${nftAddress}?a=${cert.nftTokenId.toString()}`;

        // C. RENDER (USN ONLY)
        certResultsDiv.innerHTML = `
            <div class="result-box">
                <div style="border-bottom:1px solid #444; padding-bottom:10px; margin-bottom:10px;">
                    <h3 style="margin:0; color:white;">${cert.credentialName}</h3>
                    <p style="margin:5px 0 0 0;">Status: ${statusHtml}</p>
                </div>
                
                <p><strong>Student USN:</strong> <span style="font-size:1.2em; color:#fff;">${dbData.usn}</span></p>
                
                <p><strong>Issued By:</strong> ${institution.name}</p>
                <p><strong>Issue Date:</strong> ${new Date(cert.issueDate * 1000).toLocaleDateString()}</p>
                
                <div class="grades-grid">
                    <div class="grade-item"><span>SGPA</span><strong>${dbData.sgpa}</strong></div>
                    <div class="grade-item"><span>CGPA</span><strong>${dbData.cgpa}</strong></div>
                </div>

                <div style="margin-top: 15px; text-align:center;">
                    <a href="${etherscanLink}" target="_blank" class="text-blue">View Proof on Etherscan ↗</a>
                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        certResultsDiv.innerHTML = `<p class="text-red">Verification failed.</p>`;
    }
}

// Event Listeners
document.getElementById('verifyInstitutionForm').addEventListener('submit', handleVerifyInstitution);
document.getElementById('verifyStudentForm').addEventListener('submit', handleVerifyStudent);
document.getElementById('verifyCertificateForm').addEventListener('submit', handleVerifyCertificate);