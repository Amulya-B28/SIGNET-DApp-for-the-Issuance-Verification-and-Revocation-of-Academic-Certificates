// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import the interface so we can talk to the NFT contract
import "./ICertificateNFT.sol";

/**
 * @title FinalCertificateManager
 * @notice This is the main "Registrar" contract.
 * It manages roles, certificate status, and controls the NFT contract.
 */
contract FinalCertificateManager {

    // --- ENUM FOR STATUS ---
    enum CertificateStatus {
        None,     // Default value, certificate doesn't exist
        Pending,  // Issued by institution, waiting for student to accept
        Accepted, // Confirmed by the student
        Revoked   // Revoked by the institution
    }

    // --- STATE VARIABLES ---
    address public owner;

    // The address of the CertificateNFT contract this Manager controls
    ICertificateNFT public nftContract;

    struct Institution {
        string name;
        bool isAuthorized;
    }

    struct Certificate {
        bytes32 id;                 // Unique ID (from hash)
        uint256 nftTokenId;         // The ID of the NFT on the other contract
        string studentName;
        address studentAddress;     // Address of the student
        string credentialName;
        string tokenURI;            // The IPFS metadata link (ipfs://Qm...)
        uint256 issueDate;
        address issuingInstitution;
        CertificateStatus status;   // The "source of truth"
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(address => Institution) public institutions;
    mapping(address => bytes32[]) public studentCertificates;

    // --- EVENTS ---
    event CertificateIssued(bytes32 indexed certificateId, uint256 indexed nftTokenId, address indexed studentAddress);
    event CertificateAccepted(bytes32 indexed certificateId, address indexed studentAddress);
    event CertificateRevoked(bytes32 indexed certificateId, uint256 indexed nftTokenId);
    event InstitutionAuthorized(address indexed institutionAddress, string name);
    event InstitutionRevoked(address indexed institutionAddress);

    // --- MODIFIERS ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }
    modifier onlyAuthorized() {
        require(institutions[msg.sender].isAuthorized, "Caller is not an authorized institution.");
        _;
    }

    // --- FUNCTIONS ---

    constructor() {
        owner = msg.sender;
    }

    // --- ROLE: Owner (Admin) ---

    /**
     * @notice Allows the owner to link this Manager to the deployed NFT contract.
     * @dev This must be called ONE time after deployment.
     */
    function setNftContractAddress(address _nftContractAddress) public onlyOwner {
        require(address(nftContract) == address(0), "NFT Contract is already set.");
        nftContract = ICertificateNFT(_nftContractAddress);
    }

    function addInstitution(address _institutionAddress, string memory _name) public onlyOwner {
        require(_institutionAddress != address(0), "Invalid address");
        institutions[_institutionAddress] = Institution(_name, true);
        emit InstitutionAuthorized(_institutionAddress, _name);
    }

    function revokeInstitution(address _institutionAddress) public onlyOwner {
        institutions[_institutionAddress].isAuthorized = false;
        emit InstitutionRevoked(_institutionAddress);
    }

    // --- ROLE: Institution ---
    
    /**
     * @notice Internal helper function to create a unique ID.
     */
    function generateCertificateId(address _studentAddress, string memory _credentialName) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_studentAddress, _credentialName));
    }

    /**
     * @notice Allows an authorized institution to issue a new certificate.
     */
    function issueCertificate(
        address _studentAddress,
        string memory _studentName,
        string memory _credentialName,
        string memory _tokenURI
    ) public onlyAuthorized {
        require(address(nftContract) != address(0), "NFT Contract is not set.");
        bytes32 certificateId = generateCertificateId(_studentAddress, _credentialName);
        require(certificates[certificateId].status == CertificateStatus.None, "Certificate already issued.");

        // --- STEP 1: Command the NFT contract to mint ---
        uint256 newNftTokenId = nftContract.mintCertificate(_studentAddress, _tokenURI);

        // --- STEP 2: Create the internal record ---
        Certificate memory newCertificate = Certificate({
            id: certificateId,
            nftTokenId: newNftTokenId,
            studentName: _studentName,
            studentAddress: _studentAddress,
            credentialName: _credentialName,
            tokenURI: _tokenURI,
            issueDate: block.timestamp,
            issuingInstitution: msg.sender,
            status: CertificateStatus.Pending // Starts as Pending!
        });

        // --- STEP 3: Save and Emit ---
        certificates[certificateId] = newCertificate;
        studentCertificates[_studentAddress].push(certificateId);
        emit CertificateIssued(certificateId, newNftTokenId, _studentAddress);
    }

    /**
     * @notice NEW: Allows an institution to issue multiple certificates at once.
     */
    function batchIssueCertificates(
        address[] memory _studentAddresses,
        string[] memory _studentNames,
        string[] memory _credentialNames,
        string[] memory _tokenURIs
    ) public onlyAuthorized {
        require(
            _studentAddresses.length == _studentNames.length &&
            _studentNames.length == _credentialNames.length &&
            _credentialNames.length == _tokenURIs.length,
            "Input arrays must have the same length."
        );

        for (uint256 i = 0; i < _studentAddresses.length; i++) {
            // Call the single issue function to re-use its logic
            issueCertificate(
                _studentAddresses[i],
                _studentNames[i],
                _credentialNames[i],
                _tokenURIs[i]
            );
        }
    }


    // --- ROLE: Student ---

    /**
     * @notice Allows a student to accept a certificate issued to them.
     */
    function acceptCertificate(bytes32 _certificateId) public {
        Certificate storage cert = certificates[_certificateId];
        require(cert.status == CertificateStatus.Pending, "Certificate is not pending acceptance.");
        require(cert.studentAddress == msg.sender, "Only the intended student can accept this.");

        cert.status = CertificateStatus.Accepted;
        emit CertificateAccepted(_certificateId, msg.sender);
    }

    // --- ROLE: Institution (or Owner) ---

    /**
     * @notice Allows the issuing institution (or owner) to revoke a certificate.
     * @dev This sets the status to Revoked AND burns the student's NFT.
     */
    function revokeCertificate(bytes32 _certificateId) public {
        Certificate storage cert = certificates[_certificateId];
        require(cert.status == CertificateStatus.Pending || cert.status == CertificateStatus.Accepted, "Certificate not in a revokable state.");
        
        // Security: Only the original issuer OR the contract owner can revoke
        require(cert.issuingInstitution == msg.sender || owner == msg.sender, "Caller is not authorized to revoke.");

        uint256 nftToBurn = cert.nftTokenId;
        cert.status = CertificateStatus.Revoked;

        // --- STEP 2: Command the NFT contract to burn the token ---
        nftContract.adminBurn(nftToBurn);

        emit CertificateRevoked(_certificateId, nftToBurn);
    }

    // --- ROLE: Verifier (or anyone) ---

    /**
     * @notice Retrieves all certificate IDs for a given student. (Student Dashboard)
     */
    function getStudentCertificates(address _studentAddress) public view returns (bytes32[] memory) {
        return studentCertificates[_studentAddress];
    }

    /**
     * @notice Retrieves the full details for one certificate. (Verifier's Page)
     */
    function getCertificateDetails(bytes32 _certificateId) public view returns (Certificate memory) {
        return certificates[_certificateId];
    }
}