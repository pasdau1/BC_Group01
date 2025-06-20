const { expect } = require("chai");
require("@nomicfoundation/hardhat-toolbox");

describe("NFT Supply Chain", () => {
  let nft, farmer, roaster;

  beforeEach(async () => {
    [farmer, roaster] = await ethers.getSigners();
    const C = await ethers.getContractFactory("FairTradeSupplyChain");
    nft = await C.deploy();
    await nft.grantRole(await nft.FARMER_ROLE(), farmer.address);
    await nft.grantRole(await nft.ROASTER_ROLE(), roaster.address);
  });

  it("farmer mints & roaster appends", async () => {
    const tx = await nft.connect(farmer).mintBatch("ipfs://init");
    const id = (await tx.wait()).logs[0].args.tokenId;
    await nft.connect(roaster).appendHandoff(id, "ipfs://roast");
    const hist = await nft.handoffHistory(id);
    expect(hist.length).to.equal(2);
    expect(hist[1].role).to.equal("Roaster");
  });
});