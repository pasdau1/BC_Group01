import { useState } from "react";
import { getContract } from "../lib/contract";

/* ---------- Mini-Box ---------- */
const Box = ({ title, children }) => (
  <div
    style={{
      border: "1px solid #ccc",
      padding: "1rem",
      marginBottom: "1rem",
      borderRadius: 6,
    }}
  >
    <h3>{title}</h3>
    {children}
  </div>
);

export default function Home() {
  /* ---------- State ---------- */
  const [id, setId] = useState("");
  const [batch, setBatch] = useState(null);   // on-chain Daten
  const [meta, setMeta] = useState(null);     // off-chain JSON
  const [err, setErr] = useState("");

  /* ---------- Fetch ---------- */
  async function fetchBatch() {
    try {
      const c = getContract();
      const nId = Number(id);

      /* 1 ─ On-Chain */
      const r = await c.getBatch(nId);
      setBatch({
        tokenId: r[0].toString(),
        farmerAddr: r[1],
        roasterAddr: r[2],
        shopAddr: r[3],
        farmerBase: r[4].toString(),
        farmerProof: r[5].toString(),
        roasterBase: r[6].toString(),
        roasterProof: r[7].toString(),
        roasterSeen: r[8],
        shopSeen: r[9],
        settled: r[10],
      });

      /* 2 ─ Off-Chain (tokenURI) */
      try {
        const uri = await c.tokenURI(nId);
        const url = uri.startsWith("ipfs://")
          ? `https://ipfs.io/ipfs/${uri.slice(7)}`
          : uri;
        const json = await fetch(url).then((res) => res.json());
        setMeta(json); // {participants[], certificates[]}
      } catch {
        setMeta(null);
      }
      setErr("");
    } catch (e) {
      setErr(e.message);
      setBatch(null);
      setMeta(null);
    }
  }

  /* ---------- helper: Person nach Rolle ---------- */
  const info = (role) => meta?.participants?.find((p) => p.role === role);

  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Supply Chain NFT Tracker</h1>

      <label>
        Token&nbsp;ID:&nbsp;
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ marginRight: 8 }}
        />
      </label>
      <button onClick={fetchBatch}>Fetch</button>

      {err && <p style={{ color: "red" }}>Error: {err}</p>}

      {batch && (
        <>
          <h2 style={{ marginTop: 24 }}>Batch #{batch.tokenId}</h2>

          {/* Farmer */}
          <Box title="Farmer">
            {info("Farmer") && (
              <>
                <p><b>Name:</b> {info("Farmer").name}</p>
                <p><b>Location:</b> {info("Farmer").location}</p>
                <p><b>Contact:</b> {info("Farmer").contact}</p>
              </>
            )}
            <p><b>Adresse:</b> {batch.farmerAddr}</p>
            <p>
              <b>Preis:</b> {batch.farmerBase} → {batch.farmerProof}
            </p>
          </Box>

          {/* Roaster */}
          <Box title="Roaster">
            {info("Roaster") && (
              <>
                <p><b>Name:</b> {info("Roaster").name}</p>
                <p><b>Location:</b> {info("Roaster").location}</p>
                <p><b>Contact:</b> {info("Roaster").contact}</p>
              </>
            )}
            <p><b>Adresse:</b> {batch.roasterAddr || "—"}</p>
            <p>
              <b>Preis:</b> {batch.roasterBase} → {batch.roasterProof}
            </p>
            <p><b>Handoff:</b> {batch.roasterSeen ? "✓" : "✗"}</p>
          </Box>

          {/* Shop */}
          <Box title="Shop">
            {info("Shop") && (
              <>
                <p><b>Name:</b> {info("Shop").name}</p>
                <p><b>Location:</b> {info("Shop").location}</p>
                <p><b>Contact:</b> {info("Shop").contact}</p>
              </>
            )}
            <p><b>Adresse:</b> {batch.shopAddr || "—"}</p>
            <p>
              <b>Refund:</b>{" "}
              {Number(batch.roasterBase) - Number(batch.roasterProof)}
            </p>
            <p><b>Handoff:</b> {batch.shopSeen ? "✓" : "✗"}</p>
          </Box>

          {/* Status */}
          <Box title="Batch-Status">
            <p>
              Roaster&nbsp;✓? {batch.roasterSeen ? "ja" : "nein"} •&nbsp;
              Shop&nbsp;✓? {batch.shopSeen ? "ja" : "nein"} •&nbsp;
              Settled&nbsp;{batch.settled ? "✓" : "✗"}
            </p>
          </Box>

          {/* Certificates */}
          <Box title="Certificates">
            {meta?.certificates?.length ? (
              <ul>
                {meta.certificates.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Box>
        </>
      )}
    </main>
  );
}
