/**
 * Application constants & theme tokens
 */

export const COLORS = {
  brand: {
    g1: "#0A9863",
    g2: "#06D07A",
    g3: "#034F04",
    background: "#F8F4F0",
  },
  dark: "#110D31",
  white: {
    100: "#FFFFFF",
    90: "#F6F6F6",
    80: "#ECECEC",
    70: "#E9E9E9",
  },
  state: {
    red: "#F94C4C",
    green: "#57C439",
    blue: "#4C94F9",
    yellow: "#FFD84A",
  },
} as const;

export const APP_CONFIG = {
  name: "DPS CMS",
  description: "Content Management System for DPS",
  version: "0.1.0",
} as const;

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
} as const;
