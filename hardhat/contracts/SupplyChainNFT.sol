// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SupplyChainNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant ROASTER_ROLE = keccak256("ROASTER_ROLE");
    bytes32 public constant SHOP_ROLE = keccak256("SHOP_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    uint256 public nextTokenId = 1;

    struct Handoff {
        string role;
        string name;
        string location;
        string contact;
        uint256 price;
        uint256 timestamp;
    }

    struct Batch {
        uint256 tokenId;
        Handoff[] handoffs;
        string[] certificates;
    }

    mapping(uint256 => Batch) public batches;

    event BatchMinted(uint256 tokenId, address farmer);
    event HandoffAdded(uint256 tokenId, string role, string name);
    event CertificateAdded(uint256 tokenId, string cid);

    constructor(address admin) ERC721("FairTradeBeans", "FTB") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /// ✅ mintBatch MIT Farmer-Daten:
    function mintBatch(
        string memory tokenCID,
        string[] memory certCIDs,
        string memory name,
        string memory location,
        string memory contact,
        uint256 price
    ) external onlyRole(FARMER_ROLE) {
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenCID);

        batches[tokenId].tokenId = tokenId;

        for (uint i = 0; i < certCIDs.length; i++) {
            batches[tokenId].certificates.push(certCIDs[i]);
        }

        // ✅ Direkt Farmer-Handoff speichern:
        batches[tokenId].handoffs.push(Handoff({
            role: "Farmer",
            name: name,
            location: location,
            contact: contact,
            price: price,
            timestamp: block.timestamp
        }));

        emit BatchMinted(tokenId, msg.sender);
    }

    function addHandoff(
        uint256 tokenId,
        string memory name,
        string memory location,
        string memory contact,
        uint256 price
    ) external {
        require(tokenId < nextTokenId, "Token does not exist");
        string memory role = _senderRole();
        require(bytes(role).length > 0, "Not authorized");

        batches[tokenId].handoffs.push(Handoff({
            role: role,
            name: name,
            location: location,
            contact: contact,
            price: price,
            timestamp: block.timestamp
        }));

        emit HandoffAdded(tokenId, role, name);
    }

    function addCertificate(uint256 tokenId, string memory cid) external {
        require(tokenId < nextTokenId, "Token does not exist");
        require(hasRole(FARMER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), "Not allowed");
        batches[tokenId].certificates.push(cid);

        emit CertificateAdded(tokenId, cid);
    }

    function getBatch(uint256 tokenId) external view returns (
        uint256 id,
        string[] memory roles,
        string[] memory names,
        string[] memory locations,
        string[] memory contacts,
        uint256[] memory prices,
        uint256[] memory timestamps,
        string[] memory certificates
    ) {
        require(tokenId < nextTokenId, "Does not exist");
        Batch storage b = batches[tokenId];
        uint256 len = b.handoffs.length;

        roles = new string[](len);
        names = new string[](len);
        locations = new string[](len);
        contacts = new string[](len);
        prices = new uint256[](len);
        timestamps = new uint256[](len);

        for (uint i = 0; i < len; i++) {
            Handoff storage h = b.handoffs[i];
            roles[i] = h.role;
            names[i] = h.name;
            locations[i] = h.location;
            contacts[i] = h.contact;
            prices[i] = h.price;
            timestamps[i] = h.timestamp;
        }

        return (b.tokenId, roles, names, locations, contacts, prices, timestamps, b.certificates);
    }

    function _senderRole() internal view returns (string memory) {
        if (hasRole(ROASTER_ROLE, msg.sender)) return "Roaster";
        if (hasRole(SHOP_ROLE, msg.sender)) return "Shop";
        return "";
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
