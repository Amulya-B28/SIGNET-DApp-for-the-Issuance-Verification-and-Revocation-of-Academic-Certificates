import { managerAddress, nftAddress, managerABI, nftABI } from './constants.js';

// --- CONSTANTS & MOCK DATABASE ---

// 1. Hardcoded Metadata URL (University Logo / Generic Certificate Image)
const defaultTokenURI = "ipfs://bafkreicrp325375gvwh2ulw7fyv3raeg6za3cwnuobnl2smhjke737fkua";

// 2. Mock Database (The University's Student Records)
const universityDatabase = {
    "2024-2025": [
        { name: "Alice Johnson", address: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4" },
        { name: "Bob Smith", address: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2" },
        { name: "Charlie Brown", address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db" }
    ],
    "2025-2026": [
        { name: "David Lee", address: "0x78731D3Ca6b7E34aC0F824c42a7cC18a495cabaB" },
        { name: "Eva Green", address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2" }
    ],
    "2025-2026-B": [
        { name: "Frank Wright", address: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372" }
    ]
};

// --- Global Variables ---
let provider;
let signer;
let managerContract;
let nftContract;
let currentAccount;
let allInstitutes = [];
let allIssuedCerts = [];

// --- DOM Elements ---
const walletButton = document.getElementById('connectButton');
const walletAddress = document.getElementById('wallet-address');
const welcomeMessage = document.getElementById('welcome-message');
const dashboardLayout = document.getElementById('dashboard-layout');
const sidebar = document.getElementById('sidebar');
const dashboardPageTitle = document.getElementById('dashboard-page-title');

const pages = {
    'owner-add-institute-page': document.getElementById('owner-add-institute-page'),
    'owner-view-institutes-page': document.getElementById('owner-view-institutes-page'),
    'institution-issue-one-page': document.getElementById('institution-issue-one-page'),
    'institution-issue-batch-page': document.getElementById('institution-issue-batch-page'),
    'institution-view-certs-page': document.getElementById('institution-view-certs-page'),
    'institution-revoke-cert-page': document.getElementById('institution-revoke-cert-page'),
    'student-page': document.getElementById('student-page'),
};

// --- Navigation ---
function showPage(pageId) {
    Object.values(pages).forEach(page => page && page.classList.add('hidden'));
    sidebar.querySelectorAll('a').forEach(link => link.classList.remove('active'));

    const activePage = pages[pageId];
    if (activePage) activePage.classList.remove('hidden');

    const activeLink = document.querySelector(`a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        dashboardPageTitle.textContent = activeLink.textContent;
    }

    if (pageId === 'student-page') loadStudentCertificates();
    if (pageId === 'owner-view-institutes-page') loadAndShowInstitutes();
    if (pageId === 'institution-view-certs-page') loadAndShowIssuedCertificates();
}

function setupSidebarListeners() {
    sidebar.addEventListener('click', (event) => {
        let target = event.target;
        if (target.tagName !== 'A') target = target.closest('a');
        if (target && target.tagName === 'A') {
            event.preventDefault();
            const pageId = target.dataset.page;
            if (pageId) showPage(pageId);
        }
    });
}

function buildOwnerSidebar() {
    sidebar.innerHTML = `
        <h4>Owner Menu</h4>
        <p>${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}</p>
        <ul>
            <li><a href="#" data-page="owner-add-institute-page" class="active">Add Institution</a></li>
            <li><a href="#" data-page="owner-view-institutes-page">View/Revoke Institutions</a></li>
        </ul>
    `;
    setupSidebarListeners();
}

function buildInstitutionSidebar() {
    sidebar.innerHTML = `
        <h4>Institution Menu</h4>
        <p>${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}</p>
        <ul>
            <li><a href="#" data-page="institution-issue-one-page" class="active">Issue Certificate</a></li>
            <li><a href="#" data-page="institution-issue-batch-page">Batch Issue</a></li>
            <li><a href="#" data-page="institution-view-certs-page">View/Revoke Issued</a></li>
            <li><a href="#" data-page="institution-revoke-cert-page">Revoke by ID</a></li>
        </ul>
    `;
    setupSidebarListeners();
}

function buildStudentSidebar() {
    sidebar.innerHTML = `
        <h4>Student Menu</h4>
        <p>${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}</p>
        <ul>
            <li><a href="#" data-page="student-page" class="active">My Certificates</a></li>
        </ul>
    `;
    setupSidebarListeners();
}

// --- Wallet Logic ---
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            currentAccount = accounts[0];
            
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            managerContract = new ethers.Contract(managerAddress, managerABI, signer);
            nftContract = new ethers.Contract(nftAddress, nftABI, signer);
            
            walletButton.textContent = 'Disconnect';
            walletButton.removeEventListener('click', connectWallet);
            walletButton.addEventListener('click', disconnectWallet);
            
            welcomeMessage.classList.add('hidden');

            const ownerAddress = await managerContract.owner();
            const institutionInfo = await managerContract.institutions(currentAccount);
            
            let defaultPage = '';
            if (currentAccount.toLowerCase() === ownerAddress.toLowerCase()) {
                buildOwnerSidebar();
                defaultPage = 'owner-add-institute-page';
            } else if (institutionInfo.isAuthorized) {
                buildInstitutionSidebar();
                defaultPage = 'institution-issue-one-page';
            } else {
                buildStudentSidebar();
                defaultPage = 'student-page';
            }
            
            dashboardLayout.classList.remove('hidden');
            showPage(defaultPage);
            
        } catch (error) {
            console.error(error);
            alert("Connection failed.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

function disconnectWallet() {
    provider = null;
    signer = null;
    managerContract = null;
    nftContract = null;
    currentAccount = null;

    walletButton.textContent = 'Connect Wallet';
    walletButton.removeEventListener('click', disconnectWallet);
    walletButton.addEventListener('click', connectWallet);
    
    dashboardLayout.classList.add('hidden');
    welcomeMessage.classList.remove('hidden');
    sidebar.innerHTML = '';
}

// --- HANDLERS ---

async function handleAddInstitution(event) {
    event.preventDefault();
    const instAddress = document.getElementById('inst-address').value;
    const instName = document.getElementById('inst-name').value;
    try {
        const tx = await managerContract.addInstitution(instAddress, instName);
        alert("Transaction sent... waiting...");
        await tx.wait();
        alert("Institution added!");
        document.getElementById('addInstitutionForm').reset();
        if (!pages['owner-view-institutes-page'].classList.contains('hidden')) loadAndShowInstitutes();
    } catch (e) { console.error(e); alert("Error: " + e.message); }
}

async function loadAndShowInstitutes() {
    const list = document.getElementById('institute-list');
    list.innerHTML = '<p>Loading...</p>';
    try {
        const filter = managerContract.filters.InstitutionAuthorized();
        const events = await managerContract.queryFilter(filter, 0, 'latest');
        if (events.length === 0) { list.innerHTML = '<p>None found.</p>'; return; }

        const checks = events.map(async (e) => {
            const info = await managerContract.institutions(e.args.institutionAddress);
            return info.isAuthorized ? { address: e.args.institutionAddress, name: e.args.name } : null;
        });
        allInstitutes = (await Promise.all(checks)).filter(i => i);
        renderInstitutesList();
    } catch (e) { console.error(e); list.innerHTML = '<p>Error.</p>'; }
}

function renderInstitutesList(q = '') {
    const list = document.getElementById('institute-list');
    list.innerHTML = '';
    const filtered = allInstitutes.filter(i => i.name.toLowerCase().includes(q) || i.address.toLowerCase().includes(q));
    if (filtered.length === 0) { list.innerHTML = '<p>No matches.</p>'; return; }
    
    filtered.forEach(i => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<div><h5>${i.name}</h5><p>${i.address}</p></div><button class="revoke-btn" data-address="${i.address}">Revoke</button>`;
        list.appendChild(div);
    });
    list.querySelectorAll('.revoke-btn').forEach(b => b.addEventListener('click', handleRevokeInstitution));
}

async function handleRevokeInstitution(e) {
    const addr = e.target.dataset.address || document.getElementById('revoke-inst-address')?.value;
    if (!addr || !confirm(`Revoke ${addr}?`)) return;
    try {
        const tx = await managerContract.revokeInstitution(addr);
        alert("Revoking...");
        await tx.wait();
        alert("Revoked!");
        loadAndShowInstitutes();
    } catch (e) { console.error(e); alert("Error: " + e.message); }
}

// --- INSTITUTION: Single Issue (UPDATED) ---
async function handleIssueCertificate(event) {
    event.preventDefault();
    const sAddr = document.getElementById('student-address').value;
    const sName = document.getElementById('student-name').value;
    const cred = document.getElementById('credential-name').value;
    // Use default hardcoded URI
    const uri = defaultTokenURI;

    try {
        const tx = await managerContract.issueCertificate(sAddr, sName, cred, uri);
        alert("Transaction sent...");
        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === 'CertificateIssued');
        
        const detailsDiv = document.getElementById('issue-result-details');
        if (event) {
            detailsDiv.innerHTML = `<p>ID: ${event.args.certificateId}</p><p>NFT ID: ${event.args.nftTokenId}</p>`;
            document.getElementById('issue-results').classList.remove('hidden');
        }
        document.getElementById('issueCertificateForm').reset();
        showPage('institution-view-certs-page');
    } catch (e) { console.error(e); alert("Error: " + e.message); }
}

// --- INSTITUTION: Batch Issue (UPDATED) ---
async function handleBatchIssue(event) {
    event.preventDefault();
    
    // 1. Get Manual Credential Name
    const credentialName = document.getElementById('batch-credential-name').value;
    if (!credentialName) { alert("Enter a Credential Name"); return; }

    // 2. Get Selected Students
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    if (checkboxes.length === 0) { alert("Select students."); return; }

    const sAddrs = [];
    const sNames = [];
    const creds = [];
    const uris = [];

    checkboxes.forEach(box => {
        sAddrs.push(box.dataset.address);
        sNames.push(box.dataset.name);
        creds.push(credentialName); 
        uris.push(defaultTokenURI); 
    });

    if (!confirm(`Issue ${sAddrs.length} certificates for "${credentialName}"?`)) return;

    try {
        const tx = await managerContract.batchIssueCertificates(sAddrs, sNames, creds, uris);
        alert("Batch transaction sent...");
        await tx.wait();
        alert("Batch complete!");
        
        document.getElementById('batchIssueForm').reset();
        document.getElementById('batch-student-list').classList.add('hidden');
        showPage('institution-view-certs-page');
    } catch (e) { console.error(e); alert("Error: " + e.message); }
}

// --- Helper for Batch Dropdown ---
function handleBatchSelectChange(event) {
    const batchId = event.target.value;
    const listDiv = document.getElementById('batch-student-list');
    const checkDiv = document.getElementById('student-checkboxes');
    checkDiv.innerHTML = '';

    if (!batchId) { listDiv.classList.add('hidden'); return; }

    const students = universityDatabase[batchId];
    if (students) {
        students.forEach((s, i) => {
            const d = document.createElement('div');
            d.style.marginBottom = '8px';
            d.innerHTML = `
                <input type="checkbox" class="student-checkbox" id="s-${i}" data-address="${s.address}" data-name="${s.name}">
                <label for="s-${i}" style="color:#ccc; margin-left:8px; cursor:pointer;"><strong>${s.name}</strong> <span style="font-size:0.8em; color:#777;">${s.address}</span></label>
            `;
            checkDiv.appendChild(d);
        });
        listDiv.classList.remove('hidden');
    }
}

function handleSelectAll(e) {
    const checked = e.target.checked;
    document.querySelectorAll('.student-checkbox').forEach(b => b.checked = checked);
}

// --- VIEW ISSUED ---
async function loadAndShowIssuedCertificates() {
    const list = document.getElementById('issued-cert-list');
    list.innerHTML = '<p>Loading...</p>';
    try {
        const filter = managerContract.filters.CertificateIssued();
        const events = await managerContract.queryFilter(filter, 0, 'latest');
        
        const checks = events.map(async (e) => {
            const c = await managerContract.getCertificateDetails(e.args.certificateId);
            return c.issuingInstitution.toLowerCase() === currentAccount.toLowerCase() ? c : null;
        });
        allIssuedCerts = (await Promise.all(checks)).filter(c => c).reverse();
        
        renderIssuedCertsList();
    } catch (e) { console.error(e); list.innerHTML = '<p>Error.</p>'; }
}

function renderIssuedCertsList(q = '') {
    const list = document.getElementById('issued-cert-list');
    list.innerHTML = '';
    const filtered = allIssuedCerts.filter(c => c.studentName.toLowerCase().includes(q) || c.credentialName.toLowerCase().includes(q));
    if (filtered.length === 0) { list.innerHTML = '<p>No certificates.</p>'; return; }

    filtered.forEach(c => {
        const d = document.createElement('div');
        d.className = 'list-item';
        let st = c.status === 1 ? 'Pending' : c.status === 2 ? 'Accepted' : 'Revoked';
        d.innerHTML = `<div><h5>${c.credentialName}</h5><p>${c.studentName}</p><p>Status: ${st}</p></div>${c.status !== 3 ? `<button class="revoke-btn" data-id="${c.id}">Revoke</button>` : ''}`;
        list.appendChild(d);
    });
    list.querySelectorAll('.revoke-btn').forEach(b => b.addEventListener('click', handleRevokeCert));
}

async function handleRevokeCert(e) {
    const id = e.target.dataset.id || document.getElementById('revoke-cert-id')?.value;
    if (!id || !confirm(`Revoke ${id}?`)) return;
    try {
        const tx = await managerContract.revokeCertificate(id);
        alert("Revoking...");
        await tx.wait();
        alert("Revoked!");
        loadAndShowIssuedCertificates();
    } catch (e) { console.error(e); alert("Error: " + e.message); }
}

// --- STUDENT: Load Certificates (FIXED) ---
async function loadStudentCertificates() {
    const list = document.getElementById('certificate-list');
    list.innerHTML = '<p>Loading...</p>';
    try {
        const ids = await managerContract.getStudentCertificates(currentAccount);
        if (ids.length === 0) { list.innerHTML = '<p>No certificates.</p>'; return; }
        
        list.innerHTML = '';
        for (const id of ids) {
            const c = await managerContract.getCertificateDetails(id);
            const d = document.createElement('div');
            d.className = 'card';
            let st = c.status === 1 ? 'Pending (Click to Accept)' : c.status === 2 ? 'Accepted' : 'Revoked';
            
            // Logic to show buttons ONLY if status is 1 (Pending)
            const buttonsHTML = c.status === 1 ? `
                <div style="margin-top: 15px;">
                    <button class="accept-btn" data-id="${c.id}">Accept</button>
                    <button class="reject-btn" data-id="${c.id}">Reject</button>
                </div>
            ` : '';

            d.innerHTML = `
                <h4>${c.credentialName}</h4>
                <p><span>Student:</span> ${c.studentName}</p>
                <p><span>Issued By:</span> ${c.issuingInstitution}</p>
                <p><span>NFT ID:</span> ${c.nftTokenId}</p>
                <p><span>Status:</span> <strong>${st}</strong></p>
                <p><span>ID:</span> ${c.id}</p>
                ${buttonsHTML}
                <a href="https://sepolia.etherscan.io/nft/${nftAddress}/${c.nftTokenId}" target="_blank" style="margin-top:10px;display:block;">View on Etherscan</a>
            `;
            list.appendChild(d);
        }
        
        // Attach event listeners
        list.querySelectorAll('.accept-btn').forEach(b => b.addEventListener('click', handleAcceptCertificate));
        list.querySelectorAll('.reject-btn').forEach(b => b.addEventListener('click', handleRejectCertificate));
        
    } catch (e) { console.error(e); list.innerHTML = '<p>Error.</p>'; }
}

async function handleAcceptCertificate(e) {
    try {
        const tx = await managerContract.acceptCertificate(e.target.dataset.id);
        alert("Accepting...");
        await tx.wait();
        alert("Accepted!");
        loadStudentCertificates();
    } catch (err) { console.error(err); alert("Error: " + err.message); }
}

function handleRejectCertificate(e) {
    alert("To reject this certificate, simply do not accept it.\n\nIf this certificate was issued to you by mistake, please contact the issuing institution and ask them to 'Revoke' it using its ID: \n" + e.target.dataset.id);
}

// --- INIT ---
function init() {
    console.log("App Init");
    document.getElementById('connectButton').addEventListener('click', connectWallet);
    
    // Forms
    document.getElementById('addInstitutionForm').addEventListener('submit', handleAddInstitution);
    document.getElementById('issueCertificateForm').addEventListener('submit', handleIssueCertificate);
    document.getElementById('batchIssueForm').addEventListener('submit', handleBatchIssue);
    document.getElementById('revokeCertificateForm').addEventListener('submit', handleRevokeCert);

    // Inputs
    document.getElementById('batch-select').addEventListener('change', handleBatchSelectChange);
    document.getElementById('select-all-students').addEventListener('change', handleSelectAll);
    document.getElementById('institute-search').addEventListener('input', (e) => renderInstitutesList(e.target.value.toLowerCase()));
    document.getElementById('cert-search').addEventListener('input', (e) => renderIssuedCertsList(e.target.value.toLowerCase()));

    dashboardLayout.classList.add('hidden');
    welcomeMessage.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', init);