// ============================================================
// signal-engine/pipeline.ts
// Orquestra o fluxo completo do Signal Engine.
// raw indicators → score → composite rules → regime → playbook → TacticalSignal
// ============================================================

import { gatherReport } from "../cli/index";
import { evaluateCompositeRules } from "../rules/composite-rules";
import { classifyRegime, riskLevelForRegime, actionBiasForRegime } from "../rules/regime-classifier";
import { selectPlaybook } from "../playbooks/playbook-selector";
import { buildInterpretation, formatInterpretation } from "../domain/interpretation";
import {
  TacticalSignal,
  IndicatorScore,
} from "../shared/types/signal";
import { AllIndicators } from "../types/indicator";

function indicatorsToScores(ind: AllIndicators): IndicatorScore[] {
  const entries: Array<[string, { score?: number; summary?: string; status: string }]> = [
    ["Medo & Ganância",   ind.fearGreed],
    ["Taxa de Funding",   ind.fundingRate],
    ["Variação 7d",       ind.weeklyCandle],
    ["Open Interest",     ind.openInterest],
    ["Liq. de Longs",     ind.liquidations],
    ["MVRV",              ind.mvrv],
    ["Preço Realizado",   ind.realizedPrice],
    ["Mayer Multiple",    ind.mayerMultiple],
    ["Hash Ribbon",       ind.hashRibbon],
    ["Pressão venda",     ind.sellerPressure],
    ["Médias Móveis",     ind.movingAverages],
    ["ETF Institucional", ind.etfFlow],
    ["Regime de Mercado", ind.marketRegime],
    ["Sinais Compostos",  ind.compositeSignal],
  ];

  return entries.map(([name, r]) => ({
    name,
    score: r.status === "success" ? (r.score ?? 0) : 0,
    summary: r.summary ?? "indisponível",
  }));
}

export async function runSignalEngine(): Promise<TacticalSignal> {
  const { btcPrice, indicators, score } = await gatherReport();

  const triggeredRules = evaluateCompositeRules(indicators);
  const regime         = classifyRegime(score.weightedTotal, triggeredRules);
  const playbook       = selectPlaybook(regime);

  const regimeKind    = indicators.marketRegime.value?.regime ?? "neutral";
  const compositeKind = indicators.compositeSignal.value?.kind ?? "none";
  const interp        = buildInterpretation(indicators, score, regimeKind, compositeKind);
  const summary       = formatInterpretation(interp);

  return {
    asset:          "BTC",
    generatedAt:    new Date().toISOString(),
    btcPrice,
    score:          { raw: score.rawTotal, weighted: score.weightedTotal },
    regime,
    riskLevel:      riskLevelForRegime(regime),
    actionBias:     actionBiasForRegime(regime),
    indicators:     indicatorsToScores(indicators),
    triggeredRules,
    playbook,
    summary,
  };
}
