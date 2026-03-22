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
  pageBg: "#0a0a0a",          // near black
  pageText: "#f8fafc",        // slate-50
  pageTextMuted: "#94a3b8",   // slate-400

  boardBg: "#064e3b",         // emerald-900
  boardBorder: "#047857",     // emerald-700
  boardFelt: "rgba(255,255,255,0.1)",

  tileFace: "#faf9f6",
  tileBack: "#1a1a1a",        // dark gray
  tileBorder: "#2a2a2a",      // dark gray
  tilePip: "#1a1a2e",
  tileStarter: "#fef9c3",     // yellow-100
  tileStarterBorder: "#ca8a04", // yellow-600

  accentPrimary: "#10b981",   // emerald-500
  accentHover: "#34d399",     // emerald-400
  accentMuted: "#065f46",     // emerald-800
  panelBg: "#141414",         // dark gray
  panelBorder: "#222222",     // dark gray

  turnActive: "#4ade80",      // green-400
  turnInactive: "#333333",    // dark gray

  dropZone: "rgba(59, 130, 246, 0.2)",
  dropZoneBorder: "#60a5fa",  // blue-400
  dropZoneHover: "rgba(34, 197, 94, 0.4)",
  dropZoneHoverBorder: "#4ade80", // green-400

  btnDraw: "#d97706",         // amber-600
  btnDrawHover: "#f59e0b",    // amber-500
  btnPass: "#dc2626",         // red-600
  btnPassHover: "#ef4444",    // red-500
  btnPrimary: "#059669",      // emerald-600
  btnPrimaryHover: "#10b981", // emerald-500
};

// Default export
export const theme = darkTheme;
