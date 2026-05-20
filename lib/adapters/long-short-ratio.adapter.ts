// ============================================================
// adapters/long-short-ratio.adapter.ts
// Proporção de contas compradas vs vendidas (Binance Futures)
// Fonte: Binance Futures public API (sem auth)
//
// Ratio > 1.5 = mercado lotado de longs = risco de queda.
// Ratio < 0.7 = mercado lotado de shorts = contrário bullish.
// ============================================================

import { LongShortRatioResult } from "../types/indicator";
import { fetchJson } from "../utils/http";

const URL = "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1h&limit=1";

interface BinanceLSResponse {
  longShortRatio: string;
  longAccount: string;
  shortAccount: string;
}

function scoreLongShort(ratio: number): number {
  if (ratio > 1.8)  return -2; // longs extremamente dominantes
  if (ratio > 1.5)  return -1; // longs em maioria — cautela
  if (ratio < 0.56) return  2; // shorts extremamente dominantes — contrário bullish
  if (ratio < 0.70) return  1; // shorts em maioria — contrário bullish leve
  return 0;
}

export async function fetchLongShortRatio(): Promise<LongShortRatioResult> {
  try {
    const data = await fetchJson<BinanceLSResponse[]>(URL);
    const entry = data[0];
    if (!entry) throw new Error("Sem dados de Long/Short Ratio");

    const ratio     = parseFloat(entry.longShortRatio);
    const longPct   = (parseFloat(entry.longAccount) * 100).toFixed(1);
    const shortPct  = (parseFloat(entry.shortAccount) * 100).toFixed(1);
    const score     = scoreLongShort(ratio);
    const scoreLabel = score > 0 ? `+${score}` : String(score);

    return {
      status: "success",
      score,
      summary: `${ratio.toFixed(2)} (${longPct}% longs / ${shortPct}% shorts) (${scoreLabel})`,
      value: { ratio, longPct: parseFloat(longPct), shortPct: parseFloat(shortPct) },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[long-short-ratio] Falha: ${message}`);
    return { status: "error", score: 0, summary: "indisponível (0)", error: message };
  }
}
