import React from "react";
import { theme } from "../../theme";

export default function Header({ account, connectWallet }) {
  return (
    <header style={{ padding: "2rem 1rem", textAlign: "left" }}>
      <h1 style={{
        fontSize: "2.5rem",
        fontWeight: 600,
        fontStyle: "italic",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: theme.text,
      }}>
        Taraxa Pulse
        <span style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: theme.accent,
          display: "inline-block",
          animation: "pulseDot 1.5s infinite"
        }}></span>
      </h1>
      <p style={{ color: "#aaa", marginTop: "0.5rem", fontStyle: "italic" }}>
        Bonding the universe on chain!
      </p>

      {account ? (
        <p style={{ marginTop: "1rem", color: theme.accent }}>
          Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.2rem",
            border: `1px solid ${theme.accent}`,
            background: "transparent",
            color: theme.accent,
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
}
