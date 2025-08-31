// src/components/nfts/NftCard.jsx
import React from "react";
import { theme } from "../../theme";
import { ethers } from "ethers";

export default function NftCard({ nft, onClick }) {
  return (
    <div
      onClick={() => onClick(nft)}
      style={{
        cursor: "pointer",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "transform 0.2s ease",
      }}
    >
      <img
        src={nft.image}
        alt={nft.name}
        style={{ width: "100%", display: "block" }}
        onError={(e) => (e.target.src = "/placeholder.png")}
      />
      <div style={{ textAlign: "center", padding: "0.5rem" }}>
        <h3 style={{ margin: 0, color: theme.accent }}>#{nft.id}</h3>
        <p style={{ margin: 0 }}>
          {ethers.formatUnits(nft.price, 18)} PULSE
        </p>
      </div>
    </div>
  );
}
