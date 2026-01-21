// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @notice This is the NFT (ERC-721) contract for the diplomas.
 * @dev It is "Ownable", and its owner MUST be the FinalCertificateManager contract.
 */
contract CertificateNFT is ERC721URIStorage, Ownable {
    
    // Use a simple counter
    uint256 private _tokenIdCounter;

    /**
     * @notice Sets up the NFT collection.
     */
    constructor(address initialOwner)
        ERC721("DecentralizedCertificate", "DCERT") // Call the ERC721 constructor
        Ownable(initialOwner)                       // Call the Ownable constructor
    {
        _tokenIdCounter = 1; // Start at 1
    }

    /**
     * @notice The main minting function. Only the owner (the Manager contract) can call this.
     */
    function mintCertificate(address studentAddress, string memory tokenURI)
        public
        onlyOwner
        returns (uint256)
    {
        uint256 newTokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(studentAddress, newTokenId);
        
        // This function comes from ERC721URIStorage
        _setTokenURI(newTokenId, tokenURI);

        return newTokenId;
    }

    /**
     * @notice A special function to allow the owner (the Manager) to burn a token.
     */
    function adminBurn(uint256 tokenId) public onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist."); 
        _burn(tokenId);
    }

    // --- NEW: SOULBOUND LOGIC ---
    /**
     * @notice Overrides the standard transfer function to BLOCK transfers.
     * This ensures the NFT is "Soulbound" to the student.
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow Minting (from 0 to Student)
        // Allow Burning (from Student to 0)
        // BLOCK Transfer (from Student A to Student B)
        if (from != address(0) && to != address(0)) {
            revert("CertiChain: Certificates are Soulbound and cannot be transferred");
        }

        return super._update(to, tokenId, auth);
    }
}