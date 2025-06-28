import { ethers } from "ethers";
import ABI from "../artifacts/SupplyChainNFT.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

export function getContract() {
  return new ethers.Contract(contractAddress, ABI.abi, provider);
}

export function getWriteContract() {
  const signer = provider.getSigner(0); 
  return new ethers.Contract(contractAddress, ABI.abi, signer);
}