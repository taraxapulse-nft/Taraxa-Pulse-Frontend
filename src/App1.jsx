// src/App.jsx

import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Importa los archivos de configuración generados por el script de despliegue.
import contractAddresses from './contract-addresses.json';
import contractAbis from './contract-abis.json';

// --- MODIFICACIÓN: Leer la configuración de Firebase desde variables de entorno ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// --- FIN DE LA MODIFICACIÓN ---

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Configuración de temas de consola ---
const consoleTheme = {
  background: 'linear-gradient(to bottom, #1e1e1e, #181818)',
  text: '#f8f8f2',
  accent: '#89dceb',
  border: '#44475a',
  error: '#ff6e6e',
  prompt: '#50fa7b',
  highlight: '#bd93f9',
};

// --- Estilos globales y animaciones ---
const globalStyles = `
  body {
    background: ${consoleTheme.background};
    color: ${consoleTheme.text};
    font-family: 'JetBrains Mono', monospace;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    font-family: 'JetBrains Mono', monospace;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseGlow {
    0% { text-shadow: 0 0 5px rgba(80, 250, 123, 0.5); }
    50% { text-shadow: 0 0 15px rgba(80, 250, 123, 1); }
    100% { text-shadow: 0 0 5px rgba(80, 250, 123, 0.5); }
  }
`;

// Helper para IPFS
const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://w3s.link/ipfs/",
  "https://gateway.pinata.cloud/ipfs/"
];

const resolveIpfsUrl = (url) => {
  if (!url) return ['/placeholder.png'];
  if (url.startsWith('ipfs://')) {
    const cidPath = url.replace('ipfs://', '');
    return IPFS_GATEWAYS.map(gateway => gateway + cidPath);
  }
  return [url];
};

// --- Componentes ---
const ThePulsePrompt = ({ status }) => {
  let statusColor = consoleTheme.prompt;
  if (status === 'minting') statusColor = consoleTheme.accent;
  if (status === 'error') statusColor = consoleTheme.error;

  return (
    <span style={{
      color: statusColor,
      marginRight: '5px',
      animation: status === 'minting' ? 'pulseGlow 1.5s infinite' : 'none',
    }}>
      the_pulse@taraxa-pulse:~$
    </span>
  );
};

const Header = ({ account, connectWallet }) => (
  <header style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 0',
    borderBottom: `1px solid ${consoleTheme.border}`,
  }}>
    <div style={{ textAlign: 'left' }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 500,
        color: consoleTheme.text,
        margin: '0',
        fontStyle: 'italic',
      }}>
        taraxa-pulse
      </h1>
      <p style={{
        fontSize: '0.8rem',
        color: consoleTheme.highlight,
        margin: '0',
      }}>
        on-chain monitor
      </p>
    </div>
    {account ? (
      <div style={{ border: `1px solid ${consoleTheme.accent}`, padding: '0.5rem 1rem', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: consoleTheme.accent }}>
          Connected: {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
        </p>
      </div>
    ) : (
      <button
        onClick={connectWallet}
        style={{
          backgroundColor: 'transparent',
          border: `1px solid ${consoleTheme.accent}`,
          color: consoleTheme.accent,
          padding: '0.5rem 1rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          borderRadius: '8px',
          transition: 'all 0.3s',
          boxShadow: `0 0 5px rgba(137, 220, 235, 0.5)`,
        }}
      >
        Connect Wallet
      </button>
    )}
  </header>
);

const Navbar = () => (
  <nav style={{
    padding: '0.75rem 0',
    borderBottom: `1px solid ${consoleTheme.border}`,
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '2rem',
  }}>
    <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
      <li><a href="#" style={{ color: consoleTheme.text, textDecoration: 'none', fontSize: '1rem' }}>My NFTs</a></li>
      <li><a href="#" style={{ color: consoleTheme.text, textDecoration: 'none', fontSize: '1rem' }}>Marketplace</a></li>
      <li><a href="#" style={{ color: consoleTheme.text, textDecoration: 'none', fontSize: '1rem' }}>See All</a></li>
      <li><a href="#" style={{ color: consoleTheme.text, textDecoration: 'none', fontSize: '1rem' }}>Taraxa Pulse</a></li>
    </ul>
  </nav>
);

const LiveMonitor = () => {
  const [triggerState, setTriggerState] = useState(null);
  const [latestBlock, setLatestBlock] = useState(null);
  const [countdown, setCountdown] = useState("Connecting to protocol...");

  const PHASE_1_TOTAL_NFTS = 90;
  const PHASE_1_CONSTANT_A = 0.003183;
  const PHASE_1_EXPONENT_ALPHA = 2.3;

  useEffect(() => {
    const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const unsub = onSnapshot(doc(db, "system_state", "trigger_state"), (docSnap) => {
      if (docSnap.exists()) {
        setTriggerState(docSnap.data());
      } else {
        console.log("System state document not found in Firebase.");
      }
    });

    const blockInterval = setInterval(async () => {
      try {
        const blockNumber = await localProvider.getBlockNumber();
        setLatestBlock(blockNumber);
      } catch (error) {
        // silenciar si no hay nodo
      }
    }, 5000);

    return () => {
      unsub();
      clearInterval(blockInterval);
    };
  }, []);

  useEffect(() => {
    if (!triggerState) {
      setCountdown("Awaiting system state...");
      return;
    }

    const countdownInterval = setInterval(() => {
      const nextNftId = triggerState.next_nft_id;

      if (nextNftId <= PHASE_1_TOTAL_NFTS) {
        const intervalHours = PHASE_1_CONSTANT_A * Math.pow(nextNftId, PHASE_1_EXPONENT_ALPHA);
        const intervalMillis = intervalHours * 3600 * 1000;
        const lastMintTime = triggerState.last_mint_timestamp.toMillis();
        const targetTime = lastMintTime + intervalMillis;
        const now = Date.now();
        const millisRemaining = targetTime - now;

        if (millisRemaining <= 0) {
          setCountdown("MINTING IN PROGRESS...");
        } else {
          const hours = Math.floor(millisRemaining / 3600000);
          const minutes = Math.floor((millisRemaining % 3600000) / 60000);
          const seconds = Math.floor((millisRemaining % 60000) / 1000);
          setCountdown(`Time remaining: ${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        if (latestBlock === null) {
          setCountdown("Syncing with blockchain...");
          return;
        }
        const blocksProcessed = latestBlock - triggerState.last_mint_block;
        const blocksRemaining = 4560 - blocksProcessed;

        if (blocksRemaining <= 0) {
          setCountdown("MINTING IN PROGRESS...");
        } else {
          setCountdown(`${blocksRemaining} blocks remaining for next Pulse...`);
        }
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [triggerState, latestBlock]);

  const monitorStatus = countdown.includes("MINTING") ? 'minting' : 'idle';

  return (
    <div style={{
      padding: '1.5rem 0',
      borderBottom: `1px solid ${consoleTheme.border}`,
      overflowY: 'auto',
      fontSize: '1rem',
      textAlign: 'left',
      width: '100%',
      backgroundColor: 'transparent',
      marginBottom: '2rem'
    }}>
      <ThePulsePrompt status={monitorStatus} /> <span style={{ color: consoleTheme.text }}>STATUS: MONITORING TARAXA LOCALNET...</span>
      <br />
      <ThePulsePrompt status={monitorStatus} /> <span style={{ color: consoleTheme.text }}>LATEST BLOCK: <span style={{ color: consoleTheme.highlight }}>{latestBlock || '...'}</span></span>
      <br />
      {triggerState && (
        <>
          <ThePulsePrompt status={monitorStatus} /> <span style={{ color: consoleTheme.text }}>NEXT NFT ID: <span style={{ color: consoleTheme.error }}>#{triggerState.next_nft_id || '...'}</span></span>
          <br />
        </>
      )}
      <br />
      <ThePulsePrompt status={monitorStatus} /> <span style={{ color: consoleTheme.accent }}>
        [NEXT MINT]: {countdown}
      </span>
    </div>
  );
};

const Footer = () => (
  <footer style={{
    marginTop: '4rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${consoleTheme.border}`,
    textAlign: 'center',
    color: consoleTheme.highlight,
  }}>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
      <a href="#" style={{ color: consoleTheme.highlight, textDecoration: 'none' }}>Telegram</a>
      <a href="#" style={{ color: consoleTheme.highlight, textDecoration: 'none' }}>Twitter</a>
      <a href="#" style={{ color: consoleTheme.highlight, textDecoration: 'none' }}>Taraxa.io</a>
      <a href="#" style={{ color: consoleTheme.highlight, textDecoration: 'none' }}>Fomo.biz</a>
    </div>
  </footer>
);

const NftModal = ({ nft, onClose, onBuy }) => {
  if (!nft) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: consoleTheme.background,
        border: `1px solid ${consoleTheme.border}`,
        padding: '2rem',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto',
        color: consoleTheme.highlight,
        borderRadius: '8px',
        display: 'flex',
        gap: '2rem',
        flexDirection: 'row',
      }}>
        <div style={{ flex: '1' }}>
          <img
            src={nft.image}
            alt={nft.name}
            style={{ width: '100%', height: 'auto', border: `1px solid ${consoleTheme.accent}`, borderRadius: '8px' }}
            onError={(e) => { e.target.src = 'https://placehold.co/250x250/1e1e1e/c9d1d9?text=Image+Not+Found'; }}
          />
        </div>
        <div style={{ flex: '1', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: consoleTheme.accent, margin: 0 }}>{nft.name}</h3>
              <button onClick={onClose} style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: consoleTheme.accent,
                cursor: 'pointer',
                fontSize: '1.5rem'
              }}>
                &times;
              </button>
            </div>
            <p style={{ marginTop: 0 }}>{nft.description}</p>
            <div style={{ borderTop: `1px solid ${consoleTheme.border}`, paddingTop: '1rem', marginTop: '1rem' }}>
              <p><strong>ID:</strong> {nft.id}</p>
              <p><strong>Trait:</strong> {nft.attributes.find(attr => attr.trait_type === 'Primary Pick')?.value}</p>
              <p><strong>Source:</strong> {nft.attributes.find(attr => attr.trait_type === 'Source')?.value}</p>
              <p><strong>Contract Address:</strong> {nft.contractAddress.substring(0, 6)}...{nft.contractAddress.substring(nft.contractAddress.length - 4)}</p>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <p style={{ fontSize: '1.2rem', color: consoleTheme.text }}><strong>Price:</strong> {ethers.formatUnits(nft.price, 18)} PULSE</p>
            <button onClick={() => onBuy(nft.id, nft.price)} style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: `1px solid ${consoleTheme.accent}`,
              color: consoleTheme.accent,
              padding: '0.75rem',
              cursor: 'pointer',
              marginTop: '1rem',
              fontFamily: 'inherit',
              borderRadius: '8px'
            }}>
              Buy NFT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Componente Principal de la Aplicación ---
export default function App() {
  const [account, setAccount] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNft, setSelectedNft] = useState(null);
  const [hoveredNftId, setHoveredNftId] = useState(null);
  const fetchIntervalRef = useRef(null);

  // --- MODIFICACIÓN IMPORTANTE: AHORA USAMOS contractConfig PARA LAS DIRECCIONES ---
  const pulseMinterAddress = contractAddresses.PulseMinter;
  const pulseNFTAddress = contractAddresses.PulseNFT;
  const pulseTokenAddress = contractAddresses.PulseToken;
  // --- FIN DE LA MODIFICACIÓN ---

  const pulseMinterAbi = contractAbis.PulseMinter;
  const pulseNFTAbi = contractAbis.PulseNFT;
  const pulseTokenAbi = contractAbis.PulseToken;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
      } catch (error) {
        console.error("Error connecting to MetaMask", error);
      }
    } else {
      alert("Please install MetaMask to use this DApp.");
    }
  };

  const fetchNfts = async () => {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    try {
      setLoading(true);
      const pulseMinter = new ethers.Contract(pulseMinterAddress, pulseMinterAbi, provider);
      const pulseNft = new ethers.Contract(pulseNFTAddress, pulseNFTAbi, provider);

      const nextTokenId = Number(await pulseNft.nextTokenId());
      if (nextTokenId === 0) {
        setError("No NFTs minted yet.");
        setNfts([]);
        return;
      }

      const fetched = [];
      for (let i = 0; i < nextTokenId; i++) {
        const price = await pulseMinter.nftPrices(i);
        if (Number(price) > 0) {
          const tokenUri = await pulseNft.tokenURI(i);
          const res = await fetch(tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/"));
          const metadata = await res.json();
          fetched.push({
            id: i,
            name: metadata.name,
            description: metadata.description,
            attributes: metadata.attributes || [],
            image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
            price: price.toString(),
            contractAddress: pulseNFTAddress,
          });
        }
      }
      setNfts(fetched.reverse());
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching NFTs.");
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };


  const handleBuyNft = async (tokenId, price) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }

    if (tokenId === undefined || tokenId === null) {
      alert("NFT ID is undefined. Cannot buy.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const pulseToken = new ethers.Contract(pulseTokenAddress, pulseTokenAbi, signer);
      const pulseMinter = new ethers.Contract(pulseMinterAddress, pulseMinterAbi, signer);
      const pulseNFT = new ethers.Contract(pulseNFTAddress, pulseNFTAbi, signer);

      const nftOwner = await pulseNFT.ownerOf(tokenId);
      // --- CAMBIO ÚNICO: Usamos nftPrice() en lugar de nftPrices(tokenId) ---
      const nftPrice = await pulseMinter.nftPrice();

      console.log("✅ NFT ID:", tokenId);
      console.log("🔹 Owner:", nftOwner);
      console.log("🔹 Price (wei):", nftPrice.toString());

      if (nftOwner.toLowerCase() !== pulseMinterAddress.toLowerCase()) {
        alert("This NFT is no longer for sale or does not exist.");
        fetchNfts();
        closeModal();
        return;
      }
      
      if (nftOwner.toLowerCase() === account.toLowerCase()) {
        alert("You cannot buy an NFT you already own.");
        closeModal();
        return;
      }
      
      const allowance = await pulseToken.allowance(account, pulseMinterAddress);
      if (allowance < nftPrice) {
        alert("Approval required. Please confirm the transaction in your wallet to approve spending.");
        const approvalTx = await pulseToken.approve(pulseMinterAddress, nftPrice);
        await approvalTx.wait();
        alert("Token approval successful. You can now proceed with the purchase.");
      }

      console.log("✅ Estimación de gas exitosa. Procediendo con la compra...");
      const buyTx = await pulseMinter.connect(signer).buyNft(tokenId, 0); // Asegurarse de conectar el signer
      await buyTx.wait();

      alert(`NFT #${tokenId} bought successfully!`);
      fetchNfts(); // Recargar la lista de NFTs después de la compra
      closeModal();

    } catch (err) {
      console.error("Error buying NFT:", err);
      let errorMessage = "Failed to buy NFT. Check console for details.";
      if (err.reason) {
        errorMessage = `Failed to buy NFT: ${err.reason}`;
      } else if (err.message && err.message.includes("user rejected transaction")) {
        errorMessage = "Transaction rejected by user.";
      }
      alert(errorMessage);
    }
  };

  const openModal = (nft) => setSelectedNft(nft);
  const closeModal = () => setSelectedNft(null);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px', // permite 3–4 columnas grandes
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      <style>{globalStyles}</style>
      <Header account={account} connectWallet={connectWallet} />
      <Navbar />
      <LiveMonitor />

      <main style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', textAlign: 'left', marginTop: '2rem' }}>
          <h2 style={{ color: consoleTheme.accent, marginBottom: '1rem', fontSize: '1.5rem', borderBottom: `1px solid ${consoleTheme.border}`, paddingBottom: '0.5rem' }}>
            Available NFTs
          </h2>

          {loading ? (
            <p>Loading NFTs...</p>
          ) : error ? (
            <p style={{ color: consoleTheme.error }}>{error}</p>
          ) : nfts.length === 0 ? (
            <p>No NFTs available for sale.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', // 3–4 columnas grandes
              gap: '2rem',
              padding: '1rem 0'
            }}>
              {nfts.map(nft => {
                const hovered = hoveredNftId === nft.id;
                return (
                  <div
                    key={nft.id}
                    onClick={() => openModal(nft)}
                    onMouseEnter={() => setHoveredNftId(nft.id)}
                    onMouseLeave={() => setHoveredNftId(null)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      border: `1px solid ${consoleTheme.border}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#1e1e1e',
                      boxShadow: hovered ? '0 8px 20px rgba(137,220,235,0.3)' : '0 4px 15px rgba(0,0,0,0.5)',
                      transform: hovered ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                    }}
                  >
                    <img
                      src={nft.image}
                      alt={nft.name}
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderBottom: `1px solid ${consoleTheme.border}`
                      }}
                    />
                    <div style={{ padding: '1rem', textAlign: 'center', color: consoleTheme.text }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: consoleTheme.accent }}>#{nft.id}</h3>
                      <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem' }}>
                        {ethers.formatUnits(nft.price, 18)} PULSE
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedNft && <NftModal nft={selectedNft} onClose={closeModal} onBuy={handleBuyNft} />}
    </div>
  );
}
