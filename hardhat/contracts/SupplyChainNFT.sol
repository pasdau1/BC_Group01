// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/// @title Supply-Chain NFT  –  Escrow-Nachlass für Roaster *und* Shop + Royalty
/// Ablauf-Beispiel (wei):  
///  • FarmerBase 1 000 → FarmerProof  900  
///  • RoasterBase 1 500 → RoasterProof 1 400  
///  Roaster zahlt 1 000 → Shop zahlt 1 500 → Settlement verteilt  
///     900 (Farmer) | 1 400 (Roaster) | 100 (Shop-Refund)
contract SupplyChainNFT is ERC721URIStorage, AccessControl, ERC2981 {
    /* ───── Rollen ───── */
    bytes32 public constant FARMER_ROLE  = keccak256("FARMER_ROLE");
    bytes32 public constant ROASTER_ROLE = keccak256("ROASTER_ROLE");
    bytes32 public constant SHOP_ROLE    = keccak256("SHOP_ROLE");
    bytes32 public constant ADMIN_ROLE   = keccak256("ADMIN_ROLE");

    uint256 public nextTokenId = 1;

    /* ───── Daten ───── */
    struct Prices {
        uint256 farmerBase;
        uint256 farmerProof;
        uint256 roasterBase;
        uint256 roasterProof;
    }
    struct Flags {
        bool roasterSeen;
        bool shopSeen;
        bool settled;
    }
    struct Batch {
        address farmer;
        address roaster;
        address shop;
        Prices  p;
        Flags   f;
    }
    mapping(uint256 => Batch) public batches;

    /* ───── Events ───── */
    event BatchMinted(uint256 indexed id, address farmer);
    event RoasterHandoff(uint256 indexed id);
    event ShopHandoff(uint256 indexed id);
    event IncentiveSettled(
        uint256 indexed id,
        uint256 toFarmer,
        uint256 refundRoaster,
        uint256 refundShop
    );

    /* ───── Constructor ───── */
    constructor(address admin) ERC721("FairTradeBeans", "FTB") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE,  admin);
        _grantRole(FARMER_ROLE, admin);
    }

    /* ───── 1 · Mint ───── */
    function mintBatch(
        string  calldata tokenURI,
        uint256 farmerBase,
        uint256 farmerProof,
        uint256 roasterBase,
        uint256 roasterProof,
        uint96  royaltyBps
    ) external onlyRole(FARMER_ROLE) {
        require(farmerProof  < farmerBase,  "farmerProof >= base");
        require(roasterProof < roasterBase, "roasterProof >= base");
        require(royaltyBps   <= 10_000,     "bps > 100");

        uint256 id = nextTokenId++;
        _safeMint(msg.sender, id);
        _setTokenURI(id, tokenURI);
        _setTokenRoyalty(id, msg.sender, royaltyBps);

        batches[id] = Batch({
            farmer:  msg.sender,
            roaster: address(0),
            shop:    address(0),
            p:       Prices(farmerBase, farmerProof, roasterBase, roasterProof),
            f:       Flags(false,false,false)
        });
        emit BatchMinted(id, msg.sender);
    }

    /* ───── 2 · Roaster ───── */
    function roasterHandoff(uint256 id)
        external
        payable
        onlyRole(ROASTER_ROLE)
    {
        Batch storage b = batches[id];
        require(!b.f.roasterSeen,            "Roaster done");
        require(msg.value == b.p.farmerBase, "pay farmerBase");

        b.roaster       = msg.sender;
        b.f.roasterSeen = true;
        emit RoasterHandoff(id);
    }

    /* ───── 3 · Shop ───── */
    function shopHandoff(uint256 id)
        external
        payable
        onlyRole(SHOP_ROLE)
    {
        Batch storage b = batches[id];
        require(b.f.roasterSeen,              "Roaster first");
        require(!b.f.shopSeen,                "Shop done");
        require(msg.value == b.p.roasterBase, "pay roasterBase");

        b.shop       = msg.sender;
        b.f.shopSeen = true;
        emit ShopHandoff(id);
        _settle(id);
    }

    /* ───── Settlement ───── */
    function _settle(uint256 id) internal {
        Batch storage b = batches[id];
        if (b.f.roasterSeen && b.f.shopSeen && !b.f.settled) {
            uint256 refundR = b.p.farmerBase  - b.p.farmerProof;   // 100
            uint256 refundS = b.p.roasterBase - b.p.roasterProof;  // 100
            uint256 toFarmer  = b.p.farmerProof;                   // 900
            uint256 toRoaster = b.p.roasterProof + refundR;        // 1 400

            payable(b.roaster).transfer(toRoaster);
            payable(b.shop).transfer(refundS);
            payable(b.farmer).transfer(toFarmer);

            b.f.settled = true;
            emit IncentiveSettled(id, toFarmer, refundR, refundS);
        }
    }

    /* ───── View-Funktion für Front-End ───── */
    function getBatch(uint256 id) external view returns (
        uint256 tokenId,
        address farmer,
        address roaster,
        address shop,
        uint256 farmerBase,
        uint256 farmerProof,
        uint256 roasterBase,
        uint256 roasterProof,
        bool    roasterSeen,
        bool    shopSeen,
        bool    settled
    ) {
        require(id > 0 && id < nextTokenId, "bad id");
        Batch storage b = batches[id];
        return (
            id,
            b.farmer,
            b.roaster,
            b.shop,
            b.p.farmerBase,
            b.p.farmerProof,
            b.p.roasterBase,
            b.p.roasterProof,
            b.f.roasterSeen,
            b.f.shopSeen,
            b.f.settled
        );
    }

    /* ───── Interface Support ───── */
    function supportsInterface(bytes4 i)
        public
        view
        override(ERC721URIStorage, AccessControl, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(i);
    }
}
