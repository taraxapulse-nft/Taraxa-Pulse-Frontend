import React from "react";

export default function PulseStatusBar({
  status = "working",
  currentBlock,
  targetBlock,
  timeRemaining,
}) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div
      style={{
        fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
        fontSize: "12px",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: "4px 0",
        color: "#e5e7eb",
      }}
    >
      <span style={{ color: "#22c55e" }}>the_pulse</span>
      <span style={{ color: "#8b5cf6" }}>:~$</span>
      <span style={{ marginLeft: 8 }}>Status: {statusLabel}.</span>
      <span style={{ marginLeft: 12 }}>
        Current Block: {currentBlock ?? "..."} |{" "}
        {timeRemaining
          ? `Time to next mint: ${timeRemaining}`
          : `Target for next mint: ${targetBlock ?? "..."}`}
      </span>
    </div>
  );
}