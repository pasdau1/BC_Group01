const hre = require("hardhat");

async function main() {
  const [deployer, farmer, roaster, shop] = await hre.ethers.getSigners();

  const SupplyChainNFT = await hre.ethers.getContractFactory("SupplyChainNFT");
  const contract = await SupplyChainNFT.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  await contract.connect(farmer).mintBatch(
    "QmTestCID",
    ["Bio", "FairTrade"],
    "Andres Felipe",
    "Vereda La Esperanza 45, Kolumbien",
    "felipe@example.com",
    1000
  );
  console.log("✅ Farmer minted NFT mit vollständigen Daten");

  await contract.connect(roaster).addHandoff(
    1,
    "Rösterei Müller",
    "Rösterstraße 1, Deutschland",
    "roaster@example.com",
    2000
  );
  console.log("✅ Roaster added handoff");

  await contract.connect(shop).addHandoff(
    1,
    "KaffeeShop GmbH",
    "Shopstraße 5, Deutschland",
    "shop@example.com",
    3000
  );
  console.log("✅ Shop added handoff");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
