// src/components/nfts/NftModal.jsx
import React from "react";
import { theme } from "../../theme";
import { ethers } from "ethers";

export default function NftModal({ nft, onClose, onBuy }) {
  if (!nft) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: theme.background,
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "600px",
        width: "90%",
        color: theme.text
      }}>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            color: theme.accent,
            float: "right",
            cursor: "pointer"
          }}
        >
          ×
        </button>
        <img src={nft.image} alt={nft.name}
          style={{ width: "100%", borderRadius: "8px" }} />
        <h3 style={{ color: theme.accent }}>{nft.name}</h3>
        <p>{nft.description}</p>
        <p><strong>Price:</strong> {ethers.formatUnits(nft.price, 18)} PULSE</p>
        <button
          onClick={() => onBuy(nft.id, nft.price)}
          style={{
            width: "100%",
            marginTop: "1rem",
            padding: "0.75rem",
            border: `1px solid ${theme.accent}`,
            background: "transparent",
            color: theme.accent,
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Buy NFT
        </button>
      </div>
    </div>
  );
}
