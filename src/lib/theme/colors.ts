export interface Theme {
  // Page
  pageBg: string;
  pageText: string;
  pageTextMuted: string;

  // Board
  boardBg: string;
  boardBorder: string;
  boardFelt: string;

  // Tiles
  tileFace: string;
  tileBack: string;
  tileBorder: string;
  tilePip: string;
  tileStarter: string;
  tileStarterBorder: string;

  // UI
  accentPrimary: string;
  accentHover: string;
  accentMuted: string;
  panelBg: string;
  panelBorder: string;
  surfaceBg: string;       // cards, panels — slightly lighter than pageBg
  surfaceBorder: string;   // subtle border for surfaces

  // Turn indicator
  turnActive: string;
  turnInactive: string;

  // Drop zones
  dropZone: string;
  dropZoneBorder: string;
  dropZoneHover: string;
  dropZoneHoverBorder: string;

  // Buttons
  btnDraw: string;
  btnDrawHover: string;
  btnPass: string;
  btnPassHover: string;
  btnPrimary: string;
  btnPrimaryHover: string;
}

export const darkTheme: Theme = {
  pageBg: "#0a0a0a",
  pageText: "#f8fafc",
  pageTextMuted: "#a1a1aa",

  boardBg: "#064e3b",
  boardBorder: "#047857",
  boardFelt: "rgba(255,255,255,0.1)",

  tileFace: "#faf9f6",
  tileBack: "#1a1a1a",
  tileBorder: "#2a2a2a",
  tilePip: "#1a1a2e",
  tileStarter: "#fef9c3",
  tileStarterBorder: "#ca8a04",

  accentPrimary: "#10b981",
  accentHover: "#34d399",
  accentMuted: "#065f46",
  panelBg: "#141414",
  panelBorder: "#222222",
  surfaceBg: "#1a1a1a",
  surfaceBorder: "#2a2a2a",

  turnActive: "#4ade80",
  turnInactive: "#333333",

  dropZone: "rgba(59, 130, 246, 0.2)",
  dropZoneBorder: "#60a5fa",
  dropZoneHover: "rgba(34, 197, 94, 0.4)",
  dropZoneHoverBorder: "#4ade80",

  btnDraw: "#d97706",
  btnDrawHover: "#f59e0b",
  btnPass: "#dc2626",
  btnPassHover: "#ef4444",
  btnPrimary: "#059669",
  btnPrimaryHover: "#10b981",
};

// Default export
export const theme = darkTheme;
