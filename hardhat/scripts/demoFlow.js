// scripts/demoFlow.js  (verbose version + data-URI metadata)
const hre = require("hardhat");
const { formatEther } = hre.ethers;
const { Buffer } = require("buffer");

/* ───────── kleine Helfer ───────── */
function toEthWei(bn) {
  return `${formatEther(bn)} ETH (${bn} wei)`;
}

async function balanceOf(addr) {
  const bal = await hre.ethers.provider.getBalance(addr);
  return toEthWei(bal);
}

/* Receipt-Logger inkl. Saldo vorher/nachher */
async function step(label, signer, fn, iface) {
  const before = await signer.provider.getBalance(signer.address);
  const tx     = await fn();
  const rc     = await tx.wait();
  const after  = await signer.provider.getBalance(signer.address);
  const gasCost = rc.gasUsed * tx.gasPrice;

  console.log(`\n- ${label}`);
  console.log(`   txHash  : ${rc.hash}`);
  console.log(`   gasUsed : ${rc.gasUsed}`);
  console.log(`   gasCost : ${toEthWei(gasCost)}`);
  console.log(`   balance : ${toEthWei(before)}  →  ${toEthWei(after)}\n`);

  rc.logs
    .map(l => { try { return iface.parseLog(l); } catch { return null; } })
    .filter(Boolean)
    .forEach(ev =>
      console.log(`   → ${ev.name}(${ev.args.map(a => a.toString()).join(", ")})`)
    );

  return rc;
}

/* ───────── Hauptflow ───────── */
async function main() {
  const [deployer, farmer, roaster, shop] = await hre.ethers.getSigners();
  const NFT   = await hre.ethers.getContractFactory("SupplyChainNFT");
  const c     = await NFT.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const iface = c.interface;

  console.log("Addresses");
  console.table({
    Deployer: deployer.address,
    Farmer  : farmer.address,
    Roaster : roaster.address,
    Shop    : shop.address,
    Contract: c.target
  });

  /* ───────── Parameter ───────── */
  const farmerBase   = 1_000n;
  const farmerProof  =   900n;
  const roasterBase  = 1_500n;
  const roasterProof = 1_400n;
  const royaltyBps   = 500;

  /* ───────── Metadaten obj + data-URI ───────── */
  const metaObj = {
    name: "Coffee Batch #1",
    description: "Traceable coffee beans – demo flow",
    participants: [
      {
        role: "Farmer",
        name: "Andres Felipe",
        location: "Vereda La Esperanza 45, Kolumbien",
        contact: "felipe@example.com"
      },
      {
        role: "Roaster",
        name: "Rösterei Müller",
        location: "Rösterstraße 1, Deutschland",
        contact: "roaster@example.com"
      },
      {
        role: "Shop",
        name: "KaffeeShop GmbH",
        location: "Shopstraße 5, Deutschland",
        contact: "shop@example.com"
      }
    ],
    certificates: ["Bio", "FairTrade"]
  };
  const dataUri =
    "data:application/json;base64," +
    Buffer.from(JSON.stringify(metaObj)).toString("base64");

  /* 1 ─ Mint (Farmer) */
  await step(
    "Mint (Farmer)",
    farmer,
    () =>
      c.connect(farmer).mintBatch(
        dataUri,              // ← Metadaten inline!
        farmerBase,
        farmerProof,
        roasterBase,
        roasterProof,
        royaltyBps
      ),
    iface
  );

  /* 2 ─ Roaster zahlt 1 000 wei */
  await step(
    "Roaster-Handoff (+1 000 wei)",
    roaster,
    () => c.connect(roaster).roasterHandoff(1, { value: farmerBase }),
    iface
  );

  /* 3 ─ Shop zahlt 1 500 wei & Settled */
  await step(
    "Shop-Handoff (+1 500 wei)",
    shop,
    () => c.connect(shop).shopHandoff(1, { value: roasterBase }),
    iface
  );

  /* ───────── Summary ───────── */
  console.log("\n──── Final Balances ────");
  console.table({
    Farmer  : await balanceOf(farmer.address),
    Roaster : await balanceOf(roaster.address),
    Shop    : await balanceOf(shop.address),
    Contract: await balanceOf(c.target)
  });
  console.log("\nRoyalty-BPS:", royaltyBps);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
