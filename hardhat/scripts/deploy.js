const hre = require("hardhat");

async function main() {
  const [deployer, farmer, roaster, shop] = await hre.ethers.getSigners();

  const SupplyChainNFT = await hre.ethers.getContractFactory("SupplyChainNFT");
  const contract = await SupplyChainNFT.deploy(deployer.address);
  await contract.waitForDeployment();

  console.log(`✅ Deployed to: ${await contract.getAddress()}`);

  // Rollen zuweisen
  await contract.grantRole(await contract.FARMER_ROLE(), farmer.address);
  await contract.grantRole(await contract.ROASTER_ROLE(), roaster.address);
  await contract.grantRole(await contract.SHOP_ROLE(), shop.address);

  console.log("✅ Roles assigned to test accounts");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
