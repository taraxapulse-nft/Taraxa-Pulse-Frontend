// src/components/layout/Navbar.jsx
import React from "react";
import { theme } from "../../theme";

export default function Navbar() {
  const links = ["My NFTs", "Marketplace", "See All", "Taraxa Pulse"];

  return (
    <nav style={{
      display: "flex",
      justifyContent: "flex-start",
      gap: "2rem",
      padding: "1rem",
      borderBottom: `1px solid ${theme.muted}`
    }}>
      {links.map(link => (
        <a key={link} href="#"
          style={{
            color: theme.text,
            textDecoration: "none",
            fontSize: "1rem"
          }}
        >
          {link}
        </a>
      ))}
    </nav>
  );
}