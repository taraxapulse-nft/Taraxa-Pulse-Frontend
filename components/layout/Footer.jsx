import React from "react";
import { theme } from "../../theme";

export default function Footer() {
  const links = ["Telegram", "Twitter", "Taraxa.io", "Fomo.biz"];

  return (
    <footer style={{
      marginTop: "4rem",
      padding: "1.5rem",
      textAlign: "center",
      color: theme.muted
    }}>
      {links.map(link => (
        <a key={link} href="#"
          style={{ margin: "0 1rem", color: theme.muted, textDecoration: "none" }}
        >
          {link}
        </a>
      ))}
    </footer>
  );
}
