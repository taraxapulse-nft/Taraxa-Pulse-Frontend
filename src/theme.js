// src/theme.js
export const theme = {
  background: "#1c1c1cff",
  text: "#ffffff",
  accent: "#50fa7b",
  error: "#ff6e6e",
  highlight: "#89dceb",
  muted: "#777",
};

export const globalStyles = `
  body {
    background: ${theme.background};
    color: ${theme.text};
    font-family: 'JetBrains Mono', monospace;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    font-family: 'JetBrains Mono', monospace;
  }
  .blinking-pulse {
    display: inline-block;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    background-color: #26ff12ff; /* The cool green color */
    margin-left: 8px;
    animation: blink 1.2s infinite alternate;
  }
  @keyframes blink {
    from { opacity: 1; }
    to { opacity: 0.2; }
  }
`;

// A simple and modern console theme with a dark background and white text.
export const consoleTheme = {
  prompt: '#57fd0fff', // A subtle grey for the prompt symbol
  accent: '#a5ff12', // A vibrant, modern green for status messages
  error: '#ff4c4c',  // A clear red for error states
  background: '#202221', // A slightly cooler, more modern dark grey
  text: '#ffffff',   // White text for all output
};