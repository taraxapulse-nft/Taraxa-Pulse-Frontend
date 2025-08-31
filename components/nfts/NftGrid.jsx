// src/components/nfts/NftGrid.jsx
import React from "react";
import NftCard from "./NftCard";

export default function NftGrid({ nfts, onNftClick }) {
  if (!nfts || nfts.length === 0) {
    return <p>No NFTs available.</p>;
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.5rem",
      marginTop: "1.5rem"
    }}>
      {nfts.map(nft => (
        <NftCard key={nft.id} nft={nft} onClick={onNftClick} />
      ))}
    </div>
  );
}
