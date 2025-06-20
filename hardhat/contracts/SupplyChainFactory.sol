// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SupplyChainNFT.sol";

contract SupplyChainFactory {
    SupplyChainNFT public nftContract;

    constructor(address admin) {
        nftContract = new SupplyChainNFT(admin);
        nftContract.grantRole(nftContract.FARMER_ROLE(), admin);
    }

    function getNFTAddress() external view returns (address) {
        return address(nftContract);
    }
}
