require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const nft = await ethers.getContractAt(
    "FTBSupplyChain",
    process.env.CONTRACT_ADDRESS,
    signer
  );

  // OPTIONAL: Automatisch FARMER_ROLE prüfen + vergeben
  const farmerRole = await nft.FARMER_ROLE();
  if (!(await nft.hasRole(farmerRole, signer.address))) {
    console.log("Granting FARMER_ROLE to:", signer.address);
    await nft.grantRole(farmerRole, signer.address);
  }

  // Mint
  const cid = "ipfs://exampleCID";
  const tx = await nft.mintBatch(cid);
  console.log("Mint tx:", tx.hash);

  const receipt = await tx.wait();
  if (receipt.status === 0) {
    console.error("❌ Transaction reverted!");
    return;
  }

  // Event auslesen
  let tokenId = null;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== nft.target.toLowerCase()) continue;
    try {
      const parsed = nft.interface.parseLog(log);
      if (parsed.name === "BatchMinted") {
        tokenId = parsed.args.tokenId;
        break;
      }
    } catch {
      // not our event, ignore
    }
  }

  if (!tokenId) {
    console.error("❌ BatchMinted event not found!");
    return;
  }

  console.log("✅ Minted tokenId:", tokenId.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});