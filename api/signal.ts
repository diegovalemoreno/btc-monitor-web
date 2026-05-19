import type { VercelRequest, VercelResponse } from "@vercel/node";
import { runSignalEngine } from "btc-monitor";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=60");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signal = await runSignalEngine();
    return res.status(200).json(signal);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signal engine error";
    console.error("[API /signal]", message);
    return res.status(503).json({ error: message });
  }
}
