// --- 1. EDIT THIS ---
// Paste your deployed FinalCertificateManager address
const managerAddress = "0x344aEDeEa0BaC2C3efc163FD3051E862509A4D76";
const nftAddress = "0x964e063D29F7adf9453D11DB83813Ab09cc5428A";
// This is a public, read-only "gateway" to the Sepolia blockchain.
const sepoliaRPC = "https://eth-sepolia.g.alchemy.com/v2/kISazI6GNDXLr2ZPkBenP";

const managerABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_certificateId",
				"type": "bytes32"
			}
		],
		"name": "acceptCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_institutionAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "addInstitution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_studentAddresses",
				"type": "address[]"
			},
			{
				"internalType": "string[]",
				"name": "_studentNames",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_credentialNames",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "_tokenURIs",
				"type": "string[]"
			}
		],
		"name": "batchIssueCertificates",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "certificateId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			}
		],
		"name": "CertificateAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "certificateId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "nftTokenId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			}
		],
		"name": "CertificateIssued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "certificateId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "nftTokenId",
				"type": "uint256"
			}
		],
		"name": "CertificateRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "institutionAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "InstitutionAuthorized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "institutionAddress",
				"type": "address"
			}
		],
		"name": "InstitutionRevoked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_studentName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_credentialName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_tokenURI",
				"type": "string"
			}
		],
		"name": "issueCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_certificateId",
				"type": "bytes32"
			}
		],
		"name": "revokeCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_institutionAddress",
				"type": "address"
			}
		],
		"name": "revokeInstitution",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_nftContractAddress",
				"type": "address"
			}
		],
		"name": "setNftContractAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "certificates",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "nftTokenId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "studentName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "credentialName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "tokenURI",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "issuingInstitution",
				"type": "address"
			},
			{
				"internalType": "enum FinalCertificateManager.CertificateStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_certificateId",
				"type": "bytes32"
			}
		],
		"name": "getCertificateDetails",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "id",
						"type": "bytes32"
					},
					{
						"internalType": "uint256",
						"name": "nftTokenId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "studentName",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "studentAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "credentialName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "tokenURI",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "issueDate",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "issuingInstitution",
						"type": "address"
					},
					{
						"internalType": "enum FinalCertificateManager.CertificateStatus",
						"name": "status",
						"type": "uint8"
					}
				],
				"internalType": "struct FinalCertificateManager.Certificate",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			}
		],
		"name": "getStudentCertificates",
		"outputs": [
			{
				"internalType": "bytes32[]",
				"name": "",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "institutions",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isAuthorized",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nftContract",
		"outputs": [
			{
				"internalType": "contract ICertificateNFT",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "studentCertificates",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// --- NO MORE EDITS NEEDED ---

// --- Global Variables (Read-Only) ---
const provider = new ethers.providers.JsonRpcProvider(sepoliaRPC);
const contract = new ethers.Contract(managerAddress, managerABI, provider);

// --- DOM Elements ---
const verifyInstForm = document.getElementById('verifyInstitutionForm');
const instAddressInput = document.getElementById('inst-verify-address');
const instResultsDiv = document.getElementById('inst-verify-results');

const verifyStudentForm = document.getElementById('verifyStudentForm');
const studentAddressInput = document.getElementById('student-verify-address');
const studentResultsDiv = document.getElementById('student-verify-results');

const verifyCertForm = document.getElementById('verifyCertificateForm');
const certIdInput = document.getElementById('cert-verify-id');
const certResultsDiv = document.getElementById('cert-verify-results');


// --- 1. Verify Institution Handler ---
async function handleVerifyInstitution(event) {
    event.preventDefault();
    const address = instAddressInput.value;
    
    // Basic validation
    if (!address || !ethers.utils.isAddress(address)) {
        instResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">Invalid Input</span></h4><p>Please enter a valid Ethereum address.</p>`;
        instResultsDiv.classList.remove('hidden');
        return;
    }

    instResultsDiv.classList.remove('hidden');
    instResultsDiv.innerHTML = '<h4>Verifying...</h4>';

    try {
        const institution = await contract.institutions(address);

        if (institution.isAuthorized) {
            instResultsDiv.innerHTML = `
                <h4>Result: <span class="status-accepted">VALID</span></h4>
                <p><span>Name:</span> ${institution.name}</p>
                <p><span>Address:</span> ${address}</p>
                <p>This address is an authorized institution.</p>
            `;
        } else {
            instResultsDiv.innerHTML = `
                <h4>Result: <span class="status-revoked">NOT AUTHORIZED</span></h4>
                <p>This address is not listed as an authorized institution.</p>
            `;
        }
    } catch (error) {
        console.error("Failed to verify institution:", error);
        instResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">ERROR</span></h4><p>Failed to read from the contract. See console.</p>`;
    }
}

// --- 2. Verify Student Handler (UPDATED) ---
async function handleVerifyStudent(event) {
    event.preventDefault();
    const address = studentAddressInput.value;

    if (!address || !ethers.utils.isAddress(address)) {
        studentResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">Invalid Input</span></h4><p>Please enter a valid Ethereum address.</p>`;
        studentResultsDiv.classList.remove('hidden');
        return;
    }

    studentResultsDiv.classList.remove('hidden');
    studentResultsDiv.innerHTML = '<h4>Verifying...</h4>';

    try {
        // Get all certificate IDs for this student
        const certIds = await contract.getStudentCertificates(address);

        if (certIds.length > 0) {
            // We want to show the student's name and their latest credential/institution
            // So we must fetch details for at least one certificate (the latest one)
            const latestCertId = certIds[certIds.length - 1];
            const certDetails = await contract.getCertificateDetails(latestCertId);
            
            // Fetch the institution name for this certificate
            const institution = await contract.institutions(certDetails.issuingInstitution);

            studentResultsDiv.innerHTML = `
                <h4>Result: <span class="status-accepted">STUDENT FOUND</span></h4>
                <p><span>Name:</span> ${certDetails.studentName}</p>
                <p><span>Latest Institution:</span> ${institution.name}</p>
                <p><span>Latest Credential:</span> ${certDetails.credentialName}</p>
                <p><span>Total Certificates:</span> ${certIds.length}</p>
                <p style="font-size: 0.8em; color: #aaa;">Address: ${address}</p>
            `;
        } else {
            studentResultsDiv.innerHTML = `
                <h4>Result: <span class="status-revoked">NOT FOUND</span></h4>
                <p>This address does not hold any certificates in this system.</p>
            `;
        }
    } catch (error) {
        console.error("Failed to verify student:", error);
        studentResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">ERROR</span></h4><p>Failed to read from the contract. See console.</p>`;
    }
}


// --- 3. Verify Certificate Handler (UPDATED) ---
async function handleVerifyCertificate(event) {
    event.preventDefault();
    const certId = certIdInput.value;

    if (!certId || !certId.startsWith('0x') || certId.length !== 66) {
        certResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">Invalid Input</span></h4><p>Please enter a valid 32-byte certificate ID (e.g., 0x...).</p>`;
        certResultsDiv.classList.remove('hidden');
        return;
    }

    certResultsDiv.classList.remove('hidden');
    certResultsDiv.innerHTML = '<h4>Verifying...</h4>';

    try {
        // 1. Get the certificate details
        const cert = await contract.getCertificateDetails(certId);

        // 2. Check if it even exists (status 0 = None)
        if (cert.status === 0) {
            certResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">NOT FOUND</span></h4><p>No certificate exists with this ID.</p>`;
            return;
        }

        // 3. Get the institution's details
        const institution = await contract.institutions(cert.issuingInstitution);
        const institutionName = institution.name;
        
        // 4. Use the NFT Contract Address from constants.js to build the Etherscan link
        const etherscanLink = `https://sepolia.etherscan.io/token/${nftAddress}?a=${cert.nftTokenId.toString()}`;
        
        // --- Format the output ---
        let statusText, statusClass;
        if (cert.status === 1) { // Pending
            statusText = 'PENDING (Waiting for Student Acceptance)';
            statusClass = 'status-pending';
        } else if (cert.status === 2) { // Accepted
            statusText = 'VALID (Accepted by Student)';
            statusClass = 'status-accepted';
        } else if (cert.status === 3) { // Revoked
            statusText = 'REVOKED by Institution';
            statusClass = 'status-revoked';
        }

        certResultsDiv.innerHTML = `
            <h4>Verification Result: <span class="${statusClass}">${statusText}</span></h4>
            
            <p><span>Certificate Name:</span> ${cert.credentialName}</p>
            <p><span>Certificate Holder:</span> ${cert.studentName} (${cert.studentAddress.substring(0, 6)}...)</p>
            <p><span>Issuer:</span> ${institutionName}</p>
            <p><span>NFT ID:</span> ${cert.nftTokenId.toString()}</p>
            
            <div style="margin-top: 15px;">
                <a href="${etherscanLink}" target="_blank" style="color: #3498db; text-decoration: none; font-weight: bold;">View on Etherscan ↗</a>
            </div>
        `;

    } catch (error) {
        console.error("Failed to verify certificate:", error);
        certResultsDiv.innerHTML = `<h4>Result: <span class="status-revoked">ERROR</span></h4><p>Failed to read from the contract. Check the ID and console.</p>`;
    }
}

// --- Attach the listeners ---
verifyInstForm.addEventListener('submit', handleVerifyInstitution);
verifyStudentForm.addEventListener('submit', handleVerifyStudent);
verifyCertForm.addEventListener('submit', handleVerifyCertificate);