require("dotenv").config();
const { ethers } = require("hardhat");

const tokenId = process.env.TOKEN_ID;
const cid = process.env.CID;

if (!tokenId || !cid) {
  console.error("❌ Please set TOKEN_ID and CID as environment variables!");
  process.exit(1);
}

async function main() {
  const [signer] = await ethers.getSigners();
  const nft = await ethers.getContractAt(
    "FTBSupplyChain",
    process.env.CONTRACT_ADDRESS,
    signer
  );

  const tx = await nft.appendHandoff(tokenId, cid);
  console.log("Append tx:", tx.hash);

  const rc = await tx.wait();
  if (rc.status === 0) {
    console.error("❌ Transaction reverted!");
    return;
  }

  console.log(`✅ Handoff appended to tokenId: ${tokenId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});