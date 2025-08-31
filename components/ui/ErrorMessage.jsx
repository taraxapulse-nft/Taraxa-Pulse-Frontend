// src/components/ui/ErrorMessage.jsx
import React from "react";
import { theme } from "../../theme";

export default function ErrorMessage({ message }) {
  return (
    <p style={{
      backgroundColor: theme.error,
      color: "#fff",
      padding: "0.75rem 1rem",
      borderRadius: "6px",
      textAlign: "center"
    }}>
      {message}
    </p>
  );
}
