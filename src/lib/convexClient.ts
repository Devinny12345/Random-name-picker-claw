import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Single shared Convex client for the app.
// Falls back to the preview deployment so Vercel builds work without manual env setup.
// Override in Vercel dashboard → Settings → Environment Variables → VITE_CONVEX_URL
export const convexUrl: string =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) ||
  "https://bright-mink-448.convex.cloud";

export const convex = new ConvexClient(convexUrl);

export type ListSummary = {
  _id: string;
  name: string;
  listCode: string;
  createdAt: number;
  count: number;
};

export type LoadedList = {
  _id: string;
  name: string;
  listCode: string;
  createdAt: number;
  names: { id: string; name: string; colorIndex: number }[];
  history: {
    id: string;
    name: string;
    colorIndex: number;
    theme: string;
    createdAt: number;
  }[];
};
