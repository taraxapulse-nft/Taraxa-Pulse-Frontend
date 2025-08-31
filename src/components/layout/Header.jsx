// src/components/layout/Header.jsx
import { theme } from "../../theme";

export default function Header({ account, connectWallet }) {
  return (
    <div style={{
      position: "relative",
      height: "150px", // A fixed height to reserve space
      marginBottom: "2rem",
      color: theme.text
    }}>
      {/* Wallet button and project description positioned top-right */}
      <div style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        fontSize: "0.9rem",
        textAlign: "right"
      }}>
        {/* Wallet button */}
        {!account ? (
          <button
            onClick={connectWallet}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "5px",
              border: `1px solid ${theme.accent}`,
              background: "transparent",
              color: theme.accent,
              cursor: "pointer",
            }}
          >
            Conectar Wallet
          </button>
        ) : (
          <span style={{ color: theme.accent }}>
            ✅ {account.slice(0, 6)}...
          </span>
        )}

        {/* Titles and slogan positioned in the top-left corner */}
        <div style={{
          position: "absolute",
          top: "70px",
          right: "40px",
          textAlign: "right"
        }}>
        {/* New project description below the wallet button */}
        <h1 style={{
          fontSize: "1rem",
          fontStyle: "italic",
          fontWeight: "normal",
          color: "white",
          width: "600px", // Set a fixed width to wrap the text
          marginTop: "0.5rem"
        }}>
          Taraxa Pulse merges on-chain activity with real-world data into a generative NFT collection, powered by DeFi under the hood.</h1>
        </div>
      </div>

      {/* Titles and slogan positioned in the top-left corner */}
      <div style={{
        position: "absolute",
        top: "-30px",
        left: "20px",
        textAlign: "left"
      }}>
        {/* Main Title: "Taraxa Pulse" with blinking pulse and larger size */}
        <h1 style={{
          fontSize: "4.8rem",
          fontWeight: "bold",
          fontStyle: "italic",
          color: "white",
          marginBottom: "-2rem",
          display: "flex",
          alignItems: "center"
        }}>
          Taraxa Pulse
          <span className="blinking-pulse"></span>
        </h1>
        {/* Slogan: "Bonding the Universe Onchain!" */}
        <h2 style={{
          fontSize: "2rem",
          fontStyle: "italic",
          fontWeight: "normal",
          color: theme.text,
          width: "max-content",
        }}>
          Bonding the Universe Onchain!
        </h2>
      </div>
    </div>
  );
}