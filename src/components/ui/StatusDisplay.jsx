// src/components/ui/StatusDisplay.jsx
import React from "react";

export default function StatusDisplay({ status }) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div
      style={{
        fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
        fontSize: "12px",
        color: status === "alive" ? "#22c55e" : "#e5e7eb",
        padding: "4px 8px",
      }}
    >
      System: {statusLabel}
    </div>
  );
}