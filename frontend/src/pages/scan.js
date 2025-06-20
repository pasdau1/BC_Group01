import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { contract } from "../lib/contract";

export default function Scan() {
  const router = useRouter();
  const { id } = router.query;
  const [uri, setUri] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const uri = await contract.methods.tokenURI(id).call();
      setUri(uri);
      const history = await contract.methods.getHandoffHistory(id).call();
      setHistory(history);
    })();
  }, [id]);

  return (
    <main>
      <h1>NFT ID: {id}</h1>
      <p>Metadata URI: {uri}</p>
      <h2>Handoff History:</h2>
      <ul>
        {history.map((h, i) => (
          <li key={i}>{h.role} — Price: {h.price} — Doc: {h.docCID}</li>
        ))}
      </ul>
    </main>
  );
}
