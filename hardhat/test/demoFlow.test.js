const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChainNFT Demo Flow", function () {
  let supplyChain, deployer, farmer, roaster, shop;

  before(async function () {
    [deployer, farmer, roaster, shop] = await ethers.getSigners();

    const SupplyChainNFT = await ethers.getContractFactory("SupplyChainNFT");
    supplyChain = await SupplyChainNFT.deploy(deployer.address);
    await supplyChain.waitForDeployment();

    console.log(`✅ Contract deployed at: ${supplyChain.target}`);

    // Rollen vergeben:
    const FARMER_ROLE = await supplyChain.FARMER_ROLE();
    const ROASTER_ROLE = await supplyChain.ROASTER_ROLE();
    const SHOP_ROLE = await supplyChain.SHOP_ROLE();

    await supplyChain.grantRole(FARMER_ROLE, farmer.address);
    await supplyChain.grantRole(ROASTER_ROLE, roaster.address);
    await supplyChain.grantRole(SHOP_ROLE, shop.address);
  });

  it("Farmer mints a batch NFT with certificates and own handoff", async function () {
    await supplyChain.connect(farmer).mintBatch(
      "QmBatchCID",                  // NFT CID
      ["Cert1", "Cert2"],            // Zertifikate
      "Farmer Juan",                 // Name
      "Coffee Road 1, Bogotá, Colombia", // Location
      "farmer@example.com",          // Kontakt
      1000                           // Preis
    );

    expect(await supplyChain.nextTokenId()).to.equal(2); // TokenId 1 wurde vergeben
    expect(await supplyChain.ownerOf(1)).to.equal(farmer.address);
  });

  it("Roaster adds a handoff", async function () {
    await supplyChain.connect(roaster).addHandoff(
      1,
      "Roaster Müller",
      "Roaster Street 1, Munich, Germany",
      "roaster@example.com",
      2000
    );
  });

  it("Shop adds a handoff", async function () {
    await supplyChain.connect(shop).addHandoff(
      1,
      "Coffee Shop GmbH",
      "Shop Avenue 5, Berlin, Germany",
      "shop@example.com",
      3000
    );
  });

  it("Should get batch data with all handoffs & certificates", async function () {
    const [
      id,
      roles,
      names,
      locations,
      contacts,
      prices,
      timestamps,
      certificates
    ] = await supplyChain.getBatch(1);

    expect(id).to.equal(1);
    expect(roles.length).to.equal(3); // Farmer + Roaster + Shop
    expect(names[0]).to.equal("Farmer Juan");
    expect(names[1]).to.equal("Roaster Müller");
    expect(names[2]).to.equal("Coffee Shop GmbH");
    expect(certificates.length).to.equal(2);
  });
});
