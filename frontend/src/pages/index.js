import { useState } from "react";
import { getContract } from "../lib/contract";

export default function Home() {
  const [id, setId] = useState("");
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState("");

  const fetchBatch = async () => {
    try {
      const contract = getContract(); // 💡 HIER

      const [
        tokenId,
        roles,
        names,
        locations,
        contacts,
        prices,
        timestamps,
        certificates
      ] = await contract.getBatch(Number(id));

      const cleanBatch = {
        tokenId: tokenId.toString(),
        roles,
        names,
        locations,
        contacts,
        prices: prices.map(p => p.toString()),
        timestamps: timestamps.map(t => t.toString()),
        certificates
      };

      setBatch(cleanBatch);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Supply Chain NFT Tracker</h1>
      <label>
        Token ID:{" "}
        <input
          value={id}
          onChange={e => setId(e.target.value)}
          placeholder="Enter Token ID"
        />
      </label>
      <button onClick={fetchBatch}>Fetch</button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {batch && (
        <div>
          <h2>Batch ID: {batch.tokenId}</h2>

          {batch.roles.map((role, index) => (
            <div key={index} style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ddd" }}>
              <h3>{role}</h3>
              <p><strong>Name:</strong> {batch.names[index]}</p>
              <p><strong>Location:</strong> {batch.locations[index]}</p>
              <p><strong>Contact:</strong> {batch.contacts[index]}</p>
              <p><strong>Price:</strong> {batch.prices[index]}</p>
              <p><strong>Timestamp:</strong> {batch.timestamps[index]}</p>
            </div>
          ))}

          <h3>Certificates</h3>
          <ul>
            {batch.certificates.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
