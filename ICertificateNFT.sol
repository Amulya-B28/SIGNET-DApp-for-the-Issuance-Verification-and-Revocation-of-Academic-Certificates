// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICertificateNFT
 * @notice Interface for the NFT contract.
 * It defines the functions our Manager can call.
 */
interface ICertificateNFT {
    /**
     * @notice Mints a new NFT to a student.
     * @return The ID of the newly minted token.
     */
    function mintCertificate(address studentAddress, string memory tokenURI) external returns (uint256);

    /**
     * @notice Burns (destroys) an NFT.
     * @param tokenId The ID of the token to burn.
     */
    function adminBurn(uint256 tokenId) external;
}