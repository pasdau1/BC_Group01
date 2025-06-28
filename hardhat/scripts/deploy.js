// scripts/deploy.js
const hre = require("hardhat");
const { formatEther } = hre.ethers;

async function main() {
  const [deployer, farmer, roaster, shop] = await hre.ethers.getSigners();

  console.log("┌─ Deployer:", deployer.address);
  console.log("├─ Farmer:  ", farmer.address);
  console.log("├─ Roaster: ", roaster.address);
  console.log("└─ Shop:    ", shop.address, "\n");

  const SupplyChainNFT = await hre.ethers.getContractFactory("SupplyChainNFT");
  const txDeploy = await SupplyChainNFT.deploy(deployer.address);
  const contract = await txDeploy.waitForDeployment();

  const address = await contract.getAddress();
  const receiptDeploy = await txDeploy.deploymentTransaction().wait();

  console.log(`✅ Deployed  : ${address}`);
  console.log(`  txHash     : ${receiptDeploy.hash}`);
  console.log(`  gasUsed    : ${receiptDeploy.gasUsed}\n`);

  // --- Roles -------------------------------------------------
  const grant = (role, signer) =>
    contract.grantRole(role, signer.address);

  const tx1 = await grant(await contract.FARMER_ROLE(), farmer);
  const tx2 = await grant(await contract.ROASTER_ROLE(), roaster);
  const tx3 = await grant(await contract.SHOP_ROLE(), shop);

  await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);

  console.log("✅ Roles assigned:");
  console.table([
    ["FARMER_ROLE", farmer.address],
    ["ROASTER_ROLE", roaster.address],
    ["SHOP_ROLE",   shop.address],
  ]);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
