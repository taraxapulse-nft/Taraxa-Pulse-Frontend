export default function NftGrid({ nfts, onNftClick }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(nfts.length, 4)}, 1fr)`,
        gap: "1.5rem",
        justifyItems: "center",
      }}
    >
      {nfts.map((nft) => (
        <div
          key={nft.id}
          style={{
            width: "100%",
            maxWidth: "280px",
            cursor: "pointer",
          }}
          onClick={() => onNftClick(nft)}
        >
          <img
            src={nft.image}
            alt={nft.name}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "12px",
              objectFit: "cover",
            }}
          />
          <h3 style={{ marginTop: "0.5rem", textAlign: "center" }}>
            {nft.name}
          </h3>
        </div>
      ))}
    </div>
  );
}
