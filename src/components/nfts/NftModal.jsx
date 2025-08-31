export default function NftModal({ nft, onClose, onBuy }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "1.5rem",
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "row", // 👉 horizontal
          gap: "1.5rem",
        }}
      >
        {/* Imagen */}
        <img
          src={nft.image}
          alt={nft.name}
          style={{
            maxHeight: "400px",
            width: "auto",
            borderRadius: "8px",
          }}
        />

        {/* Info */}
        <div style={{ overflowY: "auto" }}>
          <h2>{nft.name}</h2>
          <p>{nft.description}</p>
          <button onClick={() => onBuy(nft.id, nft.price)}>Comprar</button>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
