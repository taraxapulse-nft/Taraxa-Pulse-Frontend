import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Existing imports
import { globalStyles } from "./theme";
import Header from "./components/layout/Header";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import NftGrid from "./components/nfts/NftGrid";
import NftModal from "./components/nfts/NftModal";
import Loader from "./components/ui/Loader";
import ErrorMessage from "./components/ui/ErrorMessage";
import StatusDisplay from "./components/ui/StatusDisplay";
import contractAddresses from "./contract-addresses.json";
import contractAbis from "./contract-abis.json";

// IPFS helpers
const fetchWithTimeout = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

const buildGatewayUrls = (ipfsUri) => {
  if (!ipfsUri.startsWith("ipfs://")) return [ipfsUri];
  const cid = ipfsUri.replace("ipfs://", "").split("/")[0];
  const path = ipfsUri.replace(`ipfs://${cid}/`, "");
  return [
    `https://${cid}.ipfs.w3s.link/${path}`,
    `https://ipfs.io/ipfs/${cid}/${path}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}/${path}`,
  ];
};

const resolveWithFallback = async (ipfsUri) => {
  const urls = buildGatewayUrls(ipfsUri);
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url);
      return { data: await res.json(), baseUrl: url.substring(0, url.lastIndexOf("/")) };
    } catch (e) {
      console.warn(`❗ Fallback: ${url} failed (${e.message})`);
    }
  }
  throw new Error("All IPFS gateways failed.");
};

export default function App() {
  const [account, setAccount] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNft, setSelectedNft] = useState(null);
  const [nftPrice, setNftPrice] = useState(null);
  const [status, setStatus] = useState("working");

  const { PulseMinter: pulseMinterAddress, PulseNFT: pulseNFTAddress, PulseToken: pulseTokenAddress } = contractAddresses;
  const { PulseMinter: pulseMinterAbi, PulseNFT: pulseNFTAbi, PulseToken: pulseTokenAbi } = contractAbis;

  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_PROVIDER_URL || "http://127.0.0.1:8545");

  // Check system status
  const checkStatus = async () => {
    try {
      // Check Hardhat node
      await provider.getBlockNumber();
      setStatus("alive");

      // Try Firebase connection
      try {
        const stateRef = doc(db, "system_state", "trigger_state");
        const stateDoc = await getDoc(stateRef);
        if (!stateDoc.exists()) {
          console.warn("System state not found in Firebase.");
        }
      } catch (err) {
        console.error("Firebase error:", err);
        setError("Failed to connect to Firebase.");
      }
    } catch (err) {
      console.error("Hardhat error:", err);
      setStatus("working");
      setError("Failed to connect to blockchain.");
    }
  };

  // Fetch chain data
  const fetchChainData = async () => {
    console.log("🔄 Loading data from blockchain...");
    setLoading(true);
    setError(null);

    try {
      const pulseMinter = new ethers.Contract(pulseMinterAddress, pulseMinterAbi, provider);
      const pulseNft = new ethers.Contract(pulseNFTAddress, pulseNFTAbi, provider);

      const priceFromContract = await pulseMinter.nftPrice();
      setNftPrice(priceFromContract);

      const nextTokenId = await pulseNft.nextTokenId();
      if (Number(nextTokenId) === 0) {
        setError("No NFTs minted yet.");
        setNfts([]);
        setLoading(false);
        return;
      }

      const fetchedNfts = [];
      const minterAddressLower = pulseMinterAddress.toLowerCase();

      for (let i = 0; i < Number(nextTokenId); i++) {
        try {
          const owner = (await pulseNft.ownerOf(i)).toLowerCase();
          if (owner !== minterAddressLower) continue;

          const tokenUri = await pulseNft.tokenURI(i);
          const { data: metadata, baseUrl } = await resolveWithFallback(tokenUri);

          let imageUrl = metadata.image || 'https://placehold.co/500x500/1a1a1a/ffffff?text=No+Image';
          if (metadata.image && metadata.image.startsWith("ipfs://")) {
            const imgName = metadata.image.split("/").pop();
            imageUrl = `${baseUrl}/${imgName}`;
          } else if (metadata.image && !metadata.image.startsWith("http")) {
            imageUrl = `${baseUrl}/${metadata.image}`;
          }

          fetchedNfts.push({
            id: i,
            name: metadata.name || `Pulse NFT #${i}`,
            description: metadata.description || "No description.",
            attributes: metadata.attributes || [],
            image: imageUrl,
            price: priceFromContract.toString(),
            contractAddress: pulseNFTAddress,
          });
        } catch (err) {
          console.warn(`⚠️ Could not process NFT #${i}:`, err.message);
          continue;
        }
      }

      if (fetchedNfts.length === 0) {
        setError("No NFTs available for sale.");
      }

      setNfts(fetchedNfts.reverse());
    } catch (err) {
      console.error("❌ Error loading blockchain data:", err);
      setError("Failed to load data. Check network connection.");
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this dApp.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      console.log(`✅ Wallet connected: ${accounts[0]}`);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet.");
    }
  };

  // Handle NFT purchase
  const handleBuyNft = async (tokenId, price) => {
    if (!account) {
      alert("Please connect your wallet to buy.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const pulseToken = new ethers.Contract(pulseTokenAddress, pulseTokenAbi, signer);
      const pulseMinter = new ethers.Contract(pulseMinterAddress, pulseMinterAbi, signer);

      console.log(`⏳ Initiating purchase of NFT #${tokenId}...`);
      console.log(`- Approving ${ethers.formatUnits(price, 18)} PULSE...`);
      const approveTx = await pulseToken.approve(pulseMinterAddress, price);
      await approveTx.wait();
      console.log("✅ Approval successful.");

      console.log("- Executing purchase...");
      const buyTx = await pulseMinter.buyNft(tokenId, 0);
      await buyTx.wait();

      alert(`🎉 Congratulations! You have successfully purchased NFT #${tokenId}.`);
      fetchChainData();
      setSelectedNft(null);
    } catch (err) {
      console.error("❌ Purchase error:", err);
      alert("NFT purchase failed. Check console for details.");
    }
  };

  // Initialize
  useEffect(() => {
    fetchChainData();
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <style>{globalStyles}</style>

      <Header account={account} connectWallet={connectWallet} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 2rem", borderBottom: "1px solid #2a2a2a" }}>
        <Navbar />
        <StatusDisplay status={status} />
      </div>

      <div style={{ minHeight: "400px", padding: "0 2rem", marginTop: "2rem" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Loader />
            <p style={{ marginTop: "1rem" }}>Loading data...</p>
          </div>
        )}
        {error && !loading && <ErrorMessage message={error} />}
        {!loading && !error && nfts.length > 0 && <NftGrid nfts={nfts} onNftClick={setSelectedNft} />}
      </div>

      <Footer />

      {selectedNft && (
        <NftModal
          nft={selectedNft}
          onClose={() => setSelectedNft(null)}
          onBuy={handleBuyNft}
        />
      )}
    </div>
  );
}