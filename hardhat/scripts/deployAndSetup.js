const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  const admin = signers[0];
  const roaster = signers[1] || signers[0];
  const retailer = signers[2] || signers[0];

  console.log(`Deploy from: ${admin.address}`);
  console.log(`Roaster will be: ${roaster.address}`);
  console.log(`Retailer will be: ${retailer.address}`);

  const FTB = await hre.ethers.getContractFactory("FTBSupplyChain");
  const nft = await FTB.deploy();
  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  console.log(`✅ Deployed at: ${contractAddress}`);

  await nft.grantRole(await nft.FARMER_ROLE(), admin.address);
  await nft.grantRole(await nft.ROASTER_ROLE(), roaster.address);
  await nft.grantRole(await nft.RETAILER_ROLE(), retailer.address);

  console.log(`✅ Roles granted:
 FARMER: ${admin.address}
 ROASTER: ${roaster.address}
 RETAILER: ${retailer.address}
  `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
