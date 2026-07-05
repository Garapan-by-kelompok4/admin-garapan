/** Design-handoff palette — matches `--brand-500` and donut scale in globals.css */
export const CHART_BRAND_STROKE = "#2047C9";
export const CHART_AXIS_STROKE = "#94A3B8";
export const TRANSACTION_AREA_GRADIENT_ID = "transaction-area-gradient";

export const DONUT_COLORS = [
  "#2047C9",
  "#4A68E0",
  "#7E95F0",
  "#B6C3F9",
  "#DCE4FD",
] as const;

export const SPARKLINE_COLORS = {
  brand: "#2047C9",
  success: "#10B981",
  warn: "#F59E0B",
  danger: "#EF4444",
} as const;

export const chartTooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #E5E9F0",
  fontSize: "12px",
  fontFamily: "Inter",
} as const;
